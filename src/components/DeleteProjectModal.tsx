import { AlertCircle, X, Trash2 } from 'lucide-react';

interface DeleteProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteProjectModal({ isOpen, onClose, onConfirm }: DeleteProjectModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-[#212121] border border-slate-200 dark:border-white/10 text-slate-800 dark:text-gray-200 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200">

        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3 text-red-600 dark:text-red-500">
             <AlertCircle size={24} />
             <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Excluir projeto</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-6 pt-2">
          <p className="text-slate-600 dark:text-gray-300 leading-relaxed text-sm">
            Tem certeza que deseja excluir este projeto? Todos os dados associados poderão ser perdidos. Esta ação não pode ser desfeita.
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-black/20 flex justify-end gap-3 border-t border-slate-200 dark:border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl font-medium text-sm text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onClose();
              onConfirm();
            }}
            className="px-5 py-2.5 rounded-xl bg-red-600 text-white font-medium text-sm transition-all hover:bg-red-700 active:scale-95 flex items-center gap-2 shadow-sm"
          >
            <Trash2 size={16} />
            Excluir
          </button>
        </div>

      </div>
    </div>
  );
}
