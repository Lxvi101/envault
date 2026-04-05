import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { Inbox } from "lucide-react";
import clsx from "clsx";
import { Button } from "@/components/shared/Button";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className={clsx(
        "flex flex-col items-center justify-center text-center py-16 px-6",
        className
      )}
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1, duration: 0.35, ease: "easeOut" }}
        className="mb-5 p-4 rounded-2xl bg-vault-raised/60 border border-vault-border/40"
      >
        <div className="text-vault-muted">
          {icon || <Inbox className="w-10 h-10" />}
        </div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
        className="text-lg font-semibold text-vault-text mb-2"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.3 }}
        className="text-sm text-vault-muted max-w-xs leading-relaxed"
      >
        {description}
      </motion.p>

      {action && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
          className="mt-6"
        >
          <Button variant="primary" onClick={action.onClick}>
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
