import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../utils";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
  fullWidth?: boolean;
  children: ReactNode;
}

const sizeClasses = {
  sm: "px-3 py-1.5 text-xs",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-base",
};

const variantClasses = {
  primary:
    "bg-accent-600 hover:bg-accent-700 text-white shadow-sm focus:ring-2 focus:ring-accent-200 focus:ring-offset-1",
  secondary:
    "bg-white border border-slate-200 hover:bg-slate-50 text-primary-700 shadow-sm focus:ring-2 focus:ring-slate-200",
  danger:
    "bg-danger-500 hover:bg-danger-600 text-white shadow-sm focus:ring-2 focus:ring-red-200",
  ghost:
    "bg-transparent hover:bg-slate-100 text-primary-600 focus:ring-2 focus:ring-slate-200",
};

const Button = ({
  variant = "primary",
  size = "md",
  isLoading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  children,
  className,
  disabled,
  ...rest
}: ButtonProps) => {
  return (
    <button
      {...rest}
      disabled={disabled || isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-all duration-150 focus:outline-none disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap",
        sizeClasses[size],
        variantClasses[variant],
        fullWidth && "w-full",
        className,
      )}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
          <span>Loading…</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          {children}
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};

export default Button;
