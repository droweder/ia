import { AlertCircle, X } from 'lucide-react';

interface NoProjectsWarningModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function NoProjectsWarningModal({ isOpen, onClose, onConfirm }: NoProjectsWarningModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center  dark:  p-4 bg-[#0B0F19]/80 backdrop-blur-sm">
      <div className="bg-white/40 dark:bg-white/5 backdrop-blur-xl border border-slate-200 dark:border-white/10 text-slate-800 dark:text-gray-200 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3 text-yellow-500">
             <AlertCircle size={24} />
             <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Nenhum projeto encontrado</h2>
          </div>
          <button onClick={onClose} className="p-2 text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white transition-colors rounded-lg hover:bg-slate-100 dark:hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-6 pt-2">
          <p className="text-slate-600 dark:text-gray-300 leading-relaxed text-sm">
            Para transferir este chat, você precisa ter pelo menos um projeto cadastrado. Deseja criar um novo projeto agora?
          </p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-white/5 flex justify-end gap-3 border-t border-slate-200 dark:border-white/10">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-sm font-medium text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onClose();
              onConfirm();
            }}
            className="px-5 py-2.5 rounded-full bg-white text-black font-semibold text-sm transition-all hover:opacity-90 active:scale-95"
          >
            Criar projeto
          </button>
        </div>

      </div>
    </div>
  );
}
