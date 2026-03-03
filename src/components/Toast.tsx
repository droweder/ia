import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

interface ToastProps {
  message: string;
  type: ToastType;
  onClose: () => void;
  duration?: number;
}

export const Toast: React.FC<ToastProps> = ({ message, type, onClose, duration = 3000 }) => {
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [duration, onClose]);

  const bgColor = type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/30' :
                  type === 'error' ? 'bg-red-50 dark:bg-red-900/30' :
                  'bg-blue-50 dark:bg-blue-900/30';

  const borderColor = type === 'success' ? 'border-emerald-200 dark:border-emerald-800' :
                      type === 'error' ? 'border-red-200 dark:border-red-800' :
                      'border-blue-200 dark:border-blue-800';

  const iconColor = type === 'success' ? 'text-emerald-500 dark:text-emerald-400' :
                    type === 'error' ? 'text-red-500 dark:text-red-400' :
                    'text-blue-500 dark:text-blue-400';

  const Icon = type === 'success' ? CheckCircle2 :
               type === 'error' ? AlertCircle :
               Info;

  return (
    <div className={`fixed bottom-6 right-6 flex items-center gap-3 p-4 rounded-xl border shadow-lg z-50 animate-in slide-in-from-bottom-5 fade-in duration-300 ${bgColor} ${borderColor}`}>
      <Icon className={`w-5 h-5 flex-shrink-0 ${iconColor}`} />
      <p className="text-sm font-medium text-slate-800 dark:text-slate-200 pr-4">{message}</p>
      <button
        onClick={onClose}
        className="p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-slate-500 dark:text-slate-400"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
