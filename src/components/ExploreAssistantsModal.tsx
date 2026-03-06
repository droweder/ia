import { useState } from 'react';
import { X, Search, Bot, Pencil, Trash2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

interface ExploreAssistantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assistants: any[];
  onSelectAssistant: (assistantId: string) => void;
  onEditAssistant?: (assistant: any) => void;
  onDeleteAssistant?: (assistantId: string) => void;
}

export function ExploreAssistantsModal({ isOpen, onClose, assistants, onSelectAssistant, onEditAssistant, onDeleteAssistant }: ExploreAssistantsModalProps) {
  const [query, setQuery] = useState('');
  const { user } = useAuth();

  if (!isOpen) return null;

  const lowerQuery = query.toLowerCase();
  const results = assistants.filter(
    (a) =>
      a.name?.toLowerCase().includes(lowerQuery) ||
      a.description?.toLowerCase().includes(lowerQuery)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 dark:bg-slate-900/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-800/90 text-slate-800 dark:text-gray-200 w-full max-w-[800px] h-[80vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        {/* Header */}
        <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-200 dark:border-white/10 shrink-0">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Bot size={24} className="text-[#7e639f]" />
            Explorar Assistentes
          </h2>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        {/* Search Input */}
        <div className="p-6 pb-0 shrink-0">
           <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Buscar assistentes..."
                    className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl py-3 pl-11 pr-4 text-slate-800 dark:text-white placeholder-slate-500 dark:placeholder-gray-500 focus:outline-none focus:border-[#7e639f] dark:focus:border-[#7e639f] transition-colors"
                />
           </div>
        </div>

        {/* Results Grid */}
        <div className="flex-1 overflow-y-auto p-6">
          {results.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-slate-500 dark:text-gray-400">
                <Bot size={48} className="mb-4 opacity-50" />
                <p>Nenhum assistente encontrado para "{query}"</p>
             </div>
          ) : (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                 {results.map((assistant) => (
                    <div
                        key={assistant.id}
                        className="flex flex-col p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/5 hover:border-[#7e639f]/50 dark:hover:border-[#7e639f]/50 hover:shadow-md transition-all group"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className="w-10 h-10 rounded-lg bg-[#7e639f]/10 text-[#7e639f] flex items-center justify-center shrink-0 group-hover:bg-[#7e639f] group-hover:text-white transition-colors">
                                    <Bot size={20} />
                                </div>
                                <h3 className="font-semibold text-slate-800 dark:text-white truncate" title={assistant.name}>
                                    {assistant.name}
                                </h3>
                            </div>
                            {user && user.id === assistant.created_by && (
                                <div className="flex items-center gap-1 shrink-0 ml-2">
                                    {onEditAssistant && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onEditAssistant(assistant);
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-blue-500 rounded-md hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                                            title="Editar"
                                        >
                                            <Pencil size={16} />
                                        </button>
                                    )}
                                    {onDeleteAssistant && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onDeleteAssistant(assistant.id);
                                            }}
                                            className="p-1.5 text-slate-400 hover:text-red-500 rounded-md hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                            title="Excluir"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                        <p className="text-sm text-slate-600 dark:text-gray-400 line-clamp-3 mb-4 flex-1">
                            {assistant.description || 'Sem descrição fornecida.'}
                        </p>
                        <button
                            className="w-full py-2 px-4 rounded-lg bg-[#7e639f]/10 dark:bg-[#7e639f]/20 text-[#7e639f] dark:text-[#a881d8] font-medium text-sm hover:bg-[#7e639f] hover:text-white dark:hover:bg-[#7e639f] dark:hover:text-white transition-colors"
                            onClick={() => {
                                onSelectAssistant(assistant.id);
                                onClose();
                            }}
                        >
                            Usar Assistente
                        </button>
                    </div>
                 ))}
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
