import { useEffect, useState } from "react";
import { attendanceApi, shopsApi } from "../../config/apiCall";
import {
  ArrowLeft,
  Clock,
  Loader2,
  User,
  TrendingUp,
} from "lucide-react";
import { toast } from "react-toastify";
import Select from "../common/Select";
import Input from "../common/Input";
import { StatCard } from "../common/Card";
import Table from "../common/Table";

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserSummaryRecord {
  user_id: string;
  name: string;
  email: string;
  records_count: number;
  total_work_hours: number;
  total_actual_hours: number;
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
  from.setDate(from.getDate() - 30);
  return { from: fmtDate(from), to: fmtDate(to) };
};

// ─── Main Screen ──────────────────────────────────────────────────────────────

const WorkedHoursScreen = ({ onBack }: WorkedHoursScreenProps) => {
  const [shops, setShops] = useState<any[]>([]);
  const [summaries, setSummaries] = useState<UserSummaryRecord[]>([]);
  const [loading, setLoading] = useState(false);

  const { from: defaultFrom, to: defaultTo } = initDates();
  const [shopId, setShopId] = useState("all");
  const [startDate, setStartDate] = useState(defaultFrom);
  const [endDate, setEndDate] = useState(defaultTo);

  // Load shops once
  useEffect(() => {
    shopsApi
      .list()
      .then((res) => setShops(res.data.data.shops || []))
      .catch(() => {});
  }, []);

  // Auto-fetch whenever any filter changes
  useEffect(() => {
    if (!startDate || !endDate) return;
    setLoading(true);
    const query: Record<string, string> = {
      start_date: startDate,
      end_date: endDate,
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

  return (
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
                header: "Records",
                align: "center",
                render: (row) => (
                  <span className="inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-600">
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
    </div>
  );
};

export default WorkedHoursScreen;
