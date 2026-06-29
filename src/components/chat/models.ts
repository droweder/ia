export interface ChatModelOption {
  id: string;
  name: string;
  description: string;
  isPaid: boolean;
}

export const MODELS: ChatModelOption[] = [
  { id: 'free', name: 'Automático (Gratuito)', description: 'Modelos rápidos e gratuitos', isPaid: false },
  { id: 'auto', name: 'Automático (Pago)', description: 'O melhor modelo disponível pago', isPaid: true },
  { id: 'openai/gpt-4o', name: 'GPT-4o (Pago)', description: 'Mais inteligente, OpenAI', isPaid: true },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Pago)', description: 'Excelente para código, Anthropic', isPaid: true },
];
