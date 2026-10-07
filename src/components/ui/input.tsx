import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  errorMessage?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, id, error, errorMessage, "aria-describedby": ariaDescribedBy, ...props }, ref) => {
    const generatedId = React.useId();
    const inputId = id || generatedId;
    const errorId = errorMessage ? `${inputId}-error` : undefined;
    const describedBy = [errorId, ariaDescribedBy].filter(Boolean).join(" ") || undefined;
    const hasError = Boolean(error || errorMessage);

    return (
      <div className="w-full">
        <input
          id={inputId}
          type={type}
          aria-invalid={hasError ? "true" : undefined}
          aria-describedby={describedBy}
          className={cn(
            "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400",
            hasError
              ? "border-red-500 focus-visible:ring-red-500"
              : "border-gray-300 dark:border-gray-600",
            className
          )}
          ref={ref}
          {...props}
        />
        {errorMessage && (
          <p id={errorId} role="alert" className="mt-1 text-sm text-red-500">
            {errorMessage}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
