import { Calendar, ChevronDown, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { type DashboardFilters } from "./analytics.types";

interface Props {
  filters: DashboardFilters;
  onChange: (next: Partial<DashboardFilters>) => void;
  shops: Array<{ _id: string; name: string }>;
  loading: boolean;
}

const fmtD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

const PRESETS = [
  {
    label: "Last 7 days",
    get: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 7);
      const cFrom = new Date(from);
      const cTo = new Date(to);
      cFrom.setDate(cFrom.getDate() - 7);
      cTo.setDate(cTo.getDate() - 7);
      return { from: fmtD(from), to: fmtD(to), cFrom: fmtD(cFrom), cTo: fmtD(cTo) };
    },
  },
  {
    label: "Last 30 days",
    get: () => {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - 30);
      const cFrom = new Date(from);
      const cTo = new Date(to);
      cFrom.setDate(cFrom.getDate() - 30);
      cTo.setDate(cTo.getDate() - 30);
      return { from: fmtD(from), to: fmtD(to), cFrom: fmtD(cFrom), cTo: fmtD(cTo) };
    },
  },
  {
    label: "This year",
    get: () => {
      const now = new Date();
      const from = new Date(now.getFullYear(), 0, 1);
      const to = now;
      const cFrom = new Date(from.getFullYear() - 1, 0, 1);
      const cTo = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
      return { from: fmtD(from), to: fmtD(to), cFrom: fmtD(cFrom), cTo: fmtD(cTo) };
    },
  },
  { label: "Custom", get: null },
];

const Pill = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`flex items-center gap-1.5 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-sm text-slate-700 shadow-sm ${className}`}
  >
    {children}
  </div>
);

const AnalyticsFilterBar = ({ filters, onChange, shops, loading }: Props) => {
  // Controlled state so selecting "Custom" shows inputs immediately
  // without needing dates to already be non-preset values.
  const [activePreset, setActivePreset] = useState<string>("Last 7 days");

  const handlePreset = (label: string) => {
    setActivePreset(label);
    if (label === "Custom") return; // let user fill the date inputs manually
    const preset = PRESETS.find((p) => p.label === label);
    if (!preset?.get) return;
    const { from, to, cFrom, cTo } = preset.get();
    const gran: "week" | "month" =
      label === "This year" || label === "Last 30 days" ? "month" : "week";
    onChange({ from_date: from, to_date: to, compare_from: cFrom, compare_to: cTo, granularity: gran });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Preset picker */}
      <Pill className="cursor-pointer hover:bg-slate-50">
        <Calendar size={13} className="text-slate-400" />
        <select
          value={activePreset}
          onChange={(e) => handlePreset(e.target.value)}
          disabled={loading}
          className="bg-transparent border-none p-0 pr-5 text-sm focus:ring-0 outline-none cursor-pointer text-slate-700 disabled:opacity-50"
        >
          {PRESETS.map((p) => (
            <option key={p.label} value={p.label}>
              {p.label}
            </option>
          ))}
        </select>
      </Pill>

      {/* Custom date range */}
      {activePreset === "Custom" && (
        <Pill>
          <input
            type="date"
            value={filters.from_date}
            onChange={(e) => onChange({ from_date: e.target.value })}
            className="bg-transparent border-none p-0 text-xs focus:ring-0 outline-none text-slate-700 w-[105px]"
          />
          <span className="text-slate-400 text-xs">→</span>
          <input
            type="date"
            value={filters.to_date}
            onChange={(e) => onChange({ to_date: e.target.value })}
            className="bg-transparent border-none p-0 text-xs focus:ring-0 outline-none text-slate-700 w-[105px]"
          />
        </Pill>
      )}

      <span className="text-slate-400 text-xs px-1">vs</span>

      {/* Compare range */}
      <Pill>
        <input
          type="date"
          value={filters.compare_from}
          onChange={(e) => onChange({ compare_from: e.target.value })}
          className="bg-transparent border-none p-0 text-xs focus:ring-0 outline-none text-slate-700 w-[105px]"
        />
        <span className="text-slate-400 text-xs">→</span>
        <input
          type="date"
          value={filters.compare_to}
          onChange={(e) => onChange({ compare_to: e.target.value })}
          className="bg-transparent border-none p-0 text-xs focus:ring-0 outline-none text-slate-700 w-[105px]"
        />
      </Pill>

      {/* Shop multi-select */}
      <Pill className="cursor-pointer hover:bg-slate-50">
        <SlidersHorizontal size={13} className="text-slate-400" />
        <select
          value={filters.shop_ids}
          onChange={(e) => onChange({ shop_ids: e.target.value })}
          disabled={loading}
          className="bg-transparent border-none p-0 pr-5 text-sm focus:ring-0 outline-none cursor-pointer text-slate-700 disabled:opacity-50 max-w-[180px]"
        >
          <option value="">All shops</option>
          {shops.map((s) => (
            <option key={s._id} value={s._id}>
              {s.name}
            </option>
          ))}
        </select>
      </Pill>

      {/* Report type */}
      <Pill className="cursor-pointer hover:bg-slate-50">
        <ChevronDown size={13} className="text-slate-400" />
        <select
          value={filters.report_type}
          onChange={(e) =>
            onChange({ report_type: e.target.value as DashboardFilters["report_type"] })
          }
          disabled={loading}
          className="bg-transparent border-none p-0 pr-5 text-sm focus:ring-0 outline-none cursor-pointer text-slate-700 disabled:opacity-50"
        >
          <option value="weekly_financial">Weekly</option>
          <option value="monthly_store_kpi">Monthly</option>
        </select>
      </Pill>

      {/* Granularity */}
      <Pill className="cursor-pointer hover:bg-slate-50">
        <select
          value={filters.granularity}
          onChange={(e) =>
            onChange({ granularity: e.target.value as "week" | "month" })
          }
          disabled={loading}
          className="bg-transparent border-none p-0 pr-5 text-sm focus:ring-0 outline-none cursor-pointer text-slate-700 disabled:opacity-50"
        >
          <option value="week">Weekly trend</option>
          <option value="month">Monthly trend</option>
        </select>
      </Pill>
    </div>
  );
};

export default AnalyticsFilterBar;
