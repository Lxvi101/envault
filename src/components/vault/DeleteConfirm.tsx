import { AlertTriangle } from "lucide-react";
import { Modal } from "@/components/shared/Modal";
import { Button } from "@/components/shared/Button";

interface DeleteConfirmProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  description: string;
  isLoading?: boolean;
}

export function DeleteConfirm({
  isOpen,
  onClose,
  onConfirm,
  title = "Are you sure?",
  description,
  isLoading = false,
}: DeleteConfirmProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      size="sm"
      showCloseButton={false}
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onConfirm}
            isLoading={isLoading}
          >
            Delete
          </Button>
        </>
      }
    >
      <div className="flex flex-col items-center text-center py-2">
        <div className="w-14 h-14 rounded-2xl bg-vault-danger/10 flex items-center justify-center mb-4">
          <AlertTriangle className="w-7 h-7 text-vault-danger" />
        </div>
        <h3 className="text-lg font-semibold text-vault-text mb-2">
          {title}
        </h3>
        <p className="text-sm text-vault-muted leading-relaxed max-w-xs">
          {description}
        </p>
      </div>
    </Modal>
  );
}
