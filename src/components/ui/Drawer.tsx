import { useEffect, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

export function Drawer({
  open,
  onClose,
  title,
  children,
  footer,
  width = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  width?: 'md' | 'lg';
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-navy-950/60 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          'absolute right-0 top-0 flex h-full w-full flex-col bg-surface shadow-drawer animate-slide-in-right',
          width === 'lg' ? 'max-w-2xl' : 'max-w-md',
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="font-heading text-lg font-semibold text-content">{title}</h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-content-subtle hover:bg-surface-3"
            aria-label="Close"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="border-t border-border px-5 py-4">{footer}</div>}
      </div>
    </div>
  );
}
