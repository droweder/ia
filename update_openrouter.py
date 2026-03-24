import re

with open("src/lib/openRouterClient.ts", "r") as f:
    content = f.read()

# Replace the entire file contents
new_content = """import { supabase } from './supabase';

export interface StreamCallbacks {
  onUpdate: (text: string) => void;
  onError: (error: string) => void;
  onDone: (finalText: string) => void;
}

export const chatWithOpenRouterStream = async (
  messages: any[],
  systemPrompt: string | undefined,
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
        systemPrompt
      }),
    });

    if (!response.ok) {
      let errText = "Erro desconhecido ao contatar IA";
      try { errText = await response.text(); } catch(e) {}
      throw new Error(`Erro na API (${response.status}): ${errText}`);
    }

    if (!response.body) throw new Error("Nenhum corpo de resposta retornado pela IA");

    // Read the Server-Sent Events stream
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let accumulatedText = "";

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      const lines = chunk.split('\\n');

      for (const line of lines) {
        if (line.trim() === '' || line.trim() === 'data: [DONE]') continue;
        if (line.startsWith('data: ')) {
          try {
            const data = JSON.parse(line.substring(6));
            if (data.choices && data.choices[0] && data.choices[0].delta && data.choices[0].delta.content) {
                accumulatedText += data.choices[0].delta.content;
                callbacks.onUpdate(accumulatedText);
            }
          } catch (e) {
            console.error("Error parsing stream chunk:", e, "Line was:", line);
          }
        }
      }
    }

    callbacks.onDone(accumulatedText);

  } catch (error: any) {
    console.error("Streaming error:", error);
    callbacks.onError(error.message || "Erro desconhecido");
  }
};
"""

with open("src/lib/openRouterClient.ts", "w") as f:
    f.write(new_content)

print("Updated openRouterClient.ts with streaming")
