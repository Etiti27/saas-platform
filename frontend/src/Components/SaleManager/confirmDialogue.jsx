import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Trash2 } from 'lucide-react';

export function ConfirmDialog({
  open,
  title = 'Delete item',
  description = 'This action cannot be undone.',
  confirmText = 'Delete',
  cancelText = 'Cancel',
  onConfirm,
  onClose,
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose?.();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Dialog */}
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/10"
        >
          <div className="p-5">
            <div className="flex items-start gap-3">
              <div className="mt-1 grid h-10 w-10 place-content-center rounded-full bg-red-100 text-red-700">
                <Trash2 className="h-5 w-5" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-semibold">{title}</h3>
                <p className="mt-1 text-sm text-gray-600">{description}</p>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-3">
              <button
                onClick={onClose}
                className="rounded-lg border px-3 py-2 text-sm shadow-sm hover:bg-gray-50"
              >
                {cancelText}
              </button>
              <button
                onClick={onConfirm}
                className="rounded-lg bg-red-600 px-3 py-2 text-sm text-white shadow-sm hover:bg-red-700"
              >
                {confirmText}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}
