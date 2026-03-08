import React, { useState, useEffect } from 'react';
import { X, Loader2 } from 'lucide-react';

interface RenameProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRename: (newName: string) => Promise<void>;
  currentName: string;
}

export const RenameProjectModal: React.FC<RenameProjectModalProps> = ({
  isOpen,
  onClose,
  onRename,
  currentName,
}) => {
  const [name, setName] = useState(currentName);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(currentName);
    }
  }, [isOpen, currentName]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || name === currentName) {
        onClose();
        return;
    }

    setIsLoading(true);
    try {
      await onRename(name.trim());
      onClose();
    } catch (error) {
      console.error('Error renaming project:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-[#212121] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-gray-200 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-white/10">
          <h2 className="text-xl font-semibold">Renomear Projeto</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white/10"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-6">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-slate-700 dark:text-gray-300 mb-2">
              Nome do projeto
            </label>
            <input
              type="text"
              id="projectName"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/40 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl py-3 px-4 text-slate-800 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-blue-500 dark:focus:border-[#3b82f6] focus:ring-1 focus:ring-blue-500 dark:focus:ring-[#3b82f6] transition-colors shadow-sm"
              placeholder="Ex: Novo Projeto de Vendas"
              autoFocus
              required
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-medium text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="flex items-center justify-center px-5 py-2.5 bg-blue-600 dark:bg-[#3b82f6] hover:bg-blue-700 dark:hover:bg-blue-500 text-white text-sm font-medium rounded-xl transition-all shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed min-w-[100px]"
            >
              {isLoading ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                'Salvar'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
