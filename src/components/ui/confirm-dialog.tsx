"use client";

import { Trash2 } from "lucide-react";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  danger?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Yes, Delete",
  cancelLabel = "Cancel",
  danger = true,
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-surface p-8 shadow-2xl dark:bg-gray-800 text-center">
        {/* Icon */}
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
          <Trash2 className="h-7 w-7 text-red-600 dark:text-red-400" />
        </div>

        {/* Title */}
        <h3 className="text-xl font-semibold text-text-primary dark:text-white">{title}</h3>

        {/* Message */}
        <p className="mt-3 text-sm text-text-muted dark:text-gray-400">{message}</p>

        {/* Buttons */}
        <div className="mt-8 flex items-center gap-4">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-medium text-text-primary hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className={`flex-1 rounded-xl px-5 py-3 text-sm font-medium text-white disabled:opacity-50 bg-primary hover:bg-primary/90`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
