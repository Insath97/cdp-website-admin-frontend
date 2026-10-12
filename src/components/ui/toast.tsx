"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { X, CheckCircle, AlertCircle, AlertTriangle, Info } from "lucide-react";

type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastOptions {
  title?: string;
  description?: string;
  variant?: ToastVariant | "destructive";
}

interface Toast {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
}

interface ToastContextType {
  toast: (messageOrOptions: string | ToastOptions, variant?: ToastVariant) => void;
}

const ToastContext = React.createContext<ToastContextType>({
  toast: () => {},
});

export function useToast() {
  return React.useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = React.useState<Toast[]>([]);

  const addToast = React.useCallback(
    (messageOrOptions: string | ToastOptions, variant: ToastVariant = "info") => {
      const id = Math.random().toString(36).substr(2, 9);
      let text = "";
      let title: string | undefined;
      let finalVariant: ToastVariant = variant;

      if (typeof messageOrOptions === "object" && messageOrOptions !== null) {
        title = messageOrOptions.title;
        text = messageOrOptions.description || messageOrOptions.title || "";
        if (messageOrOptions.variant === "destructive") {
          finalVariant = "error";
        } else if (messageOrOptions.variant) {
          finalVariant = messageOrOptions.variant;
        }
      } else {
        text = String(messageOrOptions ?? "");
      }

      setToasts((prev) => [...prev, { id, title, message: text, variant: finalVariant }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 5000);
    },
    []
  );

  const removeToast = React.useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast: addToast }}>
      {children}
      <div
        role="region"
        aria-live="polite"
        aria-label="Notifications"
        className="pointer-events-none fixed right-4 top-4 z-[100] flex flex-col gap-2"
      >
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onRemove={removeToast} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

const variantConfig = {
  success: {
    icon: CheckCircle,
    bg: "bg-green-50 border-green-200 dark:bg-green-900/30 dark:border-green-800",
    text: "text-green-800 dark:text-green-200",
    iconColor: "text-green-500",
  },
  error: {
    icon: AlertCircle,
    bg: "bg-red-50 border-red-200 dark:bg-red-900/30 dark:border-red-800",
    text: "text-red-800 dark:text-red-200",
    iconColor: "text-red-500",
  },
  warning: {
    icon: AlertTriangle,
    bg: "bg-amber-50 border-amber-200 dark:bg-amber-900/30 dark:border-amber-800",
    text: "text-amber-800 dark:text-amber-200",
    iconColor: "text-amber-500",
  },
  info: {
    icon: Info,
    bg: "bg-blue-50 border-blue-200 dark:bg-blue-900/30 dark:border-blue-800",
    text: "text-blue-800 dark:text-blue-200",
    iconColor: "text-blue-500",
  },
};

function ToastItem({
  toast,
  onRemove,
}: {
  toast: Toast;
  onRemove: (id: string) => void;
}) {
  const config = variantConfig[toast.variant];
  const Icon = config.icon;

  return (
    <div
      role={toast.variant === "error" ? "alert" : "status"}
      aria-atomic="true"
      className={cn(
        "pointer-events-auto flex w-80 items-start gap-3 rounded-lg border p-4 shadow-lg animate-in slide-in-from-right-full",
        config.bg
      )}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", config.iconColor)} aria-hidden="true" />
      <div className="flex-1">
        {toast.title && (
          <p className={cn("text-xs font-semibold mb-0.5", config.text)}>
            {toast.title}
          </p>
        )}
        <p className={cn("text-sm font-medium", config.text)}>
          {toast.message}
        </p>
      </div>
      <button
        onClick={() => onRemove(toast.id)}
        aria-label="Dismiss notification"
        className={cn("shrink-0 rounded focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-current", config.text, "opacity-70 hover:opacity-100")}
      >
        <X className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}
