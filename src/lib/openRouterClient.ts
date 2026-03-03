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
    const requestBody = {
      model: model,
      messages: messages,
    };
    console.log("OpenRouter API Request:", JSON.stringify(requestBody, null, 2));

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
        "HTTP-Referer": "https://droweder-ai.com", // Site URL
        "X-Title": "DRoweder AI", // Site Title
        "Content-Type": "application/json"
      },
      body: JSON.stringify(requestBody)
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

    const responseData = await response.json();
    console.log("OpenRouter API Response:", JSON.stringify(responseData, null, 2));
    return responseData;
  } catch (error: any) {
    console.error("Failed to fetch from OpenRouter:", error);
    // Lançar o erro para ser tratado no componente (Chat.tsx),
    // permitindo exibir no log ou banner do app em vez de inserir como mensagem
    throw error;
  }
};
