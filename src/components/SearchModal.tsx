import { useState } from 'react';
import { Search, X, MessageSquare, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversations: any[];
}

export function SearchModal({ isOpen, onClose, conversations }: SearchModalProps) {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  if (!isOpen) return null;

  let results = [];
  if (query.trim()) {
    const lowerQuery = query.toLowerCase();
    results = conversations.filter(
      (c) =>
        c.title?.toLowerCase().includes(lowerQuery) ||
        c.project?.name?.toLowerCase().includes(lowerQuery)
    );
  } else {
    results = conversations.slice(0, 10);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-[#212121] text-slate-800 dark:text-gray-200 w-full max-w-[600px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header / Input */}
        <div className="flex items-center gap-3 p-4 border-b border-slate-200 dark:border-white/10">
          <Search size={20} className="text-slate-500 dark:text-gray-400 shrink-0 ml-2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar em chats..."
            className="flex-1 bg-transparent border-none focus:outline-none text-base text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-500"
            autoFocus
          />
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:text-gray-500 dark:hover:text-gray-300 rounded-md transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto p-2">
          {results.length === 0 ? (
             <div className="p-8 text-center text-slate-500 dark:text-gray-400">
                <p>Nenhum chat encontrado para "{query}"</p>
             </div>
          ) : (
             <div className="flex flex-col gap-1">
                 {results.map((chat) => (
                    <button
                        key={chat.id}
                        onClick={() => {
                            navigate(`/chat/${chat.id}`);
                            onClose();
                        }}
                        className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-100 dark:hover:bg-white/5 transition-colors text-left group"
                    >
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-white/5 flex items-center justify-center text-slate-500 dark:text-gray-400 shrink-0">
                                <MessageSquare size={18} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-sm font-medium text-slate-800 dark:text-white truncate">
                                    {chat.title}
                                </span>
                                {chat.project && (
                                    <span className="text-xs text-slate-500 dark:text-gray-400 truncate">
                                        Projeto: {chat.project.name}
                                    </span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                            <Calendar size={12} />
                            <span>{new Date(chat.created_at).toLocaleDateString('pt-BR')}</span>
                        </div>
                    </button>
                 ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
