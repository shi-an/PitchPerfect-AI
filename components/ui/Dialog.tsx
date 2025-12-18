import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface DialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<DialogProps> = ({
  isOpen,
  title,
  message,
  confirmText = '确定',
  cancelText = '取消',
  type = 'info',
  onConfirm,
  onCancel
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start gap-4">
            {type === 'danger' && (
              <div className="bg-red-500/10 p-3 rounded-full shrink-0">
                <AlertTriangle className="w-6 h-6 text-red-500" />
              </div>
            )}
            <div className="flex-1">
              <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
              <p className="text-slate-400 text-sm leading-relaxed">{message}</p>
            </div>
            <button 
              onClick={onCancel}
              className="text-slate-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="bg-slate-950/50 p-4 flex justify-end gap-3 border-t border-slate-800">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 rounded-lg text-white text-sm font-medium shadow-lg transition-all ${
              type === 'danger' 
                ? 'bg-red-600 hover:bg-red-700 shadow-red-900/20' 
                : 'bg-violet-600 hover:bg-violet-700 shadow-violet-900/20'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
