import React, { useState } from 'react';
import { X, Search, UserPlus, CheckCircle2 } from 'lucide-react';
import { AuroraModalBackground } from './AuroraModalBackground';

interface GroupChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export const GroupChatModal: React.FC<GroupChatModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<number[]>([]);

  if (!isOpen) return null;

  // Placeholder users for simulation
  const dummyUsers = [
    { id: 1, name: "Maria Silva", department: "Vendas" },
    { id: 2, name: "João Pedro", department: "TI" },
    { id: 3, name: "Ana Souza", department: "RH" },
    { id: 4, name: "Carlos Ferreira", department: "Diretoria" },
  ];

  const filteredUsers = dummyUsers.filter(user =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleUser = (id: number) => {
    setSelectedUsers(prev =>
      prev.includes(id) ? prev.filter(uId => uId !== id) : [...prev, id]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onConfirm(); // In a real app, pass selected users IDs
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/50 dark:bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md rounded-2xl shadow-2xl border border-white/10 overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200 text-gray-200"
        onClick={(e) => e.stopPropagation()}
      >
        <AuroraModalBackground />
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Criar Grupo</h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-slate-800 dark:text-white rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div className="relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar colaboradores..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-slate-800 dark:text-white placeholder-gray-500 text-sm"
            />
          </div>

          <div className="space-y-2 max-h-[240px] overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-thumb-blue-800">
            {filteredUsers.length > 0 ? (
                filteredUsers.map(user => (
                <div
                    key={user.id}
                    onClick={() => toggleUser(user.id)}
                    className={`flex items-center justify-between p-3 rounded-xl cursor-pointer border transition-colors ${selectedUsers.includes(user.id) ? 'bg-emerald-900/20 border-emerald-800/50' : 'bg-transparent border-transparent hover:bg-slate-100 dark:hover:bg-white/5'}`}
                >
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${selectedUsers.includes(user.id) ? 'bg-emerald-800 text-emerald-200' : 'bg-white/10 text-slate-600 dark:text-gray-300'}`}>
                            {user.name.charAt(0)}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-800 dark:text-white">{user.name}</p>
                            <p className="text-xs text-gray-400">{user.department}</p>
                        </div>
                    </div>
                    {selectedUsers.includes(user.id) ? (
                        <CheckCircle2 size={20} className="text-emerald-400" />
                    ) : (
                        <UserPlus size={20} className="text-gray-600" />
                    )}
                </div>
                ))
            ) : (
                <div className="text-center py-6 text-gray-400 text-sm">
                    Nenhum colaborador encontrado.
                </div>
            )}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-white/10">
            <div className="text-sm text-gray-400">
                {selectedUsers.length} selecionados
            </div>
            <div className="flex gap-3">
                <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
                >
                Cancelar
                </button>
                <button
                type="submit"
                disabled={selectedUsers.length === 0}
                className="flex items-center justify-center px-4 py-2 bg-blue-500 hover:bg-blue-600 text-slate-800 dark:text-white text-sm font-medium rounded-xl transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                Iniciar Grupo
                </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
