import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon: LucideIcon;
  actions?: React.ReactNode;
  onBack?: () => void;
  backIcon?: LucideIcon;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  description,
  icon: Icon,
  actions,
  onBack,
  backIcon: BackIcon,
}) => {
  return (
    <div className="h-20 shrink-0 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 bg-white/40 dark:bg-white/5 backdrop-blur-md z-10 transition-colors duration-200 shadow-sm">
      <div className="flex items-center gap-4 min-w-0">
        {onBack && BackIcon && (
          <button
            onClick={onBack}
            className="p-2 -ml-2 rounded-lg text-slate-500 hover:text-slate-800 dark:text-gray-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors shrink-0"
          >
            <BackIcon size={24} />
          </button>
        )}
        <div className="flex items-center gap-4 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0 border border-blue-500/20">
            <Icon className="text-blue-500" size={24} />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-slate-800 dark:text-white truncate">
              {title}
            </h1>
            {description && (
              <p className="text-xs text-slate-500 dark:text-gray-400 truncate mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>
      </div>
      {actions && (
        <div className="flex items-center gap-3 shrink-0 ml-4">
          {actions}
        </div>
      )}
    </div>
  );
};
