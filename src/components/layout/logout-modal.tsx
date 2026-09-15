"use client";

import { LogOut } from "lucide-react";

interface LogoutModalProps {
  open: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export function LogoutModal({ open, onCancel, onConfirm }: LogoutModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      style={{ zIndex: 9999 }}
      onClick={onCancel}
    >
      <div
        className="mx-4 w-full max-w-sm rounded-xl border border-border bg-surface p-6 shadow-2xl dark:border-gray-700 dark:bg-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mx-auto dark:bg-red-900/30">
          <LogOut className="h-6 w-6 text-red-600 dark:text-red-400" />
        </div>
        <h3 className="mt-4 text-center text-lg font-semibold text-text-primary dark:text-white">
          Confirm Logout
        </h3>
        <p className="mt-2 text-center text-sm text-text-muted dark:text-gray-400">
          Are you sure you want to sign out of the system?
        </p>
        <div className="mt-6 flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-lg border border-border bg-surface px-4 py-2.5 text-sm font-medium text-text-primary transition-colors hover:bg-gray-50 dark:border-gray-600 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 rounded-lg bg-[#168B61] px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[#0F684A]"
          >
            Yes, Sign Out
          </button>
        </div>
      </div>
    </div>
  );
}
