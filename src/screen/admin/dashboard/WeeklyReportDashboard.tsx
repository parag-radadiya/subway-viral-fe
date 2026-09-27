import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { TrendingDown, TrendingUp } from "lucide-react";
import { Line } from "react-chartjs-2";
import type {
  WeeklyReportData,
  WeeklyReportDelta,
  WeeklyReportSummary,
} from "./analytics.types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Legend,
  Tooltip,
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number, decimals = 0) =>
  new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n ?? 0);

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface KpiCardProps {
  title: string;
  current: number;
  delta?: WeeklyReportDelta | null;
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
  const changePct = delta?.changePct ?? null;
  const isPositive = (changePct ?? 0) >= 0;

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
          {title}
        </span>
      </div>

      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-slate-800 leading-none">
          {prefix}
          {fmt(current, decimals)}
          {suffix}
        </span>
        {delta && changePct !== null && (
          <span
            className={`flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-md mb-0.5 ${
              isPositive
                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                : "bg-red-50 text-red-500 border border-red-100"
            }`}
          >
            {isPositive ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {Math.abs(changePct).toFixed(1)}%
          </span>
        )}
        {delta && changePct === null && (
          <span className="text-[11px] font-bold px-1.5 py-0.5 rounded-md mb-0.5 bg-slate-50 text-slate-400 border border-slate-100">
            —
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

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-xl bg-slate-100 ${className}`} />
);

// ─── Main Component ───────────────────────────────────────────────────────────

interface Props {
  data: WeeklyReportData | null;
  comparePeriodLabel?: string;
  loading: boolean;
}

const WeeklyReportDashboard = ({
  data,
  comparePeriodLabel = "vs prev period",
  loading,
}: Props) => {
  // Loading skeleton
  if (loading && !data) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  // Empty state
  if (!data || !data.has_data) {
    return (
      <div className="flex flex-col items-center justify-center p-16 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-400">
        <p className="text-sm font-bold text-slate-500">No data found</p>
        <p className="text-xs mt-1">Try adjusting the date range.</p>
      </div>
    );
  }

  const { summary, trend, comparison } = data;
  const delta = comparison?.delta;

  type CardDef = {
    key: keyof WeeklyReportSummary;
    title: string;
    prefix?: string;
    suffix?: string;
    decimals?: number;
  };

  const cards: CardDef[] = [
    { key: "sales", title: "Gross Sales", prefix: "£" },
    { key: "net", title: "Net Sales", prefix: "£" },
    { key: "labour", title: "Labour", prefix: "£" },
    { key: "foodCost", title: "Food Cost", prefix: "£" },
    { key: "income", title: "Income", prefix: "£" },
    {
      key: "commissionPercent",
      title: "Commission %",
      suffix: "%",
      decimals: 1,
    },
  ];

  // Chart data
  const labels = trend.map((p) => `W${p.week_number} (${p.week_range_label})`);
  const chartData = {
    labels,
    datasets: [
      {
        label: "Gross Sales",
        data: trend.map((p) => p.sales),
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.08)",
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
      {
        label: "Net Sales",
        data: trend.map((p) => p.net),
        borderColor: "#10b981",
        backgroundColor: "rgba(16,185,129,0.08)",
        borderWidth: 2,
        tension: 0.4,
        fill: false,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: {
        display: true,
        position: "top" as const,
        labels: { boxWidth: 12, font: { size: 11 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) =>
            ` ${ctx.dataset.label}: £${
              new Intl.NumberFormat("en-GB").format(ctx.parsed.y)
            }`,
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { size: 10 }, maxRotation: 45 },
      },
      y: {
        border: { display: false },
        grid: { color: "#f1f5f9" },
        ticks: {
          color: "#94a3b8",
          font: { size: 10 },
          callback: (val: any) =>
            "£" + new Intl.NumberFormat("en-GB").format(val),
        },
      },
    },
  };

  return (
    <div className="space-y-6">
      {/* KPI Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {cards.map(({ key, title, prefix, suffix, decimals }) => {
          const rawVal = summary[key] as number;
          // commissionPercent is a fraction — multiply ×100
          const displayVal =
            key === "commissionPercent" ? rawVal * 100 : rawVal;
          const rawDelta = delta?.[key] ?? null;
          const displayDelta: WeeklyReportDelta | null = rawDelta
            ? key === "commissionPercent"
              ? {
                  ...rawDelta,
                  current: rawDelta.current * 100,
                  compare: rawDelta.compare * 100,
                  change: rawDelta.change * 100,
                }
              : rawDelta
            : null;

          return (
            <KpiCard
              key={key}
              title={title}
              current={displayVal}
              delta={displayDelta}
              prefix={prefix}
              suffix={suffix}
              decimals={decimals}
              comparePeriodLabel={comparePeriodLabel}
            />
          );
        })}
      </div>

      {/* Avg Weekly Sales callout */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Avg Weekly Sales
          </p>
          <p className="text-2xl font-bold text-slate-800 mt-1">
            £{fmt(summary.avgWeeklySales)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-slate-400">{data.weeks_count} weeks</p>
          {data.period && (
            <p className="text-xs text-slate-400 mt-0.5">
              {data.period.from} → {data.period.to}
            </p>
          )}
        </div>
      </div>

      {/* Weekly Sales Trend Chart */}
      {trend.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h3 className="text-sm font-bold text-slate-800 mb-4">
            Weekly Sales Trend
          </h3>
          <div style={{ height: "220px" }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyReportDashboard;
