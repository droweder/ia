import React from 'react';
import { Sparkles, Bot, ShieldCheck } from 'lucide-react';

export const MODELS = [
  { id: 'free', name: 'Automático (Gratuito)', description: 'Modelos rápidos e gratuitos', isPaid: false },
  { id: 'auto', name: 'Automático (Pago)', description: 'O melhor modelo disponível pago', isPaid: true },
  { id: 'openai/gpt-4o', name: 'GPT-4o (Pago)', description: 'Mais inteligente, OpenAI', isPaid: true },
  { id: 'anthropic/claude-3.5-sonnet', name: 'Claude 3.5 Sonnet (Pago)', description: 'Excelente para código, Anthropic', isPaid: true }
];

interface ModelSelectorProps {
  selectedModelId: string;
  setSelectedModelId: (id: string) => void;
  showModelMenu: boolean;
  setShowModelMenu: (show: boolean) => void;
  modelMenuRef: React.RefObject<HTMLDivElement | null>;
}

export const ModelSelector: React.FC<ModelSelectorProps> = ({
  selectedModelId,
  setSelectedModelId,
  showModelMenu,
  setShowModelMenu,
  modelMenuRef,
}) => {
  const selectedModel = MODELS.find(m => m.id === selectedModelId);

  return (
    <div className="absolute top-4 left-4 z-20" ref={modelMenuRef}>
      <button
        onClick={() => setShowModelMenu(!showModelMenu)}
        className={`flex items-center justify-center w-9 h-9 rounded-full bg-white/40 dark:bg-white/5 hover:bg-white/10 backdrop-blur-xl border border-slate-200 dark:border-white/10 transition-all shadow-sm group ${showModelMenu ? 'ring-2 ring-blue-500/50' : ''}`}
        title={`Modelo: ${selectedModel?.name || 'Automático'}`}
      >
        <Sparkles 
          size={18} 
          className={`${selectedModelId !== 'free' ? 'text-blue-500' : 'text-slate-500 dark:text-gray-400'} group-hover:scale-110 transition-transform`} 
        />
      </button>

      {showModelMenu && (
        <div className="absolute top-full left-0 mt-2 w-64 bg-white/90 dark:bg-[#0B0F19]/90 backdrop-blur-xl border border-slate-200 dark:border-white/10 rounded-xl shadow-lg overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="p-2 border-b border-slate-200 dark:border-white/10">
            <p className="text-xs font-semibold text-slate-500 dark:text-gray-400 uppercase tracking-wider pl-2">Selecione o Modelo</p>
          </div>
          <div className="p-2 flex flex-col gap-1 max-h-[300px] overflow-y-auto scrollbar-thin scrollbar-thumb-blue-800 hover:scrollbar-thumb-blue-700">
            {MODELS.map(model => (
              <button
                key={model.id}
                onClick={() => {
                  setSelectedModelId(model.id);
                  setShowModelMenu(false);
                }}
                className={`w-full flex items-center justify-between p-2 rounded-lg transition-colors text-left
                  ${selectedModelId === model.id
                    ? 'bg-blue-500/10 border border-blue-500/20'
                    : 'hover:bg-white/40 dark:bg-white/5 border border-transparent'
                  }
                `}
              >
                <div className="flex items-center gap-3">
                  <div className={`p-1.5 rounded-md ${selectedModelId === model.id ? 'bg-blue-500/20 text-blue-400' : 'bg-white/40 dark:bg-white/5 text-slate-500 dark:text-gray-400'}`}>
                    <Bot size={16} />
                  </div>
                  <div className="flex flex-col">
                    <span className={`text-sm font-medium ${selectedModelId === model.id ? 'text-blue-400' : 'text-slate-700 dark:text-gray-200'}`}>
                      {model.name}
                    </span>
                    <span className="text-xs text-gray-500">
                      {model.description}
                    </span>
                  </div>
                </div>
                {selectedModelId === model.id && <ShieldCheck size={16} className="text-blue-500" />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
