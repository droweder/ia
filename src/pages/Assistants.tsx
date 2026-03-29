import { useState } from 'react';
import { Search, Bot, Pencil, Trash2, Plus } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate, useOutletContext } from 'react-router-dom';

interface OutletContextType {
  assistants: any[];
  setAssistantToEdit: (a: any) => void;
  setIsCreateAssistantModalOpen: (v: boolean) => void;
  setAssistantToDelete: (id: string | null) => void;
  setIsDeleteAssistantModalOpen: (v: boolean) => void;
}

export default function Assistants() {
  const [query, setQuery] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();
  const {
    assistants,
    setAssistantToEdit,
    setIsCreateAssistantModalOpen,
    setAssistantToDelete,
    setIsDeleteAssistantModalOpen,
  } = useOutletContext<OutletContextType>();

  const lowerQuery = query.toLowerCase();
  const results = assistants.filter(
    (a) =>
      a.name?.toLowerCase().includes(lowerQuery) ||
      a.description?.toLowerCase().includes(lowerQuery)
  );

  const handleEditAssistant = (assistant: any) => {
    setAssistantToEdit(assistant);
    setIsCreateAssistantModalOpen(true);
  };

  const handleDeleteAssistant = (id: string) => {
    setAssistantToDelete(id);
    setIsDeleteAssistantModalOpen(true);
  };

  const handleSelectAssistant = (id: string) => {
    navigate('/chat', { state: { assistantId: id } });
  };

  return (
    <div className="flex-1 flex flex-col min-w-0 min-h-0 bg-transparent transition-colors duration-200">
      {/* Header */}
      <div className="h-14 border-b border-white/10 flex justify-between items-center bg-white/5 backdrop-blur-md px-6 shadow-sm z-10 shrink-0">
        <h2 className="text-xl font-semibold flex items-center gap-2 text-white">
          <Bot size={24} className="text-blue-500" />
          Assistentes
        </h2>
        <button
            onClick={() => {
                setAssistantToEdit(null);
                setIsCreateAssistantModalOpen(true);
            }}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
            <Plus size={16} />
            Criar Assistente
        </button>
      </div>

      {/* Search Input */}
      <div className="px-6 pt-6 pb-2 shrink-0">
         <div className="relative max-w-xl mx-auto">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Buscar assistentes..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 transition-colors"
              />
         </div>
      </div>

      {/* Results Grid */}
      <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-blue-800">
        <div className="max-w-6xl mx-auto">
            {results.length === 0 ? (
               <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                  <Bot size={48} className="mb-4 opacity-50" />
                  <p>Nenhum assistente encontrado para "{query}"</p>
               </div>
            ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {results.map((assistant) => (
                      <div
                          key={assistant.id}
                          className="flex flex-col p-5 rounded-xl border border-white/10 bg-white/5 hover:border-blue-500/50 hover:shadow-md transition-all group"
                      >
                          <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center gap-3 overflow-hidden">
                                  <div className="w-12 h-12 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0 group-hover:bg-blue-500 group-hover:text-white transition-colors border border-blue-500/20">
                                      <Bot size={24} />
                                  </div>
                                  <h3 className="font-semibold text-white truncate text-lg" title={assistant.name}>
                                      {assistant.name}
                                  </h3>
                              </div>
                              {user && user.id === assistant.created_by && (
                                  <div className="flex items-center gap-1 shrink-0 ml-2">
                                      <button
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              handleEditAssistant(assistant);
                                          }}
                                          className="p-1.5 text-gray-400 hover:text-blue-400 rounded-md hover:bg-blue-500/10 transition-colors"
                                          title="Editar"
                                      >
                                          <Pencil size={16} />
                                      </button>
                                      <button
                                          onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteAssistant(assistant.id);
                                          }}
                                          className="p-1.5 text-gray-400 hover:text-red-400 rounded-md hover:bg-red-500/10 transition-colors"
                                          title="Excluir"
                                      >
                                          <Trash2 size={16} />
                                      </button>
                                  </div>
                              )}
                          </div>
                          <p className="text-sm text-gray-400 line-clamp-3 mb-6 flex-1">
                              {assistant.description || 'Sem descrição fornecida.'}
                          </p>
                          <button
                              className="w-full py-2.5 px-4 rounded-lg bg-blue-500/20 text-blue-400 font-medium text-sm hover:bg-blue-600 hover:text-white transition-colors border border-blue-500/20"
                              onClick={() => handleSelectAssistant(assistant.id)}
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
