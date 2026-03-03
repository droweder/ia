import { useState } from 'react';
import { Settings, X, Lightbulb, User, CircleDollarSign, GraduationCap, PenTool, Plane } from 'lucide-react';

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
      <div className="bg-white dark:bg-[#212121] text-slate-800 dark:text-gray-200 w-full max-w-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-semibold">Criar projeto</h2>
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

          {/* Input */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 dark:text-gray-400 group-focus-within:text-slate-800 dark:group-focus-within:text-white transition-colors">
              <User size={20} className="rounded-full border-2 border-current p-[2px]" />
            </div>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Viagem a Copenhague"
              className="w-full bg-white/40 dark:bg-white/5 backdrop-blur-sm border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-12 pr-4 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none focus:border-slate-300 dark:focus:border-gray-400 transition-colors shadow-sm"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleCreate();
              }}
            />
          </div>

          {/* Suggestions */}
          <div className="flex flex-wrap gap-3">
            <button
                onClick={() => handleSuggestionClick('Investimentos')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-sm transition-colors text-sm font-medium text-slate-800 dark:text-white shadow-sm">
              <CircleDollarSign size={16} className="text-emerald-500 dark:text-emerald-400" />
              Investimentos
            </button>
            <button
                 onClick={() => handleSuggestionClick('Dever de casa')}
                 className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-sm transition-colors text-sm font-medium text-slate-800 dark:text-white shadow-sm">
              <GraduationCap size={16} className="text-blue-500 dark:text-blue-400" />
              Dever de casa
            </button>
            <button
                onClick={() => handleSuggestionClick('Escrita')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-sm transition-colors text-sm font-medium text-slate-800 dark:text-white shadow-sm">
              <PenTool size={16} className="text-purple-500 dark:text-purple-400" />
              Escrita
            </button>
            <button
                onClick={() => handleSuggestionClick('Viagem')}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 bg-white/40 dark:bg-white/5 backdrop-blur-sm transition-colors text-sm font-medium text-slate-800 dark:text-white shadow-sm">
              <Plane size={16} className="text-amber-500 dark:text-amber-400" />
              Viagem
            </button>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5">
            <Lightbulb size={24} className="text-amber-500 dark:text-gray-300 shrink-0 mt-1" />
            <p className="text-sm text-slate-600 dark:text-gray-300 leading-relaxed">
              Os projetos mantêm chats, arquivos e instruções personalizadas em um só lugar. Use-os para trabalhos em andamento ou apenas para manter as coisas organizadas.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 pt-2 flex justify-end border-t border-slate-200 dark:border-white/10 mt-2">
          <button
            onClick={handleCreate}
            disabled={!projectName.trim()}
            className="px-6 py-2.5 mt-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-black font-semibold text-sm disabled:opacity-50 disabled:bg-slate-200 disabled:dark:bg-gray-600 disabled:text-slate-500 disabled:dark:text-gray-400 transition-all hover:opacity-90 active:scale-95"
          >
            Criar projeto
          </button>
        </div>

      </div>
    </div>
  );
}
