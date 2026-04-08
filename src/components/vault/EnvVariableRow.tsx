import { useState, useCallback, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Eye, EyeOff, Pencil, Trash2, Check, X } from "lucide-react";
import clsx from "clsx";
import type { EnvVariable } from "@/types/vault";
import { CopyButton } from "@/components/shared/CopyButton";
import { Tooltip } from "@/components/shared/Tooltip";

interface EnvVariableRowProps {
  variable: EnvVariable;
  onUpdate: (id: string, data: Partial<EnvVariable>) => void;
  onDelete: (id: string) => void;
  index: number;
}

export function EnvVariableRow({
  variable,
  onUpdate,
  onDelete,
  index,
}: EnvVariableRowProps) {
  const [isRevealed, setIsRevealed] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editKey, setEditKey] = useState(variable.key);
  const [editValue, setEditValue] = useState(variable.value);
  const [editDescription, setEditDescription] = useState(
    variable.description
  );
  const keyInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && keyInputRef.current) {
      keyInputRef.current.focus();
    }
  }, [isEditing]);

  const handleSave = useCallback(() => {
    const trimmedKey = editKey.trim().toUpperCase();
    if (!trimmedKey) return;

    onUpdate(variable.id, {
      key: trimmedKey,
      value: editValue,
      description: editDescription,
    });
    setIsEditing(false);
  }, [editKey, editValue, editDescription, variable.id, onUpdate]);

  const handleCancel = useCallback(() => {
    setEditKey(variable.key);
    setEditValue(variable.value);
    setEditDescription(variable.description);
    setIsEditing(false);
  }, [variable]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleSave();
      }
      if (e.key === "Escape") {
        e.preventDefault();
        handleCancel();
      }
    },
    [handleSave, handleCancel]
  );

  const maskedValue = variable.isSecret && !isRevealed;
  const displayValue = maskedValue ? "\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022\u2022" : variable.value;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
      transition={{ delay: index * 0.03, duration: 0.25 }}
      whileHover={{ backgroundColor: "rgba(0, 0, 0, 0.02)" }}
      className="group rounded-xl border border-transparent hover:border-vault-border/40 transition-colors"
    >
      <AnimatePresence mode="wait">
        {isEditing ? (
          <motion.div
            key="editing"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="p-3 space-y-2.5"
          >
            <div className="flex gap-2">
              <input
                ref={keyInputRef}
                value={editKey}
                onChange={(e) =>
                  setEditKey(e.target.value.toUpperCase().replace(/\s/g, "_"))
                }
                onKeyDown={handleKeyDown}
                placeholder="KEY"
                className="flex-1 px-3 py-2 rounded-lg bg-vault-bg border border-vault-border text-sm font-mono text-vault-accent placeholder:text-vault-muted/40 outline-none focus:border-vault-accent/60 focus:shadow-[0_0_0_3px_rgba(0,102,204,0.1)] transition-all"
              />
              <span className="flex items-center text-vault-muted text-sm font-mono px-1">
                =
              </span>
              <input
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="value"
                className="flex-[2] px-3 py-2 rounded-lg bg-vault-bg border border-vault-border text-sm font-mono text-vault-text placeholder:text-vault-muted/40 outline-none focus:border-vault-accent/60 focus:shadow-[0_0_0_3px_rgba(0,102,204,0.1)] transition-all"
              />
            </div>
            <input
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Description (optional)"
              className="w-full px-3 py-1.5 rounded-lg bg-vault-bg border border-vault-border text-xs text-vault-muted placeholder:text-vault-muted/40 outline-none focus:border-vault-accent/60 focus:shadow-[0_0_0_3px_rgba(0,102,204,0.1)] transition-all"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={handleCancel}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-vault-muted hover:text-vault-text hover:bg-vault-raised transition-colors"
              >
                <X className="w-3.5 h-3.5" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs text-vault-success bg-vault-success/10 hover:bg-vault-success/20 transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Save
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="display"
            initial={false}
            className="flex items-center gap-2 px-3 py-2.5"
          >
            <div className="flex-1 min-w-0 flex items-center gap-2">
              <span className="font-mono text-sm text-vault-accent font-medium flex-shrink-0">
                {variable.key}
              </span>
              <span className="text-vault-muted/40 font-mono text-sm">=</span>
              <span
                className={clsx(
                  "font-mono text-sm truncate",
                  maskedValue
                    ? "text-vault-muted/60 tracking-wider"
                    : "text-vault-text/80"
                )}
              >
                {displayValue}
              </span>
            </div>

            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
              {variable.isSecret && (
                <Tooltip content={isRevealed ? "Hide" : "Reveal"}>
                  <button
                    onClick={() => setIsRevealed(!isRevealed)}
                    className="p-1.5 rounded-md text-vault-muted hover:text-vault-text hover:bg-vault-raised transition-colors"
                    aria-label={isRevealed ? "Hide value" : "Reveal value"}
                  >
                    {isRevealed ? (
                      <EyeOff className="w-3.5 h-3.5" />
                    ) : (
                      <Eye className="w-3.5 h-3.5" />
                    )}
                  </button>
                </Tooltip>
              )}

              <CopyButton value={variable.value} size="sm" />

              <Tooltip content="Edit">
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 rounded-md text-vault-muted hover:text-vault-text hover:bg-vault-raised transition-colors"
                  aria-label="Edit variable"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </Tooltip>

              <AnimatePresence>
                {showDeleteConfirm ? (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: "auto", opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    className="flex items-center gap-1 overflow-hidden"
                  >
                    <button
                      onClick={() => {
                        onDelete(variable.id);
                        setShowDeleteConfirm(false);
                      }}
                      className="p-1.5 rounded-md text-vault-danger hover:bg-vault-danger/10 transition-colors"
                      aria-label="Confirm delete"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setShowDeleteConfirm(false)}
                      className="p-1.5 rounded-md text-vault-muted hover:text-vault-text hover:bg-vault-raised transition-colors"
                      aria-label="Cancel delete"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                ) : (
                  <Tooltip content="Delete">
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className="p-1.5 rounded-md text-vault-muted hover:text-vault-danger hover:bg-vault-danger/10 transition-colors"
                      aria-label="Delete variable"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </Tooltip>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {variable.description && !isEditing && (
        <div className="px-3 pb-2 -mt-1">
          <p className="text-[11px] text-vault-muted/60 pl-0.5">
            {variable.description}
          </p>
        </div>
      )}
    </motion.div>
  );
}
