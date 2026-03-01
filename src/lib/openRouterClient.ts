import { chatWithOpenRouterViaEdge } from './openRouterEdge';
import type { OpenRouterMessage, OpenRouterResponse } from './openRouterEdge';

/**
 * Compat layer: mantém a assinatura antiga, mas executa via Edge Function.
 * A chave do OpenRouter não deve ficar no frontend.
 */
export const chatWithOpenRouter = async (
  model: string,
  messages: OpenRouterMessage[]
): Promise<OpenRouterResponse | null> => {
  return chatWithOpenRouterViaEdge(model, messages);
};
