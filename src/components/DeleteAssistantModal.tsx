import { AlertTriangle } from 'lucide-react';

interface DeleteAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  assistantName: string;
}

export function DeleteAssistantModal({ isOpen, onClose, onConfirm, assistantName }: DeleteAssistantModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center  dark: dark:  p-4 bg-[#0B0F19]/80 backdrop-blur-sm">
      <div className="relative bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-gray-200 w-full max-w-[400px] rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Removed Aurora background */}
        <div className="p-6 pb-4">
          <div className="flex items-center gap-3 text-red-500 mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-500/20 rounded-full">
              <AlertTriangle size={24} />
            </div>
            <h2 className="text-xl font-semibold">Excluir Assistente</h2>
          </div>
          <p className="text-slate-600 dark:text-gray-300">
            Tem certeza de que deseja excluir o assistente <strong>"{assistantName}"</strong>? Esta ação não pode ser desfeita.
          </p>
        </div>

        <div className="p-4 border-t border-white/10 shrink-0 bg-white/5 flex justify-end gap-3 rounded-b-2xl">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-white/10 bg-white/5 backdrop-blur-xl text-slate-600 dark:text-gray-300 font-medium text-sm hover:bg-white/5 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-red-500 text-white font-medium text-sm transition-all hover:opacity-90 active:scale-95"
          >
            Excluir
          </button>
        </div>
      </div>
    </div>
  );
}
