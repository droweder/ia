import { AuroraModalBackground } from './AuroraModalBackground';
import { useState } from 'react';
import { X, Lightbulb, CircleDollarSign, GraduationCap, PenTool, Plane } from 'lucide-react';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (name: string, category?: string) => void;
}

export function CreateProjectModal({ isOpen, onClose, onCreate }: CreateProjectModalProps) {
  const [projectName, setProjectName] = useState('');

  if (!isOpen) return null;

  const handleCreate = () => {
    if (projectName.trim()) {
      onCreate(projectName.trim());
      setProjectName('');
      onClose();
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setProjectName(suggestion);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm p-4">
      <div className="relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-gray-200 w-full max-w-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <AuroraModalBackground />

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-white/10">
          <h2 className="text-xl font-semibold">Criar Projeto</h2>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-slate-800 dark:text-white transition-colors rounded-lg hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6">

          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">Nome do projeto</label>
            <div className="relative group">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Ex: Viagem a Copenhague"
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-slate-800 dark:text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-[#3b82f6] focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#3b82f6] transition-colors shadow-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                }}
              />
            </div>
          </div>

          {/* Suggestions */}
          <div>
            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Sugestões</p>
            <div className="flex flex-wrap gap-2">
              <button
                  onClick={() => handleSuggestionClick('Investimentos')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 bg-white/5 backdrop-blur-xl transition-colors text-sm text-gray-300 shadow-sm">
                <CircleDollarSign size={14} className="text-emerald-500" />
                Investimentos
              </button>
              <button
                   onClick={() => handleSuggestionClick('Dever de casa')}
                   className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 bg-white/5 backdrop-blur-xl transition-colors text-sm text-gray-300 shadow-sm">
                <GraduationCap size={14} className="text-blue-500" />
                Dever de casa
              </button>
              <button
                  onClick={() => handleSuggestionClick('Escrita')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 bg-white/5 backdrop-blur-xl transition-colors text-sm text-gray-300 shadow-sm">
                <PenTool size={14} className="text-blue-500" />
                Escrita
              </button>
              <button
                  onClick={() => handleSuggestionClick('Viagem')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 bg-white/5 backdrop-blur-xl transition-colors text-sm text-gray-300 shadow-sm">
                <Plane size={14} className="text-amber-500" />
                Viagem
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 text-blue-800 dark:text-blue-200">
            <Lightbulb size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">
              Os projetos mantêm chats, arquivos e instruções em um só lugar. Use-os para trabalhos em andamento ou para organizar seu contexto.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-black/20 flex justify-end gap-3 border-t border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-medium text-sm text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={!projectName.trim()}
            className="px-5 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-600 text-slate-800 dark:text-white text-sm font-medium transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Criar projeto
          </button>
        </div>

      </div>
    </div>
  );
}
