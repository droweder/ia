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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#212121] text-gray-200 w-full max-w-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4">
          <h2 className="text-xl font-semibold">Criar projeto</h2>
          <div className="flex items-center gap-2">
            <button className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10">
              <Settings size={20} />
            </button>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10">
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="px-6 pb-6 flex flex-col gap-6">

          {/* Input */}
          <div className="relative group">
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-white transition-colors">
              <User size={20} className="rounded-full border-2 border-current p-[2px]" />
            </div>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              placeholder="Viagem a Copenhague"
              className="w-full bg-[#212121] border border-gray-600 rounded-xl py-3 pl-12 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-gray-400 transition-colors"
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
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-600/60 hover:border-gray-500 hover:bg-white/5 transition-colors text-sm font-medium">
              <CircleDollarSign size={16} className="text-green-500" />
              Investimentos
            </button>
            <button
                 onClick={() => handleSuggestionClick('Dever de casa')}
                 className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-600/60 hover:border-gray-500 hover:bg-white/5 transition-colors text-sm font-medium">
              <GraduationCap size={16} className="text-blue-500" />
              Dever de casa
            </button>
            <button
                onClick={() => handleSuggestionClick('Escrita')}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-600/60 hover:border-gray-500 hover:bg-white/5 transition-colors text-sm font-medium">
              <PenTool size={16} className="text-purple-500" />
              Escrita
            </button>
            <button
                onClick={() => handleSuggestionClick('Viagem')}
                className="flex items-center gap-2 px-4 py-2 rounded-full border border-gray-600/60 hover:border-gray-500 hover:bg-white/5 transition-colors text-sm font-medium">
              <Plane size={16} className="text-yellow-500" />
              Viagem
            </button>
          </div>

          {/* Info Box */}
          <div className="flex items-start gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
            <Lightbulb size={24} className="text-gray-300 shrink-0 mt-1" />
            <p className="text-sm text-gray-300 leading-relaxed">
              Os projetos mantêm chats, arquivos e instruções personalizadas em um só lugar. Use-os para trabalhos em andamento ou apenas para manter as coisas organizadas.
            </p>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 pt-2 flex justify-end">
          <button
            onClick={handleCreate}
            disabled={!projectName.trim()}
            className="px-6 py-2.5 rounded-full bg-white text-black font-semibold text-sm disabled:opacity-50 disabled:bg-gray-600 disabled:text-gray-400 transition-all hover:opacity-90 active:scale-95"
          >
            Criar projeto
          </button>
        </div>

      </div>
    </div>
  );
}
