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

interface FunctionErrorWithContext {
  message?: string;
  context?: {
    json?: () => Promise<unknown>;
  };
}

const isFunctionErrorWithContext = (value: unknown): value is FunctionErrorWithContext => {
  if (!value || typeof value !== 'object') return false;
  return 'message' in value || 'context' in value;
};

export const chatWithOpenRouterViaEdge = async (
  model: string,
  messages: OpenRouterMessage[]
): Promise<OpenRouterResponse | null> => {
  try {
    console.log('Invoking chat-completion with model:', model);

    const { data, error } = await supabase.functions.invoke('chat-completion', {
      body: {
        model,
        messages,
      },
    });

    if (error) {
      console.error('Supabase Function Error Details:', error);

      if (isFunctionErrorWithContext(error) && error.context?.json) {
        const errorBody = await error.context.json();
        console.error('Function Error Body:', errorBody);
        throw errorBody;
      }

      throw error;
    }

    console.log('Function response data:', data);
    return data as OpenRouterResponse;
  } catch (error) {
    console.error('Failed to invoke chat-completion:', error);
    throw error;
  }
};
