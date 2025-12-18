import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { ToastContainer, ToastMessage, ToastType } from '../components/ui/Toast';
import { ConfirmDialog } from '../components/ui/Dialog';

interface ConfirmOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
}

interface UIContextType {
  toast: {
    success: (msg: string) => void;
    error: (msg: string) => void;
    info: (msg: string) => void;
  };
  confirm: (options: ConfirmOptions) => Promise<boolean>;
}

const UIContext = createContext<UIContextType | undefined>(undefined);

export const UIProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = useCallback((type: ToastType, message: string) => {
    const id = Date.now().toString() + Math.random().toString();
    setToasts(prev => [...prev, { id, type, message }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = {
    success: (msg: string) => addToast('success', msg),
    error: (msg: string) => addToast('error', msg),
    info: (msg: string) => addToast('info', msg)
  };

  // Confirm Dialog State
  const [dialogState, setDialogState] = useState<{
    isOpen: boolean;
    options: ConfirmOptions;
    resolve: (value: boolean) => void;
  }>({
    isOpen: false,
    options: { title: '', message: '' },
    resolve: () => {}
  });

  const confirm = useCallback((options: ConfirmOptions) => {
    return new Promise<boolean>((resolve) => {
      setDialogState({
        isOpen: true,
        options,
        resolve
      });
    });
  }, []);

  const handleConfirm = () => {
    dialogState.resolve(true);
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  const handleCancel = () => {
    dialogState.resolve(false);
    setDialogState(prev => ({ ...prev, isOpen: false }));
  };

  return (
    <UIContext.Provider value={{ toast, confirm }}>
      {children}
      <ToastContainer toasts={toasts} onClose={removeToast} />
      <ConfirmDialog
        isOpen={dialogState.isOpen}
        title={dialogState.options.title}
        message={dialogState.options.message}
        confirmText={dialogState.options.confirmText}
        cancelText={dialogState.options.cancelText}
        type={dialogState.options.type}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </UIContext.Provider>
  );
};

export const useUI = () => {
  const context = useContext(UIContext);
  if (!context) throw new Error('useUI must be used within UIProvider');
  return context;
};
