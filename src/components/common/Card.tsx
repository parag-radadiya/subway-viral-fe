import type { ReactNode } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "../../utils";
import type { StatCardVariant } from "../../utils/types";

interface CardProps {
  children: ReactNode;
  className?: string;
  padding?: "sm" | "md" | "lg" | "none";
}

const paddingMap = {
  none: "",
  sm: "p-4",
  md: "p-5",
  lg: "p-6",
};

/** Generic white card wrapper */
export const Card = ({
  children,
  className,
  padding = "md",
}: CardProps) => {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-card border border-slate-100 transition-shadow duration-200 hover:shadow-card-hover",
        paddingMap[padding],
        className
      )}
    >
      {children}
    </div>
  );
};

// ─── Stat Card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  icon: ReactNode;
  variant?: StatCardVariant;
  subtitle?: string;
}

const variantIconBg: Record<StatCardVariant, string> = {
  default: "bg-slate-100 text-slate-600",
  success: "bg-success-50 text-success-600",
  warning: "bg-warning-50 text-warning-600",
  danger: "bg-danger-50 text-danger-600",
  info: "bg-accent-50 text-accent-600",
};

const changeColors = {
  up: "text-success-600",
  down: "text-danger-500",
  neutral: "text-slate-400",
};

export const StatCard = ({
  title,
  value,
  change,
  changeType = "neutral",
  icon,
  variant = "default",
  subtitle,
}: StatCardProps) => {
  const ChangeIcon =
    changeType === "up"
      ? TrendingUp
      : changeType === "down"
      ? TrendingDown
      : Minus;

  return (
    <div className="stat-card animate-fade-in-up">
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-1">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-2xl font-bold text-primary-900 mt-0.5">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-400">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            "p-3 rounded-xl",
            variantIconBg[variant]
          )}
        >
          {icon}
        </div>
      </div>
      {change && (
        <div
          className={cn(
            "flex items-center gap-1 mt-3 text-xs font-medium",
            changeColors[changeType]
          )}
        >
          <ChangeIcon size={13} />
          <span>{change}</span>
        </div>
      )}
    </div>
  );
};

export default Card;
