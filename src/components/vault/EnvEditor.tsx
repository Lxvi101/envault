import { useState, useCallback, useEffect, useRef } from "react";
import { Eye, EyeOff, Plus, Save } from "lucide-react";
import type { EnvVariable } from "@/types/vault";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/shared/Button";

interface EnvEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (variable: Partial<EnvVariable>) => void;
  existingVariable?: EnvVariable | null;
  existingKeys: string[];
}

export function EnvEditor({
  isOpen,
  onClose,
  onSave,
  existingVariable,
  existingKeys,
}: EnvEditorProps) {
  const [key, setKey] = useState("");
  const [value, setValue] = useState("");
  const [description, setDescription] = useState("");
  const [isSecret, setIsSecret] = useState(false);
  const [showValue, setShowValue] = useState(true);
  const [error, setError] = useState("");
  const keyInputRef = useRef<HTMLInputElement>(null);

  const isEditMode = !!existingVariable;

  useEffect(() => {
    if (isOpen) {
      if (existingVariable) {
        setKey(existingVariable.key);
        setValue(existingVariable.value);
        setDescription(existingVariable.description);
        setIsSecret(existingVariable.isSecret);
        setShowValue(!existingVariable.isSecret);
      } else {
        setKey("");
        setValue("");
        setDescription("");
        setIsSecret(false);
        setShowValue(true);
      }
      setError("");
      setTimeout(() => keyInputRef.current?.focus(), 100);
    }
  }, [isOpen, existingVariable]);

  const validate = useCallback((): boolean => {
    const trimmedKey = key.trim().toUpperCase();

    if (!trimmedKey) {
      setError("Key is required");
      return false;
    }

    if (/\s/.test(trimmedKey)) {
      setError("Key cannot contain spaces");
      return false;
    }

    const isDuplicate = existingKeys.some(
      (k) =>
        k.toUpperCase() === trimmedKey &&
        (!existingVariable || existingVariable.key.toUpperCase() !== trimmedKey)
    );

    if (isDuplicate) {
      setError("A variable with this key already exists");
      return false;
    }

    setError("");
    return true;
  }, [key, existingKeys, existingVariable]);

  const handleSave = useCallback(() => {
    if (!validate()) return;

    onSave({
      key: key.trim().toUpperCase(),
      value,
      description: description.trim(),
      isSecret,
    });
    onClose();
  }, [key, value, description, isSecret, validate, onSave, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        handleSave();
      }
    },
    [handleSave]
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? "Edit Variable" : "Add Variable"}
      size="md"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            leftIcon={isEditMode ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          >
            {isEditMode ? "Save Changes" : "Add Variable"}
          </Button>
        </>
      }
    >
      <div className="space-y-4" onKeyDown={handleKeyDown}>
        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-vault-muted">
            Key <span className="text-vault-danger">*</span>
          </label>
          <input
            ref={keyInputRef}
            value={key}
            onChange={(e) => {
              setKey(e.target.value.toUpperCase().replace(/\s/g, "_"));
              setError("");
            }}
            placeholder="DATABASE_URL"
            className={`w-full px-3 py-2.5 rounded-lg border text-[14px] font-mono text-vault-accent placeholder:text-vault-muted/40 outline-none transition-all ${
              error
                ? "border-vault-danger focus:shadow-[0_0_0_3px_rgba(255,59,48,0.1)]"
                : "border-vault-border focus:border-vault-accent focus:shadow-[0_0_0_3px_rgba(0,102,204,0.1)]"
            }`}
          />
          {error && (
            <p className="text-[12px] text-vault-danger">{error}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-vault-muted">
            Value
          </label>
          <div className="relative">
            <input
              value={value}
              onChange={(e) => setValue(e.target.value)}
              type={showValue ? "text" : "password"}
              placeholder="postgres://user:pass@localhost:5432/db"
              className="w-full px-3 py-2.5 pr-10 rounded-lg border border-vault-border text-[14px] font-mono text-vault-text placeholder:text-vault-muted/40 outline-none focus:border-vault-accent focus:shadow-[0_0_0_3px_rgba(0,102,204,0.1)] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowValue(!showValue)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded text-vault-muted hover:text-vault-text transition-colors"
              tabIndex={-1}
            >
              {showValue ? (
                <EyeOff className="w-4 h-4" />
              ) : (
                <Eye className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[12px] font-medium text-vault-muted">
            Description
            <span className="text-vault-muted/50 ml-1">(optional)</span>
          </label>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Primary database connection string"
            className="w-full px-3 py-2.5 rounded-lg border border-vault-border text-[14px] text-vault-text placeholder:text-vault-muted/40 outline-none focus:border-vault-accent focus:shadow-[0_0_0_3px_rgba(0,102,204,0.1)] transition-all"
          />
        </div>

        <label className="flex items-center gap-3 px-3 py-3 rounded-lg border border-vault-border cursor-pointer hover:bg-vault-surface transition-colors">
          <div className="relative">
            <input
              type="checkbox"
              checked={isSecret}
              onChange={(e) => setIsSecret(e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-9 h-5 rounded-full bg-vault-raised peer-checked:bg-vault-accent transition-colors" />
            <div className="absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm peer-checked:translate-x-4 transition-all" />
          </div>
          <div>
            <p className="text-[13px] text-vault-text font-medium">Mark as secret</p>
            <p className="text-[12px] text-vault-muted">
              Secret values are hidden by default and cleared from clipboard
            </p>
          </div>
        </label>

        <p className="text-[11px] text-vault-muted text-right">
          Press{" "}
          <kbd className="px-1.5 py-0.5 rounded bg-vault-surface text-vault-muted text-[10px] font-mono border border-vault-border">
            Cmd+Enter
          </kbd>{" "}
          to save
        </p>
      </div>
    </Modal>
  );
}
