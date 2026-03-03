import React from 'react';
import { X, Copy, Check } from 'lucide-react';

interface ShareChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  chatId: string | null;
  chatTitle: string;
}

export const ShareChatModal: React.FC<ShareChatModalProps> = ({
  isOpen,
  onClose,
  chatId,
  chatTitle,
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !chatId) return null;

  // Simulate a public URL for sharing
  const shareUrl = `${window.location.origin}/share/c/${chatId}`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="bg-white dark:bg-[#1a1b1e] w-full max-w-md rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 overflow-hidden transform transition-all scale-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100 dark:border-white/5">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-white">Compartilhar Chat</h2>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-gray-300 rounded-full hover:bg-slate-100 dark:hover:bg-white/5 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-600 dark:text-gray-300">
            Qualquer pessoa com este link poderá ver as mensagens desta conversa: <strong className="text-slate-800 dark:text-white">{chatTitle}</strong>.
          </p>

          <div className="flex items-center gap-2 mt-4">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 px-4 py-3 bg-slate-50 dark:bg-[#2b2d31] border border-slate-200 dark:border-white/10 rounded-xl outline-none text-slate-900 dark:text-white text-sm"
            />
            <button
              onClick={handleCopy}
              className="flex items-center justify-center p-3 bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-gray-200 rounded-xl transition-colors"
              title="Copiar link"
            >
              {copied ? <Check size={20} className="text-emerald-500" /> : <Copy size={20} />}
            </button>
          </div>
        </div>

        <div className="p-6 border-t border-slate-100 dark:border-white/5 flex justify-end">
             <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-600 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 rounded-xl transition-colors"
            >
              Fechar
            </button>
        </div>
      </div>
    </div>
  );
};
