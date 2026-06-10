import { Calendar, ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { type DashboardFilters } from "./analytics.types";

interface Props {
  filters: DashboardFilters;
  onChange: (next: Partial<DashboardFilters>) => void;
  shops: Array<{ _id: string; name: string }>;
  loading: boolean;
}

// ─── Date helpers ──────────────────────────────────────────────────────────────

const fmtD = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`;

function getMondayOfWeek(year: number, week: number): Date {
  const jan4 = new Date(year, 0, 4);
  const dow = jan4.getDay() === 0 ? 7 : jan4.getDay();
  const monday = new Date(jan4);
  monday.setDate(jan4.getDate() - (dow - 1) + (week - 1) * 7);
  return monday;
}

function getSundayOfWeek(year: number, week: number): Date {
  const m = getMondayOfWeek(year, week);
  m.setDate(m.getDate() + 6);
  return m;
}

function currentIsoWeek(): number {
  const now = new Date();
  const jan1 = new Date(now.getFullYear(), 0, 1);
  return Math.ceil(
    (Math.floor((now.getTime() - jan1.getTime()) / 86_400_000) + 1) / 7
  );
}

const MONTH_NAMES = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

const now = new Date();
const CUR_YEAR = now.getFullYear();
const CUR_MONTH = now.getMonth() + 1;
const CUR_WEEK = currentIsoWeek();

// Total ISO weeks in a year (52 or 53)
function weeksInYear(year: number): number {
  const dec28 = new Date(year, 11, 28);
  const jan1 = new Date(year, 0, 1);
  return Math.ceil(
    (Math.floor((dec28.getTime() - jan1.getTime()) / 86_400_000) + 1) / 7
  );
}

// ─── Sub-components ────────────────────────────────────────────────────────────

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

/** A compact year stepper: ‹ 2026 › */
const YearStepper = ({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (y: number) => void;
  disabled: boolean;
}) => (
  <div className="flex items-center gap-0.5">
    <button
      onClick={() => onChange(value - 1)}
      disabled={disabled}
      className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-40 text-slate-500"
    >
      <ChevronLeft size={12} />
    </button>
    <span className="text-xs font-semibold text-slate-700 tabular-nums w-[34px] text-center">
      {value}
    </span>
    <button
      onClick={() => onChange(value + 1)}
      disabled={disabled || value >= CUR_YEAR}
      className="p-0.5 rounded hover:bg-slate-100 disabled:opacity-40 text-slate-500"
    >
      <ChevronRight size={12} />
    </button>
  </div>
);

/** Month dropdown showing "Jan … Dec" */
const MonthSelect = ({
  value,
  onChange,
  disabled,
}: {
  value: number;
  onChange: (m: number) => void;
  disabled: boolean;
}) => (
  <select
    value={value}
    disabled={disabled}
    onChange={(e) => onChange(Number(e.target.value))}
    className="bg-transparent border-none p-0 text-xs font-medium text-slate-700 focus:ring-0 outline-none cursor-pointer disabled:opacity-50"
  >
    {MONTH_NAMES.map((name, i) => (
      <option key={name} value={i + 1}>
        {name}
      </option>
    ))}
  </select>
);

/** Week dropdown showing "W1 … W52/53" */
const WeekSelect = ({
  value,
  onChange,
  year,
  disabled,
}: {
  value: number;
  onChange: (w: number) => void;
  year: number;
  disabled: boolean;
}) => {
  const total = weeksInYear(year);
  return (
    <select
      value={value}
      disabled={disabled}
      onChange={(e) => onChange(Number(e.target.value))}
      className="bg-transparent border-none p-0 text-xs font-medium text-slate-700 focus:ring-0 outline-none cursor-pointer disabled:opacity-50"
    >
      {Array.from({ length: total }, (_, i) => i + 1).map((w) => (
        <option key={w} value={w}>
          W{String(w).padStart(2, "0")}
        </option>
      ))}
    </select>
  );
};

// ─── Main component ────────────────────────────────────────────────────────────

const AnalyticsFilterBar = ({ filters, onChange, shops, loading }: Props) => {
  const isWeekly = filters.report_type === "weekly_financial";

  // ── Week state ──────────────────────────────────────────────────────────────
  const [weekYear, setWeekYear] = useState(CUR_YEAR);
  const [startWeek, setStartWeek] = useState(Math.max(1, CUR_WEEK - 3));
  const [endWeek, setEndWeek] = useState(CUR_WEEK);

  const [cmpWeekYear, setCmpWeekYear] = useState(CUR_YEAR - 1);
  const [cmpStartWeek, setCmpStartWeek] = useState(Math.max(1, CUR_WEEK - 3));
  const [cmpEndWeek, setCmpEndWeek] = useState(CUR_WEEK);

  // ── Month state ─────────────────────────────────────────────────────────────
  const [monthYear, setMonthYear] = useState(CUR_YEAR);
  const [startMonth, setStartMonth] = useState(Math.max(1, CUR_MONTH - 2));
  const [endMonth, setEndMonth] = useState(CUR_MONTH);

  const [cmpMonthYear, setCmpMonthYear] = useState(CUR_YEAR - 1);
  const [cmpStartMonth, setCmpStartMonth] = useState(Math.max(1, CUR_MONTH - 2));
  const [cmpEndMonth, setCmpEndMonth] = useState(CUR_MONTH);

  // ── Apply helpers ───────────────────────────────────────────────────────────

  const applyWeeks = (
    wy: number, sw: number, ew: number,
    cwy: number, csw: number, cew: number,
  ) => {
    onChange({
      from_date: fmtD(getMondayOfWeek(wy, sw)),
      to_date: fmtD(getSundayOfWeek(wy, ew)),
      compare_from: fmtD(getMondayOfWeek(cwy, csw)),
      compare_to: fmtD(getSundayOfWeek(cwy, cew)),
    });
  };

  const applyMonths = (
    my: number, sm: number, em: number,
    cmy: number, csm: number, cem: number,
  ) => {
    onChange({
      from_date: fmtD(new Date(my, sm - 1, 1)),
      to_date: fmtD(new Date(my, em, 0)),       // day 0 = last day of prev month
      compare_from: fmtD(new Date(cmy, csm - 1, 1)),
      compare_to: fmtD(new Date(cmy, cem, 0)),
    });
  };

  // ── Week handlers ───────────────────────────────────────────────────────────

  const updWeekYear = (y: number) => {
    const maxW = weeksInYear(y);
    const sw = Math.min(startWeek, maxW);
    const ew = Math.max(sw, Math.min(endWeek, maxW));
    setWeekYear(y); setStartWeek(sw); setEndWeek(ew);
    applyWeeks(y, sw, ew, cmpWeekYear, cmpStartWeek, cmpEndWeek);
  };
  const updStartWeek = (v: number) => {
    const ew = Math.max(v, endWeek);
    setStartWeek(v); setEndWeek(ew);
    applyWeeks(weekYear, v, ew, cmpWeekYear, cmpStartWeek, cmpEndWeek);
  };
  const updEndWeek = (v: number) => {
    const sw = Math.min(startWeek, v);
    setEndWeek(v); setStartWeek(sw);
    applyWeeks(weekYear, sw, v, cmpWeekYear, cmpStartWeek, cmpEndWeek);
  };

  const updCmpWeekYear = (y: number) => {
    const maxW = weeksInYear(y);
    const csw = Math.min(cmpStartWeek, maxW);
    const cew = Math.max(csw, Math.min(cmpEndWeek, maxW));
    setCmpWeekYear(y); setCmpStartWeek(csw); setCmpEndWeek(cew);
    applyWeeks(weekYear, startWeek, endWeek, y, csw, cew);
  };
  const updCmpStartWeek = (v: number) => {
    const cew = Math.max(v, cmpEndWeek);
    setCmpStartWeek(v); setCmpEndWeek(cew);
    applyWeeks(weekYear, startWeek, endWeek, cmpWeekYear, v, cew);
  };
  const updCmpEndWeek = (v: number) => {
    const csw = Math.min(cmpStartWeek, v);
    setCmpEndWeek(v); setCmpStartWeek(csw);
    applyWeeks(weekYear, startWeek, endWeek, cmpWeekYear, csw, v);
  };

  // ── Month handlers ──────────────────────────────────────────────────────────

  const updMonthYear = (y: number) => {
    setMonthYear(y);
    applyMonths(y, startMonth, endMonth, cmpMonthYear, cmpStartMonth, cmpEndMonth);
  };
  const updStartMonth = (v: number) => {
    const em = Math.max(v, endMonth);
    setStartMonth(v); setEndMonth(em);
    applyMonths(monthYear, v, em, cmpMonthYear, cmpStartMonth, cmpEndMonth);
  };
  const updEndMonth = (v: number) => {
    const sm = Math.min(startMonth, v);
    setEndMonth(v); setStartMonth(sm);
    applyMonths(monthYear, sm, v, cmpMonthYear, cmpStartMonth, cmpEndMonth);
  };

  const updCmpMonthYear = (y: number) => {
    setCmpMonthYear(y);
    applyMonths(monthYear, startMonth, endMonth, y, cmpStartMonth, cmpEndMonth);
  };
  const updCmpStartMonth = (v: number) => {
    const cem = Math.max(v, cmpEndMonth);
    setCmpStartMonth(v); setCmpEndMonth(cem);
    applyMonths(monthYear, startMonth, endMonth, cmpMonthYear, v, cem);
  };
  const updCmpEndMonth = (v: number) => {
    const csm = Math.min(cmpStartMonth, v);
    setCmpEndMonth(v); setCmpStartMonth(csm);
    applyMonths(monthYear, startMonth, endMonth, cmpMonthYear, csm, v);
  };

  return (
    <div className="flex justify-between items-center gap-3 flex-wrap">
      <div className="flex flex-wrap items-center gap-2">

        {/* ── Report type ── */}
        <Pill className="cursor-pointer hover:bg-slate-50">
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

        {/* ── Primary range ── */}
        <Pill>
          <Calendar size={13} className="text-slate-400 shrink-0" />

          {isWeekly ? (
            /* Weekly: [‹ 2026 ›] W03 → W06 */
            <div className="flex items-center gap-1.5">
              <YearStepper value={weekYear} onChange={updWeekYear} disabled={loading} />
              <span className="text-slate-300 text-xs">·</span>
              <WeekSelect value={startWeek} onChange={updStartWeek} year={weekYear} disabled={loading} />
              <span className="text-slate-400 text-xs">→</span>
              <WeekSelect value={endWeek} onChange={updEndWeek} year={weekYear} disabled={loading} />
            </div>
          ) : (
            /* Monthly: [‹ 2026 ›] Jan → Jun */
            <div className="flex items-center gap-1.5">
              <YearStepper value={monthYear} onChange={updMonthYear} disabled={loading} />
              <span className="text-slate-300 text-xs">·</span>
              <MonthSelect value={startMonth} onChange={updStartMonth} disabled={loading} />
              <span className="text-slate-400 text-xs">→</span>
              <MonthSelect value={endMonth} onChange={updEndMonth} disabled={loading} />
            </div>
          )}
        </Pill>

        {/* ── vs label ── */}
        <span className="text-slate-400 text-xs font-medium px-0.5">vs</span>

        {/* ── Compare range ── */}
        <Pill>
          {isWeekly ? (
            <div className="flex items-center gap-1.5">
              <YearStepper value={cmpWeekYear} onChange={updCmpWeekYear} disabled={loading} />
              <span className="text-slate-300 text-xs">·</span>
              <WeekSelect value={cmpStartWeek} onChange={updCmpStartWeek} year={cmpWeekYear} disabled={loading} />
              <span className="text-slate-400 text-xs">→</span>
              <WeekSelect value={cmpEndWeek} onChange={updCmpEndWeek} year={cmpWeekYear} disabled={loading} />
            </div>
          ) : (
            <div className="flex items-center gap-1.5">
              <YearStepper value={cmpMonthYear} onChange={updCmpMonthYear} disabled={loading} />
              <span className="text-slate-300 text-xs">·</span>
              <MonthSelect value={cmpStartMonth} onChange={updCmpStartMonth} disabled={loading} />
              <span className="text-slate-400 text-xs">→</span>
              <MonthSelect value={cmpEndMonth} onChange={updCmpEndMonth} disabled={loading} />
            </div>
          )}
        </Pill>
      </div>

      {/* ── Shop selector ── */}
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
            <option key={s._id} value={s._id}>{s.name}</option>
          ))}
        </select>
      </Pill>
    </div>
  );
};

export default AnalyticsFilterBar;
