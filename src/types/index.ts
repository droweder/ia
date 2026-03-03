export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface OpenRouterResponse {
  id?: string;
  choices: {
    message: OpenRouterMessage;
  }[];
  model: string;
}
