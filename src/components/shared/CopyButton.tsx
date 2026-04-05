import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Copy, Check } from "lucide-react";
import clsx from "clsx";
import { Tooltip } from "./Tooltip";

interface CopyButtonProps {
  value: string;
  size?: "sm" | "md";
  className?: string;
  onCopy?: () => void;
}

export function CopyButton({
  value,
  size = "md",
  className,
  onCopy,
}: CopyButtonProps) {
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      if (window.api?.copySecret) {
        await window.api.copySecret(value);
      } else {
        await navigator.clipboard.writeText(value);
      }
      setIsCopied(true);
      onCopy?.();
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      // Silently fail
    }
  }, [value, onCopy]);

  const iconSize = size === "sm" ? "w-3.5 h-3.5" : "w-4 h-4";
  const btnSize = size === "sm" ? "p-1" : "p-1.5";

  return (
    <Tooltip content={isCopied ? "Copied!" : "Copy"}>
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={handleCopy}
        className={clsx(
          btnSize,
          "rounded-md transition-colors",
          isCopied
            ? "text-vault-success"
            : "text-vault-muted hover:text-vault-text hover:bg-vault-raised",
          className
        )}
        aria-label={isCopied ? "Copied" : "Copy to clipboard"}
      >
        <AnimatePresence mode="wait">
          {isCopied ? (
            <motion.div
              key="check"
              initial={{ scale: 0, rotate: -90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: 90 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <Check className={iconSize} />
            </motion.div>
          ) : (
            <motion.div
              key="copy"
              initial={{ scale: 0, rotate: 90 }}
              animate={{ scale: 1, rotate: 0 }}
              exit={{ scale: 0, rotate: -90 }}
              transition={{ type: "spring", stiffness: 500, damping: 25 }}
            >
              <Copy className={iconSize} />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.button>
    </Tooltip>
  );
}
