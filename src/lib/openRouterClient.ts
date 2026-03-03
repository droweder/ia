import type { OpenRouterMessage, OpenRouterResponse } from '../types';

const OPENROUTER_API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY;

export const chatWithOpenRouter = async (
  model: string,
  messages: OpenRouterMessage[]
): Promise<OpenRouterResponse | null> => {
  if (!OPENROUTER_API_KEY) {
    console.error('OpenRouter API Key is missing');
    // Return a mock response if API key is missing to prevent UI crash
    return {
      id: 'mock-id',
      choices: [{
        message: {
          role: 'assistant',
          content: '⚠️ Chave da API do OpenRouter não configurada. Configure a variável de ambiente VITE_OPENROUTER_API_KEY.'
        }
      }]
    } as any;
  }

  try {
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://droweder-ai.com", // Site URL
        "X-Title": "DRoweder AI", // Site Title
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
      })
    });

    if (!response.ok) {
        let errorMessage = response.statusText;
        try {
            const errorData = await response.json();
            console.error("OpenRouter API Error JSON:", errorData);
            if (errorData.error && errorData.error.message) {
                errorMessage = errorData.error.message;
            }
        } catch (e) {
            console.error("OpenRouter API Error Text:", await response.text());
        }

        // Se for erro de autenticação (401), retornar uma mensagem amigável
        if (response.status === 401) {
             return {
                id: 'error-id',
                choices: [{
                  message: {
                    role: 'assistant',
                    content: '⚠️ Erro de Autenticação na API do OpenRouter (401). Verifique se a sua chave API é válida.'
                  }
                }]
             } as any;
        }
        throw new Error(`OpenRouter API Error: ${errorMessage}`);
    }

    return await response.json();
  } catch (error: any) {
    console.error("Failed to fetch from OpenRouter:", error);
    // Retornar a mensagem de erro para o usuário em vez de falhar silenciosamente
    return {
      id: 'error-id',
      choices: [{
        message: {
          role: 'assistant',
          content: `⚠️ Ocorreu um erro ao comunicar com a IA: ${error.message || 'Erro desconhecido'}.`
        }
      }]
    } as any;
  }
};
