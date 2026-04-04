import { supabase } from './supabaseClient';

export interface StreamCallbacks {
  onUpdate: (text: string) => void;
  onError: (error: string) => void;
  onDone: (finalText: string, usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number }) => void;
}

export const chatWithOpenRouterStream = async (
  messages: any[],
  systemPrompt: string | undefined,
  model: string,
  callbacks: StreamCallbacks
) => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session?.access_token) throw new Error("Não autenticado");

    // Call our secure edge function
    const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${session.access_token}`
      },
      body: JSON.stringify({
        messages,
        systemPrompt,
        model
      }),
    });

    if (!response.ok) {
      let errText = "Erro desconhecido ao contatar IA";
      try { errText = await response.text(); } catch (e) { console.error('Error reading response text', e); }
      throw new Error(`Erro na API (${response.status}): ${errText}`);
    }

    if (!response.body) throw new Error("Nenhum corpo de resposta retornado pela IA");

    // Read the Server-Sent Events stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";
    let buffer = "";
    let usage: { prompt_tokens: number; completion_tokens: number; total_tokens: number } | undefined;

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');

      // Keep the last incomplete line in the buffer
      buffer = lines.pop() || "";

      for (const line of lines) {
        const trimmedLine = line.trim();
        if (trimmedLine === '' || trimmedLine === 'data: [DONE]') continue;
        
        if (trimmedLine.startsWith('data: ')) {
          try {
            const data = JSON.parse(trimmedLine.substring(6));
            
            // Check for usage info (usually in the last chunk)
            if (data.usage) {
              usage = {
                prompt_tokens: data.usage.prompt_tokens,
                completion_tokens: data.usage.completion_tokens,
                total_tokens: data.usage.total_tokens
              };
            }

            if (data.choices?.[0]?.delta?.content) {
                accumulatedText += data.choices[0].delta.content;
                callbacks.onUpdate(accumulatedText);
            }
          } catch (e) {
            console.error("Error parsing stream chunk:", e, "Line was:", trimmedLine);
          }
        } else if (trimmedLine.startsWith('{')) {
          // Handle potential JSON error response instead of data stream
          try {
            const errorData = JSON.parse(trimmedLine);
            if (errorData.error) {
              throw new Error(errorData.error.message || "Erro retornado pela API");
            }
          } catch (e) {
            // Not a JSON error, continue
          }
        }
      }
    }

    callbacks.onDone(accumulatedText, usage);

  } catch (error: any) {
    console.error("Streaming error:", error);
    callbacks.onError(error.message || "Erro desconhecido");
  }
};
