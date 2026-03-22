import { forwardRef, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: ReactNode;
  startIcon?: ReactNode;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, leftIcon, startIcon, hint, className, type, id, ...rest }, ref) => {
    const icon = leftIcon || startIcon;
    const [showPassword, setShowPassword] = useState(false);
    const isPassword = type === "password";
    const inputType = isPassword ? (showPassword ? "text" : "password") : type;

    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label && (
          <label
            htmlFor={id}
            className="text-sm font-medium text-primary-700"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
              {icon}
            </span>
          )}
          <input
            ref={ref}
            id={id}
            type={inputType}
            className={cn(
              "w-full rounded-lg border text-sm text-primary-800 bg-white placeholder-slate-400",
              "px-4 py-2.5 transition-all duration-150",
              "focus:outline-none focus:ring-2 focus:ring-accent-200 focus:border-accent-400",
              "disabled:opacity-60 disabled:cursor-not-allowed",
              icon && "pl-10",
              isPassword && "pr-10",
              error
                ? "border-danger-500 focus:ring-danger-100"
                : "border-slate-200 hover:border-slate-300",
              className
            )}
            {...rest}
          />
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          )}
        </div>
        {error && (
          <p className="text-xs text-danger-500 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        {hint && !error && (
          <p className="text-xs text-slate-400">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
