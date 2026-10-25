'use client';

/* Centered modal with scrim, focus trap, Escape close (plan §42). */
import * as React from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/lib/easyui/utils';
import { useFocusTrap } from '@/lib/easyui/hooks/useFocusTrap';

export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
}) {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);

  const containerRef = useFocusTrap<HTMLDivElement>({ isOpen: open, onClose });

  React.useEffect(() => {
    if (open) {
      const onKey = (e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
      };
      document.addEventListener('keydown', onKey);
      document.body.style.overflow = 'hidden';
      return () => {
        document.removeEventListener('keydown', onKey);
        document.body.style.overflow = '';
      };
    }
  }, [open, onClose]);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
        >
          <div
            className="absolute inset-0 bg-[color:var(--color-overlay)]"
            onClick={onClose}
            aria-hidden
          />
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 6 }}
            transition={{ type: 'spring', stiffness: 420, damping: 34 }}
            className={cn(
              'relative w-full max-w-md rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-[var(--shadow-lg)]',
              className
            )}
          >
            <div className="flex items-start justify-between gap-4 px-5 pt-5">
              <div>
                <h2 className="text-base font-semibold text-[var(--text-primary)]">{title}</h2>
                {description && (
                  <p className="mt-1 text-xs leading-relaxed text-[var(--text-muted)]">{description}</p>
                )}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close dialog"
                className="focus-ring grid size-7 shrink-0 place-items-center rounded-md text-[var(--text-muted)] hover:bg-[var(--surface-hover)] hover:text-[var(--text-primary)]"
              >
                <X className="size-4" />
              </button>
            </div>
            {children && <div className="px-5 py-4">{children}</div>}
            {footer && (
              <div className="flex items-center justify-end gap-2 px-5 pb-5">{footer}</div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body
  );
}

/** Ready-made confirmation footer pair. */
export function ConfirmButtons({
  confirmLabel,
  onConfirm,
  onClose,
  destructive = false,
  pending = false,
}: {
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
  destructive?: boolean;
  pending?: boolean;
}) {
  return (
    <>
      <button
        type="button"
        onClick={onClose}
        className="focus-ring h-9 rounded-lg border border-[var(--border)] px-3.5 text-sm font-medium text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onConfirm}
        disabled={pending}
        className={cn(
          'focus-ring h-9 rounded-lg px-3.5 text-sm font-medium text-white disabled:opacity-50',
          destructive ? 'bg-[color:var(--color-negative)] hover:opacity-90' : 'bg-[var(--accent)] hover:opacity-90'
        )}
      >
        {confirmLabel}
      </button>
    </>
  );
}
