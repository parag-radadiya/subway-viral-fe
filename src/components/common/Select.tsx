import { forwardRef, type SelectHTMLAttributes, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "../../utils";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  hint?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, leftIcon, hint, className, id, children, ...rest }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label htmlFor={id} className="text-sm font-medium text-primary-700">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {leftIcon}
            </span>
          )}
          <select
            ref={ref}
            id={id}
            className={cn(
              "w-full rounded-lg border text-sm text-primary-800 bg-white appearance-none cursor-pointer",
              "px-4 py-2.5 transition-all duration-150",
              "focus:outline-none focus:ring-2 focus:ring-accent-200 focus:border-accent-400",
              "disabled:opacity-60 disabled:cursor-not-allowed bg-white border-slate-200 rounded-lg text-xs font-bold text-slate-700",
              leftIcon ? "pl-10" : "pl-4",
              "pr-10",
              error
                ? "border-danger-500 focus:ring-danger-100"
                : "border-slate-200 hover:border-slate-300",
              className,
            )}
            {...rest}
          >
            {children}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
            <ChevronDown size={16} />
          </div>
        </div>
        {error && (
          <p className="text-xs text-danger-500 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && <p className="text-xs text-slate-400">{hint}</p>}
      </div>
    );
  },
);

Select.displayName = "Select";

export default Select;
