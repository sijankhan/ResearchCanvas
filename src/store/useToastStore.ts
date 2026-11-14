import { create } from 'zustand';

export interface Toast {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

export interface ConfirmDialogOptions {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  isDestructive?: boolean;
  onConfirm: () => void;
  onCancel?: () => void;
}

interface ToastState {
  toasts: Toast[];
  confirmDialog: ConfirmDialogOptions | null;
  showToast: (message: string, type?: 'info' | 'success' | 'warning' | 'error', durationMs?: number) => void;
  removeToast: (id: string) => void;
  showConfirm: (options: ConfirmDialogOptions) => void;
  closeConfirm: () => void;
}

let toastIdCounter = 0;

export const useToastStore = create<ToastState>((set, get) => ({
  toasts: [],
  confirmDialog: null,

  showToast: (message, type = 'info', durationMs = 3500) => {
    const id = `toast_${Date.now()}_${++toastIdCounter}`;
    const newToast: Toast = { id, type, message };

    set({ toasts: [...get().toasts, newToast] });

    if (durationMs > 0) {
      setTimeout(() => {
        get().removeToast(id);
      }, durationMs);
    }
  },

  removeToast: (id) => {
    set({ toasts: get().toasts.filter((t) => t.id !== id) });
  },

  showConfirm: (options) => {
    set({ confirmDialog: options });
  },

  closeConfirm: () => {
    set({ confirmDialog: null });
  },
}));
