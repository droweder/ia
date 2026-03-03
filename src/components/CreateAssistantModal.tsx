import { useState } from 'react';
import { Settings, X, Lightbulb, Bot, Briefcase, Code, GraduationCap, PenTool } from 'lucide-react';

interface CreateAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, description?: string, instructions?: string) => void;
}

export function CreateAssistantModal({ isOpen, onClose, onCreate }: CreateAssistantModalProps) {
  const [assistantName, setAssistantName] = useState('');
  const [assistantDescription, setAssistantDescription] = useState('');
  const [assistantInstructions, setAssistantInstructions] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    if (assistantName.trim()) {
      onCreate(assistantName.trim(), assistantDescription.trim(), assistantInstructions.trim());
      setAssistantName('');
      setAssistantDescription('');
      setAssistantInstructions('');
      onClose();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setAssistantName(suggestion);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#212121] text-slate-800 dark:text-gray-200 w-full max-w-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-semibold">Criar assistente</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white/10">
              <Settings size={20} />
            </button>
            <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white/10">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 flex flex-col gap-6">

          {/* Inputs */}
          <div className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Nome do Assistente <span className="text-red-500">*</span></label>
                <div className="relative group">
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-400 group-focus-within:text-slate-800 dark:group-focus-within:text-white transition-colors">
                    <Bot size={20} className="rounded-full border-2 border-current p-[2px]" />
                    </div>
                    <input
                    type="text"
                    value={assistantName}
                    onChange={(e) => setAssistantName(e.target.value)}
                    placeholder="Ex: Analista de Dados"
                    className="w-full bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none focus:border-slate-300 dark:focus:border-gray-400 transition-colors shadow-sm"
                    autoFocus
                    />
                </div>
            </div>

            <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Descrição</label>
                 <input
                    type="text"
                    value={assistantDescription}
                    onChange={(e) => setAssistantDescription(e.target.value)}
                    placeholder="Ex: Especialista em analisar relatórios de vendas"
                    className="w-full bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl py-2 px-4 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none focus:border-slate-300 dark:focus:border-gray-400 transition-colors shadow-sm text-sm"
                 />
            </div>

            <div>
                 <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-1">Instruções Personalizadas</label>
                 <textarea
                    value={assistantInstructions}
                    onChange={(e) => setAssistantInstructions(e.target.value)}
                    placeholder="O que este assistente deve saber e como deve se comportar? Ex: Aja como um analista de dados. Sempre responda em formato de tópicos e forneça resumos estatísticos."
                    rows={4}
                    className="w-full bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl py-2 px-4 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none focus:border-slate-300 dark:focus:border-gray-400 transition-colors shadow-sm text-sm resize-none scrollbar-thin"
                 />
            </div>
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-3">
            <button
                onClick={() => handleSuggestionClick('Analista de Dados')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-sm transition-colors text-sm font-medium text-slate-800 dark:text-white shadow-sm">
              <Briefcase size={16} className="text-emerald-500 dark:text-emerald-400" />
              Analista
            </button>
            <button
                 onClick={() => handleSuggestionClick('Revisor de Código')}
                 className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-sm transition-colors text-sm font-medium text-slate-800 dark:text-white shadow-sm">
              <Code size={16} className="text-blue-500 dark:text-blue-400" />
              Desenvolvedor
            </button>
            <button
                onClick={() => handleSuggestionClick('Tutor de Matemática')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-sm transition-colors text-sm font-medium text-slate-800 dark:text-white shadow-sm">
              <GraduationCap size={16} className="text-purple-500 dark:text-purple-400" />
              Tutor
            </button>
            <button
                onClick={() => handleSuggestionClick('Criador de Conteúdo')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-sm transition-colors text-sm font-medium text-slate-800 dark:text-white shadow-sm">
              <PenTool size={16} className="text-amber-500 dark:text-amber-400" />
              Criador
            </button>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            <Lightbulb size={24} className="text-amber-500 dark:text-gray-300 shrink-0 mt-1" />
            <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
              Os assistentes são versões personalizadas da IA. Você pode dar a eles instruções específicas e conhecimentos para ajudá-lo com tarefas particulares.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 pt-2 flex justify-end border-t border-slate-200 dark:border-white/10 mt-2">
          <button
            onClick={handleCreate}
            disabled={!assistantName.trim()}
            className="px-6 py-2.5 mt-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-semibold text-sm disabled:opacity-50 disabled:bg-slate-200 disabled:dark:bg-gray-600 disabled:text-slate-500 disabled:dark:text-gray-400 transition-all hover:opacity-90 active:scale-95"
          >
            Criar assistente
          </button>
        </div>

      </div>
    </div>
  );
}
