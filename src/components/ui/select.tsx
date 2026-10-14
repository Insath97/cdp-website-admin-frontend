import * as React from "react";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  error?: boolean;
  errorMessage?: string;
  label?: string;
  labelClassName?: string;
  placeholder?: string;
  options?: SelectOption[];
  selectSize?: "sm" | "md" | "lg";
  wrapperClassName?: string;
  containerClassName?: string;
  icon?: React.ReactNode;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      wrapperClassName,
      containerClassName,
      error,
      errorMessage,
      label,
      labelClassName,
      placeholder = "Select an option",
      options,
      selectSize = "md",
      icon,
      required,
      id,
      children,
      disabled,
      value,
      defaultValue,
      onChange,
      name,
      ...props
    },
    ref
  ) => {
    const generatedId = React.useId();
    const selectId = id || (label ? generatedId : undefined);
    const containerRef = React.useRef<HTMLDivElement>(null);

    const normalizeValue = (v: unknown): string | number => {
      if (Array.isArray(v)) return v[0] ?? "";
      if (typeof v === "number" || typeof v === "string") return v;
      return "";
    };

    const [isOpen, setIsOpen] = React.useState(false);
    const [internalValue, setInternalValue] = React.useState<string | number>(
      value !== undefined
        ? normalizeValue(value)
        : defaultValue !== undefined
        ? normalizeValue(defaultValue)
        : ""
    );

    // Keep internalValue in sync when controlled value changes
    React.useEffect(() => {
      if (value !== undefined) {
        setInternalValue(normalizeValue(value));
      }
    }, [value]);

    // Parse options from either `options` prop or `<option>` children
    const parsedOptions: SelectOption[] = React.useMemo(() => {
      if (options && options.length > 0) return options;
      if (!children) return [];
      const opts: SelectOption[] = [];
      React.Children.forEach(children, (child) => {
        if (React.isValidElement(child)) {
          const childProps = child.props as Record<string, unknown>;
          if (child.type === "option" || childProps.value !== undefined) {
            opts.push({
              value: (childProps.value !== undefined ? childProps.value : childProps.children) as string | number,
              label: typeof childProps.children === "string" ? childProps.children : String(childProps.children || childProps.value || ""),
              disabled: Boolean(childProps.disabled),
            });
          }
        }
      });
      return opts;
    }, [options, children]);

    // Close on click outside
    React.useEffect(() => {
      if (!isOpen) return;
      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false);
        }
      };
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("keydown", handleKeyDown);
      };
    }, [isOpen]);

    // Currently selected option
    const selectedOption = parsedOptions.find(
      (opt) => String(opt.value) === String(internalValue)
    );

    const handleSelect = (opt: SelectOption) => {
      if (opt.disabled) return;
      setInternalValue(opt.value);
      setIsOpen(false);

      if (onChange) {
        const syntheticEvent = {
          target: {
            value: opt.value,
            name: name || "",
          },
        } as unknown as React.ChangeEvent<HTMLSelectElement>;
        onChange(syntheticEvent);
      }
    };

    const sizeClasses = {
      sm: "h-8 py-1 text-xs px-2.5",
      md: "h-10 py-2 text-sm px-3",
      lg: "h-11 py-2.5 text-base px-3.5",
    };

    return (
      <div
        ref={containerRef}
        className={cn(
          "relative w-full min-w-0 max-w-full",
          wrapperClassName || containerClassName
        )}
      >
        {label && (
          <label
            htmlFor={selectId}
            onClick={() => !disabled && setIsOpen((prev) => !prev)}
            className={cn(
              "mb-1.5 block text-xs font-semibold text-text-primary dark:text-gray-200 cursor-pointer select-none",
              labelClassName
            )}
          >
            {label}
            {required && <span className="ml-0.5 text-red-500">*</span>}
          </label>
        )}

        {/* Hidden native select for form integration / compatibility */}
        <select
          ref={ref}
          id={selectId}
          name={name}
          value={internalValue}
          required={required}
          disabled={disabled}
          tabIndex={-1}
          aria-hidden="true"
          className="sr-only pointer-events-none absolute h-0 w-0 opacity-0"
          onChange={() => {}}
          {...props}
        >
          {parsedOptions.map((opt) => (
            <option key={String(opt.value)} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Custom Dropdown Trigger */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => !disabled && setIsOpen((prev) => !prev)}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          className={cn(
            "flex w-full min-w-0 max-w-full items-center justify-between rounded-lg border bg-surface transition-all text-left",
            "text-text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary",
            "dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-100 dark:disabled:bg-gray-900",
            sizeClasses[selectSize],
            error || errorMessage
              ? "border-red-500 focus:border-red-500 focus:ring-red-500/20"
              : isOpen
              ? "border-primary ring-2 ring-primary/20 dark:border-primary"
              : "border-border dark:border-gray-700 hover:border-gray-400 dark:hover:border-gray-600",
            className
          )}
        >
          <div className="flex items-center gap-2 min-w-0 flex-1 pr-1.5">
            {icon && (
              <span className="shrink-0 text-text-muted dark:text-gray-400">
                {icon}
              </span>
            )}
            <span
              className={cn(
                "truncate block",
                selectedOption
                  ? "text-text-primary dark:text-gray-100 font-normal"
                  : "text-text-muted dark:text-gray-400"
              )}
            >
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>

          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-text-muted dark:text-gray-400 transition-transform duration-200",
              isOpen && "rotate-180 text-primary"
            )}
          />
        </button>

        {/* Custom Dropdown Floating Menu */}
        {isOpen && (
          <div
            role="listbox"
            tabIndex={-1}
            className="absolute left-0 right-0 top-full mt-1.5 z-50 w-full min-w-0 max-h-56 overflow-y-auto rounded-lg border border-border bg-surface p-1 shadow-xl dark:border-gray-700 dark:bg-gray-800 animate-in fade-in-50 zoom-in-95 duration-150"
          >
            {parsedOptions.length === 0 ? (
              <div className="px-3 py-2 text-xs text-text-muted dark:text-gray-400 text-center">
                No options available
              </div>
            ) : (
              parsedOptions.map((opt) => {
                const isSelected = String(opt.value) === String(internalValue);
                return (
                  <div
                    key={String(opt.value)}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelect(opt)}
                    className={cn(
                      "flex items-center justify-between px-3 py-2 text-xs sm:text-sm rounded-md cursor-pointer transition-colors select-none",
                      opt.disabled
                        ? "opacity-40 cursor-not-allowed"
                        : isSelected
                        ? "bg-primary/10 text-primary font-medium dark:bg-primary/20 dark:text-emerald-300"
                        : "text-text-primary dark:text-gray-100 hover:bg-muted/80 dark:hover:bg-gray-700/60"
                    )}
                  >
                    <span className="truncate flex-1 min-w-0 pr-2">
                      {opt.label}
                    </span>
                    {isSelected && (
                      <Check className="h-4 w-4 text-primary shrink-0" />
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}

        {errorMessage && (
          <p className="mt-1 text-xs text-red-500">{errorMessage}</p>
        )}
      </div>
    );
  }
);
Select.displayName = "Select";

export { Select };
