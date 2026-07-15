import { useEffect, useState } from "react";
import { attendanceApi, shopsApi, usersApi } from "../../config/apiCall";
import {
  MapPin,
  Loader2,
  Clock,
  Eye,
  LogIn,
  LogOut,
  Coffee,
  CalendarDays,
  Fingerprint,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";
import Table from "../common/Table";
import Select from "../common/Select";
import Button from "../common/Button";
import WorkedHoursScreen from "./WorkedHoursScreen";
import Dialog from "../common/Dialog";
import { format } from "date-fns";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BreakEntry {
  _id: string;
  break_start: string;
  break_end: string | null;
  break_type: string;
  duration_minutes: number;
  is_manual: boolean;
  manual_by: string | null;
}

interface AttendanceRecord {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
  };
  shop_id: {
    _id: string;
    name: string;
    closes_next_day?: boolean;
  };
  rota_id: {
    _id: string;
    shift_date: string;
    shift_start: string;
    shift_end: string;
    start_time: string;
    end_time: string;
    note?: string;
  } | null;
  punch_in: string;
  punch_out: string | null;
  auto_punch_out_at: string | null;
  punch_out_source: string | null;
  is_manual: boolean;
  manual_by: string | null;
  punch_method: string | null;
  adjusted_minutes: number | null;
  adjusted_at: string | null;
  adjusted_by: string | null;
  adjustment_note: string | null;
  effective_start: string | null;
  effective_end: string | null;
  effective_minutes: number | null;
  effective_source: string | null;
  is_active: boolean;
  archived_at: string | null;
  archived_by: string | null;
  replacement_batch_id: string | null;
  breaks: BreakEntry[];
  createdAt: string;
  updatedAt: string;
  total_break_minutes: number;
  total_break_hours: number;
  breaks_count: number;
  is_on_break: boolean;
  // legacy
  status?: string;
}

