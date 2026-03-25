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

    const { messages, systemPrompt, model } = data;

    if (!messages || !Array.isArray(messages)) {
      throw new Error('Messages array is required');
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

    const targetModel = model || 'google/gemini-2.0-flash-exp:free';
    console.log("Sending request to OpenRouter", { model: targetModel, messageCount: payloadMessages.length });

    const requestBody: any = {
      model: targetModel,
      messages: payloadMessages,
      stream: true,
    };

    // Add web search plugin for models that support it
    if (targetModel.includes('google/') || targetModel.includes('perplexity/')) {
       requestBody.plugins = [
        {
          id: "web",
          max_results: 5
        }
      ];
    }

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
        } catch(e) {}

        throw new Error(errMsg);
    }

    return new Response(response.body, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error: any) {
    console.error("Function error:", error);
    return new Response(JSON.stringify({ error: error.message || 'Unknown error' }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
