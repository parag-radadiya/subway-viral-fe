// ─── Shared Analytics Types ───────────────────────────────────────────────────

export interface DeltaNode {
  current: number;
  compare: number;
  change: number;
  changePct: number;
}

export interface KpiTotals {
  grossSales: number;
  netSales: number;
  vat: number;
  vatPercent: number;
  adjustedVat: number;
  labour: number;
  labourHours: number;
  labourPercent: number;
  foodCost: number;
  foodCostPercent: number;
  justeat: number;
  ubereat: number;
  deliveroo: number;
  total3pd: number;
  deliveryPercent: number;
  commission: number;
  commissionPercent: number;
  customerCount: number;
  income: number;
  totalCostPercent: number;
  instore: number;
  instorePercent: number;
  threePdPercent: number;
  avgOrderValue: number;
}

export interface ShopRow {
  shopId: string;
  shopName: string;
  current: Partial<KpiTotals>;
  compare?: Partial<KpiTotals>;
  delta?: Record<string, DeltaNode>;
  record_count: number;
}

export interface KpiMatrixData {
  period: { from: string; to: string };
  compare_period?: { from: string; to: string };
  total: {
    current: KpiTotals;
    compare?: Partial<KpiTotals>;
    delta?: Record<string, DeltaNode>;
    record_count: number;
  };
  shops: ShopRow[];
  metric_keys: string[];
}

export interface TrendPoint {
  periodKey: string;
  label: string;
  year?: number;
  month?: number;
  weekNumber?: number | null;
  [metric: string]: any;
}

export interface TrendData {
  period: { from: string; to: string };
  granularity: string;
  metrics: string[];
  group_by: string;
  total: {
    kpis: Record<string, number>;
    series: TrendPoint[];
  };
  shops: Array<{
    shopId: string;
    shopName: string;
    total: Record<string, number>;
    series: TrendPoint[];
  }> | null;
  data_points: number;
}

export interface PeriodCompareData {
  current_period: { from: string; to: string; record_count: number };
  compare_period: { from: string; to: string; record_count: number };
  metrics: string[];
  total: {
    current: Partial<KpiTotals>;
    compare: Partial<KpiTotals>;
    delta: Record<string, DeltaNode>;
  };
  shops: ShopRow[];
}

export interface DashboardFilters {
  from_date: string;
  to_date: string;
  compare_from: string;
  compare_to: string;
  shop_ids: string;
  report_type: "weekly_financial" | "monthly_store_kpi" | "weekly_report";
}

// ─── Weekly Report Types ───────────────────────────────────────────────────────

export interface WeeklyReportSummary {
  sales: number;
  net: number;
  labour: number;
  vat: number;
  royalties: number;
  foodCost: number;
  commission: number;
  total: number;
  income: number;
  commissionPercent: number; // fraction — multiply ×100
  avgWeeklySales: number;
}

export interface WeeklyReportTrendPoint {
  year: number;
  week_number: number;
  week_range_label: string;
  week_start: string;
  week_end: string;
  sales: number;
  net: number;
  labour: number;
  vat: number;
  royalties: number;
  foodCost: number;
  commission: number;
  total: number;
  income: number;
  commissionPercent: number;
}

export interface WeeklyReportDelta {
  current: number;
  compare: number;
  change: number;
  changePct: number | null;
}

export interface WeeklyReportData {
  report_type: string;
  period: { from: string; to: string } | null;
  weeks_count: number;
  has_data: boolean;
  summary: WeeklyReportSummary;
  trend: WeeklyReportTrendPoint[];
  comparison?: {
    period: { from: string; to: string };
    weeks_count: number;
    current: WeeklyReportSummary;
    compare: WeeklyReportSummary;
    delta: Record<string, WeeklyReportDelta>;
  };
}
