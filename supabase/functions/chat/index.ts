import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    const { data: { user }, error: authError } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      console.error("Auth error:", authError);
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await req.json().catch(e => {
        console.error("Failed to parse request body:", e);
        throw new Error('Invalid JSON request body');
    });

    const { messages, systemPrompt } = data;

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
    }

    const { data: profileData, error: profileError } = await supabaseClient
      .schema('planintex')
      .from('profiles')
      .select('empresa_id')
      .eq('id', user.id)
      .single();

    if (profileError) {
      console.error('Failed to fetch profile for token usage:', profileError);
    }

    const companyId: string | null = profileData?.empresa_id ?? null;

    if (companyId) {
      const now = new Date();
      const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0)).toISOString();

      const { data: userQuotaRows } = await supabaseClient
        .schema('droweder_ia')
        .from('token_quotas')
        .select('token_limit')
        .eq('period', 'monthly')
        .eq('user_id', user.id)
        .limit(1);

      const userTokenLimit = userQuotaRows?.[0]?.token_limit ?? null;

      let companyTokenLimit: number | null = null;
      if (userTokenLimit == null) {
        const { data: companyQuotaRows } = await supabaseClient
          .schema('droweder_ia')
          .from('token_quotas')
          .select('token_limit')
          .eq('period', 'monthly')
          .eq('company_id', companyId)
          .is('user_id', null)
          .limit(1);

        companyTokenLimit = companyQuotaRows?.[0]?.token_limit ?? null;
      }

      const limitToApply = userTokenLimit ?? companyTokenLimit;

      if (limitToApply != null) {
        const { data: usedRows, error: usedError } = await supabaseClient
          .schema('droweder_ia')
          .from('token_usage_events')
          .select('total_tokens,created_at')
          .eq('company_id', companyId)
          .gte('created_at', monthStart);

        if (usedError) {
          console.error('Failed to compute current token usage:', usedError);
        } else {
          const used = (usedRows || []).reduce((acc: number, row: any) => acc + Number(row?.total_tokens || 0), 0);
          if (used >= Number(limitToApply)) {
            return new Response(JSON.stringify({ error: 'Token quota exceeded for current period' }), {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 402,
            });
          }
        }
      }
    }

    const OPENROUTER_API_KEY = Deno.env.get('VITE_OPENROUTER_API_KEY') || Deno.env.get('OPENROUTER_API_KEY');

    if (!OPENROUTER_API_KEY) {
      console.error('Server missing OpenRouter API key configuration');
      throw new Error('Server missing OpenRouter API key configuration');
    }

    const payloadMessages = [];
    if (systemPrompt) {
        payloadMessages.push({ role: "system", content: systemPrompt });
    }
    payloadMessages.push(...messages);


    console.log("Sending request to OpenRouter (Auto Fallback)", { messageCount: payloadMessages.length });

    // Configuração de Fallback: OpenRouter tentará os modelos nesta ordem.
    // Garantindo uso apenas de modelos gratuitos de alta performance.
            const fallbackModels = [
      'meta-llama/llama-3.3-70b-instruct:free',
      'mistralai/mistral-small-3.1-24b-instruct:free',
      'openrouter/free'
    ];

        const requestBody = {
      model: fallbackModels.join(','),
      messages: payloadMessages,
      stream: true,
      include_usage: true
    };

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://droweder-ai.com',
        'X-Title': 'DRoweder IA',
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
        const errText = await response.text();
        console.error("OpenRouter API error:", response.status, errText);

        // Try to parse error message if JSON
        let errMsg = `OpenRouter API error: ${response.status}`;
        try {
            const errJson = JSON.parse(errText);
            if (errJson.error && errJson.error.message) {
                errMsg = `OpenRouter: ${errJson.error.message}`;
            }
        } catch (e) { console.error('Error parsing error JSON', e); }

        throw new Error(errMsg);
    }

    if (!response.body) {
      throw new Error('OpenRouter returned an empty response body');
    }

    const upstreamReader = response.body.getReader();
    const textDecoder = new TextDecoder();
    let buffer = '';
    let usage:
      | {
          prompt_tokens?: number;
          completion_tokens?: number;
          total_tokens?: number;
          cost?: number;
        }
      | undefined;
    let modelUsed: string | undefined;

    const stream = new ReadableStream<Uint8Array>({
      async start(controller) {
        try {
          while (true) {
            const { value, done } = await upstreamReader.read();
            if (done) break;
            if (value) {
              controller.enqueue(value);

              buffer += textDecoder.decode(value, { stream: true });
              const lines = buffer.split('\n');
              buffer = lines.pop() ?? '';

              for (const line of lines) {
                const trimmedLine = line.trim();
                if (trimmedLine === '' || trimmedLine === 'data: [DONE]') continue;
                if (!trimmedLine.startsWith('data: ')) continue;

                const payload = trimmedLine.substring(6);
                if (payload === '[DONE]') continue;

                try {
                  const chunk = JSON.parse(payload);
                  if (chunk.model) modelUsed = chunk.model;
                  if (chunk.usage) usage = chunk.usage;
                } catch {
                  void 0;
                }
              }
            }
          }
        } catch (e) {
          console.error('Error streaming from OpenRouter:', e);
        } finally {
          try {
            controller.close();
          } catch {
            void 0;
          }

          try {
            upstreamReader.releaseLock();
          } catch {
            void 0;
          }

          try {
            const totalTokens = Number(usage?.total_tokens ?? 0);
            const promptTokens = Number(usage?.prompt_tokens ?? 0);
            const completionTokens = Number(usage?.completion_tokens ?? 0);
            const costBrl = 0;

            if (companyId && totalTokens > 0) {
              const { error: usageInsertError } = await supabaseClient
                .schema('droweder_ia')
                .from('token_usage_events')
                .insert({
                  company_id: companyId,
                  user_id: user.id,
                  model_used: modelUsed ?? fallbackModels[0],
                  prompt_tokens: promptTokens,
                  completion_tokens: completionTokens,
                  total_tokens: totalTokens,
                  cost_brl: costBrl,
                });

              if (usageInsertError) {
                console.error('Failed to insert token usage event:', usageInsertError);
              }
            }
          } catch (e) {
            console.error('Failed to persist token usage:', e);
          }
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: unknown) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