interface AttendanceListContainerProps {
  title?: string;
  subtitle?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmtTime = (iso: string | null): string => {
  if (!iso) return "—";
  return format(new Date(iso), "HH:mm");
};

const fmtDate = (iso: string | null): string => {
  if (!iso) return "—";
  return format(new Date(iso), "dd MMM yyyy");
};

const fmtDateTime = (iso: string | null): string => {
  if (!iso) return "—";
  return format(new Date(iso), "dd MMM yyyy, HH:mm");
};

const calcDuration = (start: string, end: string | null): string => {
  if (!end) return "—";
  const diffMins = Math.floor(
    (new Date(end).getTime() - new Date(start).getTime()) / 60000,
  );
  const h = Math.floor(diffMins / 60);
  const m = diffMins % 60;
  return `${h}h ${m}m`;
};

// ─── Record Detail Dialog ─────────────────────────────────────────────────────

interface RecordDetailDialogProps {
  record: AttendanceRecord | null;
  onClose: () => void;
}

const RecordDetailDialog = ({ record, onClose }: RecordDetailDialogProps) => {
  if (!record) return null;

  const name = record.user_id?.name ?? "Unknown";
  const initials = name.slice(0, 2).toUpperCase();
  const isActive = !record.punch_out;

  const InfoRow = ({
    label,
    value,
    mono = false,
  }: {
    label: string;
    value: React.ReactNode;
    mono?: boolean;
  }) => (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-slate-50 last:border-0">
      <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 shrink-0 pt-0.5">
        {label}
      </span>
      <span
        className={`text-xs font-semibold text-slate-700 text-right ${mono ? "font-mono" : ""}`}
      >
        {value}
      </span>
    </div>
  );

  return (
    <Dialog
      isOpen={!!record}
      onClose={onClose}
      title={`${name} — Attendance Record`}
      maxWidth="xl"
      className="max-h-[90vh] overflow-auto"
    >
      <div className="flex flex-col gap-4">
        {/* ── Identity card ── */}
        <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100">
          <div className="w-11 h-11 rounded-xl bg-accent-100 text-accent-700 flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
            {initials}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-primary-800 truncate">
              {name}
            </p>
            <p className="text-xs text-slate-400 font-medium mt-0.5 truncate">
              {record.user_id?.email}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1.5">
              <MapPin size={11} className="text-slate-300" />
              {record.shop_id?.name ?? "Unknown Shop"}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1.5 shrink-0">
            {isActive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-warning-50 text-warning-700 text-[11px] font-bold border border-warning-100">
                <span className="w-1.5 h-1.5 rounded-full bg-warning-500 animate-pulse" />
                Active Shift
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-success-50 text-success-700 text-[11px] font-bold border border-success-100">
                <CheckCircle2 size={11} />
                Completed
              </span>
            )}
            {record.is_on_break && (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-[11px] font-bold border border-blue-100">
                <Coffee size={11} />
                On Break
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* ── Punch times ── */}
          <div className="bg-white rounded-xl border border-slate-100 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
              <Clock size={11} /> Punch Times
            </p>
            <InfoRow
              label="Punch In"
              value={
                <span className="flex items-center gap-1 text-success-700">
                  <LogIn size={11} className="text-success-500" />
                  {fmtDateTime(record.punch_in)}
                </span>
              }
            />
            <InfoRow
              label="Punch Out"
              value={
                record.punch_out ? (
                  <span className="flex items-center gap-1 text-danger-500">
                    <LogOut size={11} className="text-danger-400" />
                    {fmtDateTime(record.punch_out)}
                  </span>
                ) : (
                  <span className="text-warning-500">Still clocked in</span>
                )
              }
            />
            <InfoRow
              label="Duration"
              value={calcDuration(record.punch_in, record.punch_out)}
            />
            <InfoRow
              label="Source"
              value={record.punch_out_source ?? "—"}
            />
            <InfoRow
              label="Method"
              value={
                record.punch_method ? (
                  <span className="inline-flex items-center gap-1">
                    <Fingerprint size={11} className="text-primary-400" />
                    {record.punch_method}
                  </span>
                ) : (
                  "—"
                )
              }
            />
            {record.auto_punch_out_at && (
              <InfoRow
                label="Auto Punch-Out"
                value={fmtDateTime(record.auto_punch_out_at)}
              />
            )}
          </div>

          {/* ── Rota / Schedule ── */}
          <div className="bg-white rounded-xl border border-slate-100 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
              <CalendarDays size={11} /> Scheduled Shift
            </p>
            {record.rota_id ? (
              <>
                <InfoRow
                  label="Shift Date"
                  value={fmtDate(record.rota_id.shift_date)}
                />
                <InfoRow
                  label="Start"
                  value={`${record.rota_id.start_time} (${fmtTime(record.rota_id.shift_start)})`}
                  mono
                />
                <InfoRow
                  label="End"
                  value={`${record.rota_id.end_time} (${fmtTime(record.rota_id.shift_end)})`}
                  mono
                />
                {record.rota_id.note && (
                  <InfoRow label="Note" value={record.rota_id.note} />
                )}
              </>
            ) : (
              <p className="text-xs text-slate-300 italic mt-2">
                No rota linked
              </p>
            )}
          </div>
        </div>

        {/* ── Breaks ── */}
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
              <Coffee size={11} /> Breaks
            </p>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-slate-500">
                {record.breaks_count} break{record.breaks_count !== 1 ? "s" : ""}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">
                {record.total_break_minutes} min total
              </span>
            </div>
          </div>

          {record.breaks && record.breaks.length > 0 ? (
            <Table
              keyExtractor={(b) => b._id}
              data={record.breaks}
              emptyStateMessage="No breaks recorded."
              columns={[
                {
                  header: "#",
                  render: (b) => (
                    <span className="text-[11px] font-semibold text-slate-400">
                      {record.breaks.indexOf(b) + 1}
                    </span>
                  ),
                },
                {
                  header: "Type",
                  render: (b) => (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
                      {b.break_type}
                    </span>
                  ),
                },
                {
                  header: "Start",
                  render: (b) => (
                    <span className="text-xs font-mono text-slate-600">
                      {fmtTime(b.break_start)}
                    </span>
                  ),
                },
                {
                  header: "End",
                  render: (b) => (
                    <span className="text-xs font-mono text-slate-600">
                      {b.break_end ? fmtTime(b.break_end) : (
                        <span className="text-warning-500">Ongoing</span>
                      )}
                    </span>
                  ),
                },
                {
                  header: "Duration",
                  align: "center",
                  render: (b) => (
                    <span className="text-xs font-bold text-slate-700">
                      {b.duration_minutes} min
                    </span>
                  ),
                },
                {
                  header: "Manual",
                  align: "center",
                  render: (b) =>
                    b.is_manual ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-warning-600">
                        <AlertCircle size={10} /> Yes
                      </span>
                    ) : (
                      <span className="text-[10px] text-slate-300 font-medium">
                        —
                      </span>
                    ),
                },
              ]}
            />
          ) : (
            <p className="text-xs text-slate-300 italic">No breaks taken</p>
          )}
        </div>

        {/* ── Adjustments (if any) ── */}
        {(record.adjusted_minutes !== null ||
          record.effective_minutes !== null) && (
          <div className="bg-white rounded-xl border border-slate-100 p-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-1.5">
              <AlertCircle size={11} /> Adjustments
            </p>
            {record.adjusted_minutes !== null && (
              <>
                <InfoRow
                  label="Adjusted Mins"
                  value={`${record.adjusted_minutes} min`}
                />
                <InfoRow
                  label="Adjusted At"
                  value={fmtDateTime(record.adjusted_at)}
                />
                {record.adjustment_note && (
                  <InfoRow label="Note" value={record.adjustment_note} />
                )}
              </>
            )}
            {record.effective_minutes !== null && (
              <>
                <InfoRow
                  label="Effective Mins"
                  value={`${record.effective_minutes} min`}
                />
                <InfoRow
                  label="Effective Start"
                  value={fmtDateTime(record.effective_start)}
                />
                <InfoRow
                  label="Effective End"
                  value={fmtDateTime(record.effective_end)}
                />
                <InfoRow
                  label="Effective Source"
                  value={record.effective_source ?? "—"}
                />
              </>
            )}
          </div>
        )}

        {/* ── Metadata ── */}
        <div className="bg-slate-50 rounded-xl border border-slate-100 p-4">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">
            Metadata
          </p>
          <InfoRow label="Record ID" value={record._id} mono />
          <InfoRow label="Created" value={fmtDateTime(record.createdAt)} />
          <InfoRow label="Updated" value={fmtDateTime(record.updatedAt)} />
          <InfoRow
            label="Is Manual"
            value={record.is_manual ? "Yes" : "No"}
          />
          <InfoRow
            label="Status"
            value={
              record.is_active ? (
                <span className="text-success-600">Active</span>
              ) : (
                <span className="text-danger-500">Archived</span>
              )
            }
          />
        </div>
      </div>
    </Dialog>
  );
};

