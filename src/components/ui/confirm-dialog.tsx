"use client";

import { useEffect, useRef } from "react";
import { Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";

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
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [open, onCancel]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
      aria-describedby="confirm-dialog-desc"
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
    >
      <div
        ref={dialogRef}
        tabIndex={-1}
        className="mx-4 w-full max-w-md rounded-2xl bg-surface p-8 shadow-2xl dark:bg-gray-800 text-center animate-in fade-in-0 zoom-in-95"
      >
        {/* Icon */}
        <div
          className={cn(
            "mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full",
            danger
              ? "bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400"
              : "bg-primary/10 text-primary"
          )}
        >
          <Trash2 className="h-7 w-7" aria-hidden="true" />
        </div>

        {/* Title */}
        <h3 id="confirm-dialog-title" className="text-xl font-semibold text-text-primary dark:text-white">
          {title}
        </h3>

        {/* Message */}
        <p id="confirm-dialog-desc" className="mt-3 text-sm text-text-muted dark:text-gray-400">
          {message}
        </p>

        {/* Buttons */}
        <div className="mt-8 flex items-center gap-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={loading}
            className="flex-1 rounded-xl border border-border bg-surface px-5 py-3 text-sm font-medium text-text-primary hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 transition-colors"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={cn(
              "flex-1 rounded-xl px-5 py-3 text-sm font-medium text-white transition-colors disabled:opacity-50 shadow-sm",
              danger
                ? "bg-red-600 hover:bg-red-700 dark:bg-red-600 dark:hover:bg-red-700"
                : "bg-primary hover:bg-primary/90"
            )}
          >
            {loading ? "Processing..." : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
