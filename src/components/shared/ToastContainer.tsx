import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import clsx from 'clsx';
import { useToastStore, type Toast, type ToastType } from '@/stores/useToastStore';

const toastIcons: Record<ToastType, React.ElementType> = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const toastStyles: Record<ToastType, string> = {
  success: 'border-vault-success/30 bg-vault-success/5',
  error: 'border-vault-danger/30 bg-vault-danger/5',
  info: 'border-vault-accent/30 bg-vault-accent/5',
};

const toastIconStyles: Record<ToastType, string> = {
  success: 'text-vault-success',
  error: 'text-vault-danger',
  info: 'text-vault-accent',
};

function ToastItem({ toast }: { toast: Toast }) {
  const { removeToast } = useToastStore();
  const Icon = toastIcons[toast.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95, transition: { duration: 0.15 } }}
      transition={{ type: 'spring', damping: 25, stiffness: 300 }}
      className={clsx(
        'flex items-center gap-3 px-4 py-3 rounded-xl border',
        'bg-vault-surface/95 backdrop-blur-md shadow-lg shadow-black/20',
        toastStyles[toast.type],
      )}
    >
      <Icon size={16} className={clsx('shrink-0', toastIconStyles[toast.type])} />
      <p className="flex-1 text-sm text-vault-text">{toast.message}</p>
      <button
        onClick={() => removeToast(toast.id)}
        className="p-0.5 rounded text-vault-muted/40 hover:text-vault-muted transition-colors shrink-0"
      >
        <X size={14} />
      </button>
    </motion.div>
  );
}

export function ToastContainer() {
  const { toasts } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 w-80 pointer-events-none">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => (
          <div key={toast.id} className="pointer-events-auto">
            <ToastItem toast={toast} />
          </div>
        ))}
      </AnimatePresence>
    </div>
  );
}