// ─── Main Component ───────────────────────────────────────────────────────────

const AttendanceListContainer = ({
  title = "Attendance Management",
  subtitle = "Monitor and audit all personnel punch records across locations",
}: AttendanceListContainerProps) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWorkedHours, setShowWorkedHours] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<AttendanceRecord | null>(
    null,
  );

  // Filter state
  const [activeFilters, setActiveFilters] = useState({
    shop_id: "all",
    user_id: "all",
  });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    Promise.all([shopsApi.list(), usersApi.list()])
      .then(([shopsRes, usersRes]) => {
        setShops(shopsRes.data.data.shops || []);
        setUsers(usersRes.data.data?.users || usersRes.data?.users || []);
      })
      .catch((err) => {
        console.error("Error fetching filters data:", err);
        toast.error(err.message || "Failed to load filter data.");
      });
  }, []);

  useEffect(() => {
    setLoading(true);
    const query: Record<string, string> = {
      page: page.toString(),
      limit: limit.toString(),
    };
    if (activeFilters.shop_id !== "all") query.shop_id = activeFilters.shop_id;
    if (activeFilters.user_id !== "all") query.user_id = activeFilters.user_id;

    attendanceApi
      .list(query)
      .then(({ data }) => {
        const resultData = data.data;
        const fetchedRecords = resultData.records || resultData.data || [];
        setRecords(
          fetchedRecords.sort(
            (a: any, b: any) =>
              new Date(b.punch_in).getTime() - new Date(a.punch_in).getTime(),
          ),
        );
        setTotal(resultData.total || 0);
        setTotalPages(resultData.total_pages || resultData.totalPages || 1);
      })
      .catch((err) => {
        console.error("Error fetching attendance:", err);
        toast.error(err.message || "Failed to load attendance records.");
      })
      .finally(() => setLoading(false));
  }, [activeFilters, page, limit]);

  const hasActiveFilters =
    activeFilters.shop_id !== "all" || activeFilters.user_id !== "all";

  const clearFilters = () => {
    setActiveFilters({ shop_id: "all", user_id: "all" });
  };

  if (showWorkedHours) {
    return <WorkedHoursScreen onBack={() => setShowWorkedHours(false)} />;
  }

  if (loading && records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="animate-spin mb-4 text-primary-500" size={32} />
        <p className="text-sm font-black uppercase tracking-widest">
          Synchronizing Attendance...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="secondary"
            size="sm"
            leftIcon={<Clock size={14} />}
            onClick={() => setShowWorkedHours(true)}
          >
            View Worked Hours
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <Select
              value={activeFilters.shop_id}
              onChange={(e) =>
                setActiveFilters({ ...activeFilters, shop_id: e.target.value })
              }
            >
              <option value="all">All Shops</option>
              {shops.map((shop) => (
                <option key={shop._id} value={shop._id}>
                  {shop.name}
                </option>
              ))}
            </Select>

            <Select
              value={activeFilters.user_id}
              onChange={(e) =>
                setActiveFilters({ ...activeFilters, user_id: e.target.value })
              }
            >
              <option value="all">All Employees</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </Select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[10px] font-black text-danger-500 hover:text-danger-600 uppercase tracking-widest px-2 transition-colors"
                title="Clear all filters"
              >
                Clear
              </button>
            )}
          </div>

          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-auto">
            {records.length} Recorded Shifts
          </p>
        </div>

        <div className="p-4">
          <Table
            columns={[
              {
                header: "Personnel",
                render: (record) => (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-black text-[10px]">
                      {(record.user_id?.name || "U").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {record.user_id?.name || "Unknown"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {record.user_id?.email}
                      </p>
                    </div>
                  </div>
                ),
              },
              {
                header: "Location",
                render: (record) => (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin size={14} className="text-slate-400" />
                    <span className="text-xs font-medium text-slate-700">
                      {record.shop_id?.name || "Unknown Shop"}
                    </span>
                  </div>
                ),
              },
              {
                header: "Punch In",
                render: (record) => (
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">
                      {fmtTime(record.punch_in)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {fmtDate(record.punch_in)}
                    </span>
                  </div>
                ),
              },
              {
                header: "Punch Out",
                render: (record) =>
                  record.punch_out ? (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">
                        {fmtTime(record.punch_out)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {fmtDate(record.punch_out)}
                      </span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-500 border border-orange-100">
                      Active Shift
                    </span>
                  ),
              },
              {
                header: "Duration",
                align: "center",
                render: (record) => {
                  if (!record.punch_out)
                    return <span className="text-slate-300">--</span>;
                  const start = new Date(record.punch_in).getTime();
                  const end = new Date(record.punch_out).getTime();
                  const diffMins = Math.floor((end - start) / (1000 * 60));
                  const hours = Math.floor(diffMins / 60);
                  const mins = diffMins % 60;
                  return (
                    <span className="text-xs font-semibold text-slate-600">
                      {hours}h {mins}m
                    </span>
                  );
                },
              },
              {
                header: "Break Time",
                align: "center",
                render: (record) => (
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-600">
                      <Coffee size={9} />
                      {record.total_break_minutes ?? 0} min
                    </span>
                    {(record.breaks_count ?? 0) > 0 && (
                      <span className="text-[10px] text-slate-400">
                        {record.breaks_count} break
                        {record.breaks_count !== 1 ? "s" : ""}
                      </span>
                    )}
                  </div>
                ),
              },
              {
                header: "Status",
                align: "center",
                render: (record) => {
                  const status =
                    record.status ||
                    (record.punch_out ? "Completed" : "In Progress");
                  const isSuccess =
                    status === "Present" || status === "Completed";
                  return (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isSuccess
                          ? "bg-success-100 text-success-700"
                          : "bg-warning-100 text-warning-700"
                      }`}
                    >
                      {status}
                    </span>
                  );
                },
              },
              {
                header: "Action",
                align: "center",
                render: (record) => (
                  <button
                    onClick={() => setSelectedRecord(record)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-primary-600 bg-primary-50 hover:bg-primary-100 active:scale-95 transition-all"
                  >
                    <Eye size={12} />
                    View
                  </button>
                ),
              },
            ]}
            data={records}
            keyExtractor={(record) => record._id}
            emptyStateMessage="No attendance records found."
            pagination={{
              page,
              limit,
              total,
              totalPages,
              onPageChange: setPage,
              onLimitChange: (newLimit) => {
                setLimit(newLimit);
                setPage(1);
              },
            }}
          />
        </div>
      </div>

      {/* ── Record Detail Dialog ── */}
      <RecordDetailDialog
        record={selectedRecord}
        onClose={() => setSelectedRecord(null)}
      />
    </div>
  );
};

export default AttendanceListContainer;
