import { useEffect, useState } from "react";
import { attendanceApi, shopsApi } from "../../config/apiCall";
import { PayrollReportData } from "../../utils/generatePayrollPDF";
import PayrollReportDialog from "./PayrollReportDialog";
import {
  ArrowLeft,
  Clock,
  FileText,
  Loader2,
  User,
  TrendingUp,
  Eye,
  CalendarDays,
  LogIn,
  LogOut,
  Hash,
  Timer,
} from "lucide-react";
import Button from "../common/Button";
import { toast } from "react-toastify";
import Select from "../common/Select";
import Input from "../common/Input";
import { StatCard } from "../common/Card";
import Table from "../common/Table";
import Dialog from "../common/Dialog";
import { format } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserSummaryRecord {
  user_id: string;
  name: string;
  email: string;
  records_count: number;
  total_work_hours: number;
  total_actual_hours: number;
}

interface BreakEntry {
  _id: string;
  break_start: string;
  break_end: string | null;
  break_type: "Lunch" | "Other";
  duration_minutes: number | null;
  is_manual: boolean;
  manual_by: string | null;
}

interface Shift {
  _id: string;
  shift_date: string; // "YYYY-MM-DD"
  punch_in: string | null;
  punch_out: string | null;
  work_hours: number;
  work_minutes: number;
  shop_id: { _id: string; name: string };
  rota_id?: {
    shift_date?: string;
    shift_end?: string;
    shift_start: string;
    start_time?: string;
    end_time?: string;
    note?: string;
  };
  breaks?: BreakEntry[];
  total_break_hours?: number;
  total_break_minutes?: number;
  is_on_break?: boolean;
}

interface StaffDetail {
  user_id: string;
  name: string | null;
  email: string | null;
  records_count: number;
  total_work_hours: number;
  total_actual_hours: number;
  total_break_hours?: number;
  first_punch_in: string | null;
  last_punch_out: string | null;
  shifts: Shift[];
}

