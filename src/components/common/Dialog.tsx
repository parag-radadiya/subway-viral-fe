import { type ReactNode, useEffect } from "react";
import { X } from "lucide-react";
import { cn } from "../../utils";

interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "full";
}

const Dialog = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  className,
  maxWidth = "sm",
}: DialogProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const maxWidthClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    full: "max-w-full m-4",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "bg-white rounded-3xl shadow-2xl relative z-10 w-full overflow-hidden animate-fade-in flex flex-col",
          maxWidthClasses[maxWidth],
          className
        )}
      >
        <div className="flex items-center justify-between p-6 border-b border-slate-100">
          <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">
            {title}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="p-6">{children}</div>
        {footer && (
          <div className="p-6 bg-slate-50 border-t border-slate-100 flex items-center gap-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dialog;
