import { AlertCircle, X, Trash2 } from 'lucide-react';

interface DeleteChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export function DeleteChatModal({ isOpen, onClose, onConfirm }: DeleteChatModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#212121] text-gray-200 w-full max-w-md rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">

        <div className="flex items-center justify-between p-6 pb-4">
          <div className="flex items-center gap-3 text-red-500">
             <AlertCircle size={24} />
             <h2 className="text-lg font-semibold text-white">Excluir chat</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10">
            <X size={20} />
          </button>
        </div>

        <div className="px-6 pb-6 pt-2">
          <p className="text-gray-300 leading-relaxed text-sm">
            Tem certeza que deseja excluir este chat? Esta ação não pode ser desfeita.
          </p>
        </div>

        <div className="p-4 bg-black/20 flex justify-end gap-3 border-t border-white/5">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-full text-sm font-medium text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={() => {
              onClose();
              onConfirm();
            }}
            className="px-5 py-2.5 rounded-full bg-red-600 text-white font-semibold text-sm transition-all hover:bg-red-700 active:scale-95 flex items-center gap-2"
          >
            <Trash2 size={16} />
            Excluir
          </button>
        </div>

      </div>
    </div>
  );
}
