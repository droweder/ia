export interface OpenRouterMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  model_used?: string;
  sql_query?: string;
  created_at?: string;
}

export interface Conversation {
  id: string;
  user_id: string;
  company_id: string;
  title: string;
  assistant_id?: string | null;
  created_at?: string;
}

export interface Assistant {
  id: string;
  name: string;
  description?: string;
  instructions?: string;
  company_id: string;
  avatar_url?: string;
}

export interface OpenRouterResponse {
  id?: string;
  choices: {
    message: OpenRouterMessage;
  }[];
  model: string;
}
