import React from 'react';
import { useToastStore, Toast } from '../../store/useToastStore';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useToastStore();

  if (toasts.length === 0) return null;

  const renderIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-sky-400 flex-shrink-0" />;
    }
  };

  const getBorderColor = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return 'border-emerald-500/30 bg-emerald-50/95 text-emerald-900 dark:bg-[#161d19]/95 dark:text-emerald-200';
      case 'error':
        return 'border-rose-500/30 bg-rose-50/95 text-rose-900 dark:bg-[#201518]/95 dark:text-rose-200';
      case 'warning':
        return 'border-amber-500/30 bg-amber-50/95 text-amber-900 dark:bg-[#1f1b13]/95 dark:text-amber-200';
      default:
        return 'border-sky-500/30 bg-sky-50/95 text-sky-900 dark:bg-[#141a22]/95 dark:text-sky-200';
    }
  };

  return (
    <div className="fixed bottom-16 right-6 z-50 flex flex-col gap-2 max-w-sm pointer-events-none select-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-2xl border backdrop-blur-xl shadow-floating text-xs font-medium animate-in slide-in-from-bottom-2 duration-150 ${getBorderColor(
            toast.type
          )}`}
        >
          <div className="flex items-center gap-2">
            {renderIcon(toast.type)}
            <span className="leading-snug">{toast.message}</span>
          </div>
          <button
            onClick={() => removeToast(toast.id)}
            aria-label="Dismiss notification"
            className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
