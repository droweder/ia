import re
file_path = "src/components/CreateProjectModal.tsx"
with open(file_path, "r") as f:
    content = f.read()

# I will rewrite CreateProjectModal.tsx to match the requested style.
# The user wants "Ajuste o estilo da tela de criação de projetos".
# Usually, ChatGPT style modals are centered, clean, with less backdrop-blur noise inside the modal itself.
# Right now it has `bg-white/40 dark:bg-white/5 backdrop-blur-sm` everywhere inside the modal.
# I'll replace it with a more solid, clean design.

new_content = """import { useState } from 'react';
import { X, Lightbulb, User, CircleDollarSign, GraduationCap, PenTool, Plane } from 'lucide-react';

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#212121] text-slate-800 dark:text-gray-200 w-full max-w-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200 border border-slate-200 dark:border-white/10">

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-200 dark:border-white/10">
          <h2 className="text-xl font-semibold">Criar Projeto</h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 flex flex-col gap-6">

          {/* Input */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">Nome do projeto</label>
            <div className="relative group">
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Ex: Viagem a Copenhague"
                className="w-full bg-slate-50 dark:bg-[#2A2A2A] border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-1 focus:ring-blue-500 dark:focus:ring-blue-400 transition-colors shadow-sm"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleCreate();
                }}
              />
            </div>
          </div>

          {/* Suggestions */}
          <div>
            <p className="text-xs font-medium text-slate-500 dark:text-gray-400 uppercase tracking-wider mb-3">Sugestões</p>
            <div className="flex flex-wrap gap-2">
              <button
                  onClick={() => handleSuggestionClick('Investimentos')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 bg-white dark:bg-transparent transition-colors text-sm text-slate-600 dark:text-gray-300 shadow-sm">
                <CircleDollarSign size={14} className="text-emerald-500" />
                Investimentos
              </button>
              <button
                   onClick={() => handleSuggestionClick('Dever de casa')}
                   className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 bg-white dark:bg-transparent transition-colors text-sm text-slate-600 dark:text-gray-300 shadow-sm">
                <GraduationCap size={14} className="text-blue-500" />
                Dever de casa
              </button>
              <button
                  onClick={() => handleSuggestionClick('Escrita')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 bg-white dark:bg-transparent transition-colors text-sm text-slate-600 dark:text-gray-300 shadow-sm">
                <PenTool size={14} className="text-purple-500" />
                Escrita
              </button>
              <button
                  onClick={() => handleSuggestionClick('Viagem')}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 bg-white dark:bg-transparent transition-colors text-sm text-slate-600 dark:text-gray-300 shadow-sm">
                <Plane size={14} className="text-amber-500" />
                Viagem
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30 text-blue-800 dark:text-blue-200">
            <Lightbulb size={20} className="shrink-0 mt-0.5" />
            <p className="text-sm leading-relaxed">
              Os projetos mantêm chats, arquivos e instruções em um só lugar. Use-os para trabalhos em andamento ou para organizar seu contexto.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 dark:bg-[#1E1E1E] flex justify-end gap-3 border-t border-slate-200 dark:border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-medium text-sm text-slate-600 dark:text-gray-300 hover:bg-slate-200 dark:hover:bg-white/10 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleCreate}
            disabled={!projectName.trim()}
            className="px-5 py-2.5 rounded-xl bg-blue-600 dark:bg-blue-600 text-white font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition-colors shadow-sm"
          >
            Criar projeto
          </button>
        </div>

      </div>
    </div>
  );
}
"""

with open(file_path, "w") as f:
    f.write(new_content)
