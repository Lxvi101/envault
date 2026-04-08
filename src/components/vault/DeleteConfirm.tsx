import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/shared/Button";

interface DeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoading?: boolean;
  title?: string;
  description?: string;
}

export function DeleteConfirm({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  title = "Confirm Delete",
  description = "This action cannot be undone.",
}: DeleteConfirmProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      size="sm"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} isLoading={isLoading}>
            Delete
          </Button>
        </>
      }
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-vault-danger/10 flex items-center justify-center shrink-0">
          <AlertTriangle size={20} className="text-vault-danger" strokeWidth={1.75} />
        </div>
        <p className="text-[14px] text-vault-text leading-relaxed pt-1">
          {description}
        </p>
      </div>
    </Modal>
  );
}