interface WorkedHoursScreenProps {
  onBack: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate(),
  ).padStart(2, "0")}`;

const initDates = () => {
  const to = new Date();
  const from = new Date();
  from.setDate(from.getDate() - 7);
  return { from: fmtDate(from), to: fmtDate(to) };
};

const fmtTime = (iso: string | null): string => {
  if (!iso) return "—";
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const fmtShiftDate = (dateStr: string): string => {
  if (!dateStr) return "—";
  return format(dateStr, "dd MMM yyyy");
};

// ─── Staff Detail Dialog ──────────────────────────────────────────────────────

interface StaffDetailDialogProps {
  /** The summary row that was clicked — used for initial display & the API call */
  summary: UserSummaryRecord | null;
  /** Currently selected shop in the parent page */
  shopId: string;
  /** Date range from the parent page (YYYY-MM-DD) */
  fromDate: string;
  toDate: string;
  onClose: () => void;
}

const StaffDetailDialog = ({
  summary,
  shopId,
  fromDate,
  toDate,
  onClose,
}: StaffDetailDialogProps) => {
  const [detail, setDetail] = useState<StaffDetail | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!summary) return;

    setDetail(null);
    setLoading(true);

    attendanceApi
      .getStaffShifts({
        shop_id: shopId !== "all" ? shopId : "", // API requires shop_id
        from_date: fromDate,
        to_date: toDate,
        user_id: summary.user_id,
      })
      .then(({ data }) => {
        const staff: StaffDetail[] = data?.data?.staff ?? [];
        // The response returns an array; find our user or use the first entry
        const found =
          staff.find((s) => s.user_id === summary.user_id) ?? staff[0] ?? null;
        setDetail(found);
      })
      .catch((err) => {
        toast.error(
          err?.response?.data?.message ?? "Failed to load shift details.",
        );
      })
      .finally(() => setLoading(false));
  }, [summary, shopId, fromDate, toDate]);

  const displayName =
    detail?.name ?? summary?.name ?? summary?.user_id ?? "Unknown";
  const initials = displayName.slice(0, 2).toUpperCase();
  const hasOpenShift = detail?.shifts?.some((s) => s.punch_out === null);

  return (
    <Dialog
      isOpen={!!summary}
      onClose={onClose}
      title={`${displayName} — Shift Details`}
      maxWidth="2xl"
      className="max-h-[90vh] overflow-auto"
    >
      {/* ── Loading ── */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Loader2 className="animate-spin text-accent-500" size={32} />
          <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
            Loading shifts…
          </p>
        </div>
      )}

      {/* ── Main content ── */}
      {!loading && detail && (
        <div className="flex flex-col gap-3">
          {/* ── Employee identity card ── */}
          <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
            {/* Avatar */}
            <div className="w-11 h-11 rounded-xl bg-accent-100 text-accent-700 flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
              {initials}
            </div>

            {/* Name + email + date range */}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-primary-800 leading-snug truncate">
                {displayName}
              </p>
              {detail.email && (
                <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
                  {detail.email}
                </p>
              )}
              <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5 flex-wrap">
                <CalendarDays size={11} className="text-slate-300" />
                <span>
                  {fmtShiftDate(fromDate)}
                  <span className="mx-1 text-slate-200">→</span>
                  {fmtShiftDate(toDate)}
                </span>
                {(detail.first_punch_in || detail.last_punch_out) && (
                  <>
                    <span className="text-slate-200 mx-1">·</span>
                    <span>
                      First in:{" "}
                      {detail.first_punch_in
                        ? fmtShiftDate(detail.first_punch_in.slice(0, 10))
                        : "—"}
                    </span>
                    <span className="text-slate-200 mx-1">·</span>
                    <span>
                      Last out:{" "}
                      {detail.last_punch_out
                        ? fmtShiftDate(detail.last_punch_out.slice(0, 10))
                        : "ongoing"}
                    </span>
                  </>
                )}
              </p>
            </div>

            {/* Active shift badge */}
            {hasOpenShift && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-warning-50 text-warning-700 text-[11px] font-bold border border-warning-100 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-warning-500 animate-pulse" />
                Active shift
              </span>
            )}
          </div>

          {/* ── 3 stat mini-cards ── */}
          <div className="grid grid-cols-3 gap-2">
            <div className="stat-card !p-3 flex flex-col items-center gap-0">
              <p className="text-lg font-bold text-primary-900">
                {detail.total_work_hours.toFixed(1)}
                <span className="text-xs font-semibold text-slate-400 ml-0.5">
                  h
                </span>
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Work Hours
              </p>
            </div>
            <div className="stat-card !p-3 flex flex-col items-center gap-0">
              <p className="text-lg font-bold text-primary-900">
                {detail.total_actual_hours.toFixed(1)}
                <span className="text-xs font-semibold text-slate-400 ml-0.5">
                  h
                </span>
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Actual Hours
              </p>
            </div>
            <div className="stat-card !p-3 flex flex-col items-center gap-0">
              <p className="text-lg font-bold text-primary-900">
                {detail.records_count}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                Shifts
              </p>
            </div>
          </div>

          {/* ── Shifts table (project Table component) ── */}
          {detail.shifts && detail.shifts.length > 0 ? (
            <Table
              keyExtractor={(s) => s._id}
              data={detail.shifts}
              emptyStateMessage="No shifts in this date range."
              columns={[
                {
                  header: "#",
                  render: (s) => (
                    <span className="text-[11px] font-semibold text-slate-400">
                      {detail.shifts.indexOf(s) + 1}
                    </span>
                  ),
                },
                {
                  header: "Date",
                  render: (s) => (
                    <span className="text-sm font-semibold text-primary-800 whitespace-nowrap">
                      {fmtShiftDate(s.shift_date)}
                    </span>
                  ),
                },
                {
                  header: "Scheduled",
                  render: (s) => (
                    <span className="text-xs font-medium text-slate-500 whitespace-nowrap">
                      {/* {s.rota_id?.start_time && s.rota_id?.end_time
                        ? `${s.rota_id.start_time} – ${s.rota_id.end_time}`
                        : "—"} */}
                      {s.rota_id?.shift_start
                        ? format(new Date(s.rota_id?.shift_start), "HH:mm")
                        : ""}{" "}
                      -{" "}
                      {s.rota_id?.shift_end
                        ? format(new Date(s.rota_id.shift_end), "HH:mm")
                        : "TBA"}
                    </span>
                  ),
                },
                {
                  header: "Punch In",
                  render: (s) => (
                    <span className="inline-flex items-center gap-1 text-success-700 text-xs font-semibold whitespace-nowrap">
                      <LogIn size={11} className="text-success-500" />
                      {fmtTime(s.punch_in)}
                    </span>
                  ),
                },
                {
                  header: "Punch Out",
                  render: (s) =>
                    s.punch_out === null ? (
                      <span className="inline-flex items-center gap-1.5 text-warning-600 text-xs font-semibold whitespace-nowrap">
                        <span className="w-1.5 h-1.5 rounded-full bg-warning-500 animate-pulse" />
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-danger-500 text-xs font-semibold whitespace-nowrap">
                        <LogOut size={11} className="text-danger-400" />
                        {fmtTime(s.punch_out)}
                      </span>
                    ),
                },
                {
                  header: "Work Hrs",
                  align: "center",
                  render: (s) => (
                    <span className="text-sm font-bold text-primary-800">
                      {s.punch_out === null ? (
                        <span className="text-warning-400">—</span>
                      ) : (
                        `${s.work_hours.toFixed(1)}h`
                      )}
                    </span>
                  ),
                },
                {
                  header: "Status",
                  align: "center",
                  render: (s) =>
                    s.punch_out === null ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-warning-50 text-warning-700 text-[10px] font-bold border border-warning-100 whitespace-nowrap">
                        In Progress
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-success-50 text-success-700 text-[10px] font-bold border border-success-100">
                        Done
                      </span>
                    ),
                },
              ]}
            />
          ) : (
            <div className="flex flex-col items-center justify-center py-8 bg-slate-50 rounded-xl border border-slate-100">
              <Clock size={26} className="mb-1.5 text-slate-200" />
              <p className="text-sm font-semibold text-slate-400">
                No shifts found
              </p>
              <p className="text-xs text-slate-300 mt-0.5">
                No records in this date range.
              </p>
            </div>
          )}
        </div>
      )}

      {/* ── Empty / no-access state ── */}
      {!loading && !detail && (
        <div className="flex flex-col items-center justify-center py-10 bg-slate-50 rounded-xl border border-slate-100">
          <Clock size={26} className="mb-1.5 text-slate-200" />
          <p className="text-sm font-semibold text-slate-400">
            No shift data available
          </p>
          <p className="text-xs text-slate-300 mt-0.5">
            Select a specific shop to view shift details.
          </p>
        </div>
      )}
    </Dialog>
  );
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const WorkedHoursScreen = ({ onBack }: WorkedHoursScreenProps) => {
  const [shops, setShops] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<UserSummaryRecord[]>([]);
  const [loading, setLoading] = useState(false);

  /** The summary row for which the detail dialog is open (null = closed) */
  const [dialogSummary, setDialogSummary] = useState<UserSummaryRecord | null>(
    null,
  );

  const { from: defaultFrom, to: defaultTo } = initDates();
  const [shopId, setShopId] = useState("all");
  const [startDate, setStartDate] = useState(defaultFrom);
  const [endDate, setEndDate] = useState(defaultTo);
  const [fetchingPayroll, setFetchingPayroll] = useState(false);
  const [payrollData, setPayrollData] = useState<PayrollReportData | null>(
    null,
  );

  // Load shops once
  useEffect(() => {
    shopsApi
      .list()
      .then((res) => setShops(res.data.data.shops || []))
      .catch(() => {});
  }, []);

  // Auto-fetch summary whenever any filter changes
  useEffect(() => {
    if (!startDate || !endDate) return;
    setLoading(true);
    const query: Record<string, string> = {
      from_date: startDate,
      to_date: endDate,
    };
    if (shopId !== "all") query.shop_id = shopId;

    attendanceApi
      .getUsersSummary(query)
      .then(({ data }) => {
        const raw =
          data?.data?.users ??
          data?.data?.summary ??
          data?.data ??
          data?.users ??
          [];
        setSummaries(Array.isArray(raw) ? raw : []);
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message ?? "Failed to load summary.");
      })
      .finally(() => setLoading(false));
  }, [shopId, startDate, endDate]);

  // Aggregate totals
  const totalWorkHours = summaries.reduce(
    (s, r) => s + (r.total_work_hours ?? 0),
    0,
  );
  const totalActualHours = summaries.reduce(
    (s, r) => s + (r.total_actual_hours ?? 0),
    0,
  );
  const totalRecords = summaries.reduce(
    (s, r) => s + (r.records_count ?? 0),
    0,
  );

  // ── Weekly payroll report ────────────────────────────────────────────────
  const handlePayrollReport = () => {
    if (!startDate || !endDate) {
      toast.error("Set a date range first.");
      return;
    }
    setFetchingPayroll(true);
    attendanceApi
      .weeklyPayrollReport({
        week_start: startDate,
        from_date: startDate,
        to_date: endDate,
        ...(shopId !== "all" ? { shop_id: shopId } : {}),
      })
      .then((res) => {
        const reportData: PayrollReportData = res.data?.data;
        if (!reportData) {
          toast.error("No report data returned.");
          return;
        }
        setPayrollData(reportData);
      })
      .catch((err) => {
        console.error("[Weekly Payroll Report] Error:", err);
        toast.error(
          err?.response?.data?.message ?? "Failed to fetch payroll report.",
        );
      })
      .finally(() => setFetchingPayroll(false));
  };

  return (
    <>
      <div className="space-y-6">
        {/* ── Header + Filters ── */}
        <div className="flex flex-wrap items-center gap-4">
          {/* Back + Title */}
          <div className="flex items-center gap-3 mr-auto">
            <button
              onClick={onBack}
              className="p-2 rounded-lg hover:bg-slate-100 transition-colors text-slate-500 hover:text-slate-800"
              title="Back"
            >
              <ArrowLeft size={18} />
            </button>
            <div>
              <h1 className="text-xl font-bold text-slate-800 tracking-tight">
                Worked Hours
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Summary of hours worked per employee
              </p>
            </div>
          </div>

          {/* Filters inline */}
          <div className="flex items-center gap-3">
            {loading && (
              <Loader2 size={13} className="animate-spin text-slate-400" />
            )}
            {/* Start Date */}
            <Input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <span className="text-slate-300 text-xs">→</span>

            {/* End Date */}
            <Input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />

            {/* Shop */}
            <Select
              value={shopId}
              className="!py-3"
              onChange={(e) => setShopId(e.target.value)}
            >
              <option value="all">All Shops</option>
              {shops.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </Select>

            <Button
              variant="secondary"
              size="sm"
              leftIcon={
                fetchingPayroll ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <FileText size={13} />
                )
              }
              onClick={handlePayrollReport}
              isLoading={fetchingPayroll}
            >
              Payroll Report
            </Button>
          </div>
        </div>

        {/* ── Loading skeleton (first load only — no data yet) ── */}
        {loading && summaries.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <Loader2 className="animate-spin mb-4 text-primary-500" size={32} />
            <p className="text-sm font-black uppercase tracking-widest">
              Calculating hours…
            </p>
          </div>
        )}

        {/* ── Stats summary ── */}
        {summaries.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <StatCard
                title="Work Hours"
                value={`${totalWorkHours.toFixed(1)}h`}
                subtitle="scheduled across all employees"
                icon={<Clock size={18} />}
                variant="info"
              />
              <StatCard
                title="Actual Hours"
                value={`${totalActualHours.toFixed(1)}h`}
                subtitle="actually worked"
                icon={<TrendingUp size={18} />}
                variant="success"
              />
              <StatCard
                title="Employees"
                value={summaries.length.toString()}
                subtitle={`${totalRecords} total records`}
                icon={<User size={18} />}
                variant="default"
              />
            </div>

            {/* ── Table ── */}
            <Table
              keyExtractor={(row) =>
                row.user_id ?? String(summaries.indexOf(row))
              }
              data={summaries}
              emptyStateMessage="No employee records found."
              columns={[
                {
                  header: "Employee",
                  render: (row) => (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-black text-[10px] shrink-0">
                        {(row.name || "U").slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          {row.name || "Unknown"}
                        </p>
                        {row.email && (
                          <p className="text-[10px] text-slate-400 font-medium">
                            {row.email}
                          </p>
                        )}
                      </div>
                    </div>
                  ),
                },
                {
                  header: "Shifts",
                  align: "center",
                  render: (row) => (
                    <span className="inline-flex items-center justify-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      <CalendarDays size={9} />
                      {row.records_count}
                    </span>
                  ),
                },
                {
                  header: "Work Hours",
                  align: "center",
                  render: (row) => {
                    const barWidth = Math.min(
                      100,
                      totalWorkHours > 0
                        ? (row.total_work_hours / totalWorkHours) *
                            100 *
                            summaries.length *
                            0.8
                        : 0,
                    );
                    return (
                      <div className="flex flex-col items-center gap-1">
                        <span className="text-sm font-bold text-slate-800">
                          {`${row.total_work_hours.toFixed(1)}h`}
                        </span>
                        <div className="w-20 h-1.5 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-accent-500 transition-all"
                            style={{ width: `${Math.max(4, barWidth)}%` }}
                          />
                        </div>
                      </div>
                    );
                  },
                },
                {
                  header: "Actual Hours",
                  align: "center",
                  render: (row) => (
                    <span className="text-xs font-semibold text-slate-500">
                      {`${row.total_actual_hours.toFixed(1)}h`}
                    </span>
                  ),
                },
                {
                  header: "Action",
                  align: "center",
                  render: (row) => (
                    <button
                      onClick={() => setDialogSummary(row)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 active:scale-95 transition-all"
                    >
                      <Eye size={12} />
                      View
                    </button>
                  ),
                },
              ]}
            />
          </>
        )}

        {/* ── Empty state ── */}
        {!loading && summaries.length === 0 && (
          <div className="flex flex-col items-center justify-center p-16 bg-white rounded-xl border border-slate-200 shadow-sm text-slate-400">
            <Clock size={36} className="mb-3 text-slate-200" />
            <p className="text-sm font-bold text-slate-500">No data found</p>
            <p className="text-xs mt-1">
              Try adjusting the date range or shop filter.
            </p>
          </div>
        )}

        {/* ── Staff Detail Dialog ── */}
        <StaffDetailDialog
          summary={dialogSummary}
          shopId={shopId}
          fromDate={startDate}
          toDate={endDate}
          onClose={() => setDialogSummary(null)}
        />
      </div>
      {/* ── Payroll Report Full-Screen Dialog ── */}
      <PayrollReportDialog
        data={payrollData}
        onClose={() => setPayrollData(null)}
      />
    </>
  );
};

export default WorkedHoursScreen;
