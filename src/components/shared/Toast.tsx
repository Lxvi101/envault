import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import clsx from "clsx";
import { useToastStore, type Toast as ToastType } from "@/stores/useToastStore";

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  info: Info,
};

const colorMap = {
  success: {
    icon: "text-vault-success",
    bg: "bg-vault-success/10",
    border: "border-vault-success/20",
    progress: "bg-vault-success",
  },
  error: {
    icon: "text-vault-danger",
    bg: "bg-vault-danger/10",
    border: "border-vault-danger/20",
    progress: "bg-vault-danger",
  },
  info: {
    icon: "text-vault-accent",
    bg: "bg-vault-accent/10",
    border: "border-vault-accent/20",
    progress: "bg-vault-accent",
  },
};

function ToastItem({ toast }: { toast: ToastType }) {
  const removeToast = useToastStore((s) => s.removeToast);
  const [progress, setProgress] = useState(100);
  const duration = 3000;

  const Icon = iconMap[toast.type];
  const colors = colorMap[toast.type];

  useEffect(() => {
    if (duration <= 0) return;

    const interval = 30;
    const decrement = (interval / duration) * 100;
    const timer = setInterval(() => {
      setProgress((prev) => {
        if (prev <= 0) {
          clearInterval(timer);
          return 0;
        }
        return prev - decrement;
      });
    }, interval);

    return () => clearInterval(timer);
  }, [duration]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 80, scale: 0.95 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 80, scale: 0.95, transition: { duration: 0.2 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={clsx(
        "relative w-80 rounded-xl border overflow-hidden",
        "bg-vault-surface shadow-xl shadow-black/30",
        colors.border
      )}
    >
      <div className="flex items-start gap-3 p-4">
        <div className={clsx("flex-shrink-0 mt-0.5", colors.icon)}>
          <Icon className="w-5 h-5" />
        </div>
        <p className="flex-1 text-sm text-vault-text leading-relaxed">
          {toast.message}
        </p>
        <button
          onClick={() => removeToast(toast.id)}
          className="flex-shrink-0 p-0.5 rounded text-vault-muted hover:text-vault-text transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>

      {duration > 0 && (
        <div className="h-0.5 w-full bg-vault-border/30">
          <div
            className={clsx("h-full transition-[width] duration-100 ease-linear", colors.progress)}
            style={{ width: `${Math.max(0, progress)}%` }}
          />
        </div>
      )}
    </motion.div>
  );
}

export function ToastContainer() {
  const toasts = useToastStore((s) => s.toasts);

  return (
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col-reverse gap-2">
      <AnimatePresence mode="popLayout">
        {toasts.slice(0, 5).map((toast) => (
          <ToastItem key={toast.id} toast={toast} />
        ))}
      </AnimatePresence>
    </div>
  );
}
