import { useState } from 'react';
import { Search as SearchIcon, MessageSquare, Calendar, FolderArchive } from 'lucide-react';
import { useNavigate, useOutletContext } from 'react-router-dom';

interface OutletContextType {
  conversations: any[];
}

export default function Search() {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();
  const { conversations } = useOutletContext<OutletContextType>();

  let results = [];
  if (query.trim()) {
    const lowerQuery = query.toLowerCase();
    results = conversations.filter(
      (c) =>
        c.title?.toLowerCase().includes(lowerQuery) ||
        c.project?.name?.toLowerCase().includes(lowerQuery)
    );
  } else {
    results = conversations;
  }

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-transparent transition-colors duration-200">
      {/* Header */}
      <div className="h-14 border-b border-slate-200 dark:border-white/10 flex items-center justify-between bg-white/50 dark:bg-white/5 backdrop-blur-md px-4 shadow-sm z-10 shrink-0">
        <div className="flex items-center gap-3 flex-1">
          <SearchIcon size={20} className="text-gray-400 shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar em todos os chats e projetos..."
            className="flex-1 bg-transparent border-none focus:outline-none text-base text-slate-800 dark:text-white placeholder-gray-500"
            autoFocus
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-blue-800 p-6">
        <div className="max-w-4xl mx-auto">
            {results.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="w-16 h-16 bg-white dark:bg-white/5 rounded-full flex items-center justify-center mb-4 border border-slate-200 dark:border-white/10">
                        <SearchIcon size={24} className="text-gray-500" />
                    </div>
                    <h3 className="text-lg font-medium text-slate-800 dark:text-white mb-2">Nenhum resultado encontrado</h3>
                    <p className="text-gray-400 max-w-md">Não encontramos nenhum chat ou projeto correspondente a "{query}".</p>
                </div>
            ) : (
                <div className="grid gap-3">
                    {results.map((chat) => (
                    <button
                        key={chat.id}
                        onClick={() => navigate(`/chat/${chat.id}`)}
                        className="flex items-center justify-between p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 transition-colors text-left group"
                    >
                        <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center shrink-0 border border-blue-500/30">
                                <MessageSquare size={20} />
                            </div>
                            <div className="flex flex-col min-w-0">
                                <span className="text-base font-medium text-slate-800 dark:text-white truncate">
                                    {chat.title}
                                </span>
                                {chat.project && (
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <FolderArchive size={14} className="text-gray-400" />
                                        <span className="text-sm text-gray-400 truncate">
                                            {chat.project.name}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500 opacity-60 group-hover:opacity-100 transition-opacity whitespace-nowrap shrink-0 pl-4">
                            <Calendar size={14} />
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
