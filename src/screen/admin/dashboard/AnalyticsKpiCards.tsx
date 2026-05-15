import { CircleHelp, TrendingDown, TrendingUp } from "lucide-react";
import type { DeltaNode, KpiTotals } from "./analytics.types";

const fmt = (n: number, decimals = 0) =>
  new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n ?? 0);

interface KpiCardProps {
  title: string;
  current: number;
  delta?: DeltaNode;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  comparePeriodLabel?: string;
}

const KpiCard = ({
  title,
  current,
  delta,
  prefix = "",
  suffix = "",
  decimals = 0,
  comparePeriodLabel = "vs prev period",
}: KpiCardProps) => {
  const isPositive = (delta?.changePct ?? 0) >= 0;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
        <CircleHelp size={13} className="text-slate-300" />
      </div>

      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-slate-800 leading-none">
          {prefix}
          {fmt(current, decimals)}
          {suffix}
        </span>
        {delta && (
          <span
            className={`flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md mb-0.5 ${
              isPositive
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-red-50 text-red-500 border border-red-100"
            }`}
          >
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(delta.changePct).toFixed(1)}%
          </span>
        )}
      </div>

      {delta && (
        <div className="text-xs text-slate-400">
          {comparePeriodLabel}:{" "}
          <span className="font-semibold text-slate-500">
            {prefix}
            {fmt(delta.compare, decimals)}
            {suffix}
          </span>
        </div>
      )}
    </div>
  );
};

interface Props {
  current: KpiTotals;
  delta?: Record<string, DeltaNode>;
  comparePeriodLabel?: string;
}

const AnalyticsKpiCards = ({ current, delta, comparePeriodLabel }: Props) => {
  const cards: Array<{
    key: keyof KpiTotals;
    title: string;
    prefix?: string;
    suffix?: string;
    decimals?: number;
  }> = [
    { key: "grossSales", title: "Gross Sales", prefix: "£" },
    { key: "netSales", title: "Net Sales", prefix: "£" },
    { key: "labourPercent", title: "Labour %", suffix: "%", decimals: 1 },
    { key: "foodCostPercent", title: "Food Cost %", suffix: "%", decimals: 1 },
    {
      key: "avgOrderValue",
      title: "Avg Order Value",
      prefix: "£",
      decimals: 2,
    },
    { key: "customerCount", title: "Customer Count" },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {cards.map(({ key, title, prefix, suffix, decimals }) => (
        <KpiCard
          key={key}
          title={title}
          current={current[key] as number}
          delta={delta?.[key]}
          prefix={prefix}
          suffix={suffix}
          decimals={decimals}
          comparePeriodLabel={comparePeriodLabel}
        />
      ))}
    </div>
  );
};

export default AnalyticsKpiCards;
