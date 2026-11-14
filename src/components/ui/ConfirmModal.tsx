import React from 'react';
import { useToastStore } from '../../store/useToastStore';
import { AlertTriangle, X } from 'lucide-react';

export const ConfirmModal: React.FC = () => {
  const { confirmDialog, closeConfirm } = useToastStore();

  if (!confirmDialog) return null;

  const {
    title,
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    isDestructive = false,
    onConfirm,
    onCancel,
  } = confirmDialog;

  const handleConfirm = () => {
    closeConfirm();
    onConfirm();
  };

  const handleCancel = () => {
    closeConfirm();
    if (onCancel) onCancel();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-150 select-none">
      <div className="relative w-full max-w-md bg-white dark:bg-[#181a20] border border-slate-200 dark:border-white/10 rounded-3xl shadow-floating p-6 text-slate-800 dark:text-slate-200">
        <div className="flex items-start justify-between gap-3 pb-3 mb-3 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-2xl ${
                isDestructive ? 'bg-rose-500/10 text-rose-500 dark:text-rose-400' : 'bg-sky-500/10 text-sky-600 dark:text-sky-400'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">{title}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Confirmation required</p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            aria-label="Close dialog"
            className="p-1.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-6">{message}</p>

        <div className="flex items-center justify-end gap-2.5">
          <button
            onClick={handleCancel}
            className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 hover:text-slate-950 dark:hover:text-white text-xs font-medium transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            onClick={handleConfirm}
            className={`px-4 py-2 rounded-xl text-xs font-semibold transition-colors shadow-sm ${
              isDestructive
                ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-900/40'
                : 'bg-sky-500 hover:bg-sky-400 text-white dark:text-slate-950 shadow-sky-900/40'
            }`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};
