import React, { useEffect } from 'react';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastProps {
  toast: ToastMessage;
  onClose: (id: string) => void;
}

const ToastItem: React.FC<ToastProps> = ({ toast, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose(toast.id);
    }, 3000);
    return () => clearTimeout(timer);
  }, [toast.id, onClose]);

  const icons = {
    success: <CheckCircle className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    info: <Info className="w-5 h-5 text-blue-400" />
  };

  const bgColors = {
    success: 'bg-slate-900 border-emerald-500/50',
    error: 'bg-slate-900 border-red-500/50',
    info: 'bg-slate-900 border-blue-500/50'
  };

  return (
    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border shadow-lg shadow-black/50 min-w-[300px] animate-in slide-in-from-right-full fade-in duration-300 ${bgColors[toast.type]}`}>
      {icons[toast.type]}
      <p className="text-sm font-medium text-white flex-1">{toast.message}</p>
      <button onClick={() => onClose(toast.id)} className="text-slate-500 hover:text-white transition-colors">
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{ toasts: ToastMessage[]; onClose: (id: string) => void }> = ({ toasts, onClose }) => {
  return (
    <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      <div className="pointer-events-auto flex flex-col gap-2">
        {toasts.map(t => (
          <ToastItem key={t.id} toast={t} onClose={onClose} />
        ))}
      </div>
    </div>
  );
};
