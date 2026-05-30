import { useState, type ReactNode } from 'react';
import { Modal } from './Modal';
import { Button } from './Button';
import { Input } from './Input';

/**
 * Destructive-action confirmation. When `confirmPhrase` is set, the user must
 * type it exactly to enable the confirm button (typed-confirmation pattern).
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  confirmPhrase,
  loading,
  variant = 'danger',
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  confirmPhrase?: string;
  loading?: boolean;
  variant?: 'danger' | 'primary';
}) {
  const [typed, setTyped] = useState('');
  const disabled = confirmPhrase ? typed.trim() !== confirmPhrase : false;

  const handleClose = () => {
    setTyped('');
    onClose();
  };

  return (
    <Modal open={open} onClose={handleClose} title={title} size="sm">
      <div className="space-y-4">
        <div className="text-sm text-content-muted">{description}</div>
        {confirmPhrase && (
          <Input
            label={`Type "${confirmPhrase}" to confirm`}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            autoFocus
            autoComplete="off"
          />
        )}
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            disabled={disabled}
            loading={loading}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
