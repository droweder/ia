
import { supabase } from './supabaseClient';

export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterResponse {
  choices: {
    message: OpenRouterMessage;
  }[];
  model: string;
}

export const chatWithOpenRouterViaEdge = async (
  model: string,
  messages: OpenRouterMessage[]
): Promise<OpenRouterResponse | null> => {
    try {
        console.log("Invoking chat-completion with model:", model); // Debug log

        // Supabase Functions automatically parse JSON response if successful (2xx)
        // If 4xx/5xx, it throws an error which contains the body if it was JSON.
        const { data, error } = await supabase.functions.invoke('chat-completion', {
            body: {
                model,
                messages,
            },
        });

        if (error) {
            console.error('Supabase Function Error Details:', error);

            // Try to extract a structured error message from the response if available
            // 'error' here is a FunctionsHttpError or similar
            // It often has a context property or we can try to parse the message
            if (error.context && error.context.json) {
                const errorBody = await error.context.json();
                console.error("Function Error Body:", errorBody);
                throw errorBody; // Throw the actual JSON error object
            }

            throw error;
        }

        console.log("Function response data:", data); // Debug log
        return data as OpenRouterResponse;
    } catch (error) {
        console.error("Failed to invoke chat-completion:", error);
        throw error; // Re-throw so the UI can handle it
    }
};
