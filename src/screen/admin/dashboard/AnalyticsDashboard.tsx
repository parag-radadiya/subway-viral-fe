import { Loader2, RefreshCcw } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { analyticsApi, shopsApi } from "../../../config/apiCall";
import type {
  DashboardFilters,
  KpiMatrixData,
  TrendData,
} from "./analytics.types";
import AnalyticsChannelCharts from "./AnalyticsChannelCharts";
import AnalyticsFilterBar from "./AnalyticsFilterBar";
import AnalyticsKpiCards from "./AnalyticsKpiCards";
import AnalyticsShopTable from "./AnalyticsShopTable";
import AnalyticsTrendChart from "./AnalyticsTrendChart";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const defaultFilters = (): DashboardFilters => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 7);
  const cTo = new Date(from);
  const cFrom = new Date(from);
  cFrom.setDate(cFrom.getDate() - 7);
  return {
    from_date: fmtD(from),
    to_date: fmtD(to),
    compare_from: fmtD(cFrom),
    compare_to: fmtD(cTo),
    shop_ids: "",
    report_type: "weekly_financial",
    granularity: "week",
  };
};

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

const Skeleton = ({ className = "" }: { className?: string }) => (
  <div className={`animate-pulse rounded-xl bg-slate-100 ${className}`} />
);

const DashboardSkeleton = () => (
  <div className="space-y-4">
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <Skeleton key={i} className="h-28" />
      ))}
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <Skeleton className="h-64" />
      <Skeleton className="h-64" />
    </div>
    <Skeleton className="h-80" />
  </div>
);

// ─── Error Banner ─────────────────────────────────────────────────────────────

const ErrorBanner = ({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) => (
  <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-xl p-4">
    <div className="flex-1">
      <p className="text-sm font-bold text-red-700">Failed to load dashboard</p>
      <p className="text-xs text-red-500 mt-0.5">{message}</p>
    </div>
    <button
      onClick={onRetry}
      className="flex items-center gap-1.5 text-xs font-semibold text-red-600 hover:text-red-800 border border-red-200 rounded-lg px-3 py-1.5 hover:bg-red-100 transition-colors"
    >
      <RefreshCcw size={12} /> Retry
    </button>
  </div>
);

// ─── Main Dashboard ───────────────────────────────────────────────────────────

const AnalyticsDashboard = () => {
  const [filters, setFilters] = useState<DashboardFilters>(defaultFilters);
  const [shops, setShops] = useState<Array<{ _id: string; name: string }>>([]);

  const [kpiData, setKpiData] = useState<KpiMatrixData | null>(null);
  const [revenueTrend, setRevenueTrend] = useState<TrendData | null>(null);
  const [costTrend, setCostTrend] = useState<TrendData | null>(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  // Load shops list once
  useEffect(() => {
    shopsApi
      .list()
      .then((res) => setShops(res.data?.data?.shops ?? res.data?.shops ?? []))
      .catch(() => {});
  }, []);

  const fetchAll = useCallback(async () => {
    if (abortRef.current) abortRef.current.abort();
    abortRef.current = new AbortController();

    setLoading(true);
    setError(null);

    const base = {
      from_date: filters.from_date,
      to_date: filters.to_date,
      report_type: filters.report_type,
      view: "reconciled" as const,
      ...(filters.shop_ids ? { shop_ids: filters.shop_ids } : {}),
    };

    try {
      const [kpiRes, revTrendRes, costTrendRes] = await Promise.all([
        analyticsApi.kpiMatrix({
          ...base,
          compare_from: filters.compare_from,
          compare_to: filters.compare_to,
        }),
        analyticsApi.trend({
          ...base,
          metrics: "grossSales,netSales",
          granularity: filters.granularity,
          group_by: "total",
        }),
        analyticsApi.trend({
          ...base,
          metrics: "labourPercent,foodCostPercent",
          granularity: filters.granularity,
          group_by: "total",
        }),
      ]);

      setKpiData(kpiRes.data?.data ?? null);
      setRevenueTrend(revTrendRes.data?.data ?? null);
      setCostTrend(costTrendRes.data?.data ?? null);
    } catch (err: any) {
      if (err?.code === "ERR_CANCELED") return;
      setError(err?.response?.data?.message ?? err?.message ?? "Unknown error");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchAll();
    return () => abortRef.current?.abort();
  }, [fetchAll]);

  const handleFilterChange = (next: Partial<DashboardFilters>) =>
    setFilters((prev) => ({ ...prev, ...next }));

  const comparePeriodLabel =
    filters.compare_from && filters.compare_to
      ? `${filters.compare_from} → ${filters.compare_to}`
      : "vs prev period";

  return (
    <div className="flex-1 w-full max-w-screen-xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Analytics
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            Financial performance overview
          </p>
        </div>
        {loading && (
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <Loader2 size={13} className="animate-spin" /> Refreshing…
          </div>
        )}
      </div>

      {/* Filter bar */}
      <AnalyticsFilterBar
        filters={filters}
        onChange={handleFilterChange}
        shops={shops}
        loading={loading}
      />

      {/* Error */}
      {error && <ErrorBanner message={error} onRetry={fetchAll} />}

      {/* Skeleton while first load */}
      {loading && !kpiData && <DashboardSkeleton />}

      {/* Content */}
      {kpiData && (
        <div className="space-y-6">
          {/* Row 1 — KPI cards */}
          <AnalyticsKpiCards
            current={kpiData.total.current}
            delta={kpiData.total.delta}
            comparePeriodLabel={comparePeriodLabel}
          />

          {/* Row 2 — Trend charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <AnalyticsTrendChart
              data={revenueTrend}
              metrics={["grossSales", "netSales"]}
              title="Revenue Trend"
            />
            <AnalyticsTrendChart
              data={costTrend}
              metrics={["labourPercent", "foodCostPercent"]}
              title="Labour % vs Food Cost %"
            />
          </div>

          {/* Row 3 — Channel charts */}
          <AnalyticsChannelCharts kpis={kpiData.total.current} />

          {/* Row 4 — Shop ranking table */}
          <AnalyticsShopTable shops={kpiData.shops} />
        </div>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
