import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Eye,
  Filter,
  Loader2,
  X,
  Edit,
  Trash2,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Dialog from "../../../../components/common/Dialog";
import Input from "../../../../components/common/Input";
import Select from "../../../../components/common/Select";
import Table from "../../../../components/common/Table";
import { financialsApi, shopsApi } from "../../../../config/apiCall";
import { fmtNum, fmtPct, n } from "./utils";

// ─── KPI badge colours ────────────────────────────────────────────────────────
const kpiCards = (m: any) => [
  {
    label: "Sales",
    val: `£${fmtNum(n(m?.sales))}`,
    bg: "bg-blue-50 text-blue-700 border-blue-100",
  },
  {
    label: "Net",
    val: `£${fmtNum(n(m?.net))}`,
    bg: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  {
    label: "Labour",
    val: `£${fmtNum(n(m?.labour))}`,
    bg: "bg-violet-50 text-violet-700 border-violet-100",
  },
  {
    label: "Food Cost",
    val: `£${fmtNum(n(m?.food_cost))}`,
    bg: "bg-rose-50 text-rose-700 border-rose-100",
  },
  {
    label: "VAT",
    val: `£${fmtNum(n(m?.vat))}`,
    bg: "bg-slate-100 text-slate-700 border-slate-200",
  },
  {
    label: "Income",
    val: `£${fmtNum(n(m?.income))}`,
    bg: "bg-orange-50 text-orange-700 border-orange-100",
  },
];

// ─── Record detail body (rendered inside Dialog) ─────────────────────────────
function RecordDetailBody({ record }: { record: any }) {
  const m = record.metrics || {};
  const shopName = record.shop_id?.name || record.store_name_raw || "—";

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      {/* Identity strip */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl px-4 py-3">
        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
          W{record.week_number}
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
            {shopName}
          </p>
          <p className="text-sm font-bold text-white">
            {record.week_range_label} ({record.year})
          </p>
        </div>
      </div>

      {/* KPI Top Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
        {kpiCards(m).map((k) => (
          <div key={k.label} className={`rounded-lg border px-3 py-2 ${k.bg}`}>
            <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-0.5">
              {k.label}
            </p>
            <p className="text-sm font-extrabold">{k.val}</p>
          </div>
        ))}
      </div>

      {/* Detail grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
        {/* Further details for Weekly 2026 API */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm">
          <div className="space-y-1.5 mt-3 text-[11px]">
            {[
              ["Sales", `£${fmtNum(n(m.sales))}`],
              ["Net", `£${fmtNum(n(m.net))}`],
              ["VAT", `£${fmtNum(n(m.vat))}`],
              ["Labour", `£${fmtNum(n(m.labour))}`],
              ["Royalties", `£${fmtNum(n(m.royalties))}`],
              ["Food Cost", `£${fmtNum(n(m.food_cost))}`],
              ["Commission", `£${fmtNum(n(m.commision))}`],
              ["Commission %", fmtPct(n(m.commision_percentage))],
              ["Total Deductions", `£${fmtNum(n(m.total))}`],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span className="text-slate-500">{label}</span>
                <span className="font-bold text-slate-700">{val}</span>
              </div>
            ))}
            <div className="flex justify-between pt-1.5 border-t border-slate-200">
              <span className="text-slate-500 font-semibold">Net Income</span>
              <span className="font-bold text-emerald-700 text-sm">
                £{fmtNum(n(m.income))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Weekly Accordion Card ─────────────────────────────────────────────────────
export function WeeklyAccordionCard({ weekRange, shops, onView, onEdit, onDelete }: any) {
  const [isOpen, setIsOpen] = useState(false);
  const first = shops[0] ?? {};

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-slate-800 to-slate-700 text-white text-left"
      >
        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs font-black shrink-0">
          W{first.week_number}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
            {first.year}
          </p>
          <p className="text-sm font-bold truncate">{weekRange}</p>
        </div>
        <span className="text-[10px] font-bold bg-white/10 px-2.5 py-1 rounded-full shrink-0">
          {shops.length} {shops.length === 1 ? "shop" : "shops"}
        </span>
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform duration-200 text-slate-400 ${
            isOpen ? "" : "-rotate-90"
          }`}
        />
      </button>

      {isOpen && (
        <div className="divide-y divide-slate-100 bg-white">
          {shops.map((record: any) => {
            const m = record.metrics ?? {};
            return (
              <div
                key={record._id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
              >
                <div className="w-2 h-2 rounded-full bg-slate-300 shrink-0 ml-1" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {record.shop_id?.name || record.store_name_raw || "—"}
                  </p>
                </div>

                <div className="hidden sm:flex items-center gap-5 shrink-0">
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest">
                      Sales
                    </p>
                    <p className="text-xs font-bold text-emerald-700">
                      £{fmtNum(n(m.sales))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest">
                      Net
                    </p>
                    <p className="text-xs font-bold text-blue-700">
                      £{fmtNum(n(m.net))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest">
                      Income
                    </p>
                    <p className="text-xs font-bold text-orange-700">
                      £{fmtNum(n(m.income))}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 ml-2">
                  <button
                    onClick={() => onView(record)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-800 hover:bg-primary-50 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <Eye size={14} />
                  </button>
                  <button
                    onClick={() => onEdit(record)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-primary-600 hover:bg-primary-50 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <Edit size={14} />
                  </button>
                  <button
                    onClick={() => onDelete(record)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-500 hover:text-rose-600 hover:bg-rose-50 px-2 py-1.5 rounded-lg transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── View By Week ────────────────────────────────────────────────────────────
const ViewByWeek = ({
  data,
  onView,
  onEdit,
  onDelete,
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
}: any) => {
  const weeklyData = useMemo(() => {
    const grouped = data.reduce((obj: any, itm: any) => {
      const key = itm.week_range_label ?? "Unknown";
      obj[key] = [itm, ...(obj[key] ?? [])];
      return obj;
    }, {});
    return Object.entries(grouped).sort(([, a]: any, [, b]: any) => {
      const wA = Number(a[0]?.week_number ?? 0);
      const wB = Number(b[0]?.week_number ?? 0);
      return wA - wB;
    });
  }, [data]);

  if (weeklyData.length === 0) {
    return (
      <div className="py-12 text-center text-slate-400 text-sm">
        No records found.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {weeklyData.map(([weekRange, shops]: any) => (
        <WeeklyAccordionCard
          key={weekRange}
          weekRange={weekRange}
          shops={shops}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}

      <div className="flex flex-col sm:flex-row items-center justify-between px-1 py-3 border-t border-slate-100 gap-4 bg-slate-50/30 rounded-b-xl">
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-medium">
            Rows per page:
          </span>
          <select
            value={limit}
            onChange={(e) => onLimitChange(Number(e.target.value))}
            className="text-xs bg-white border border-slate-200 rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 text-slate-700 font-medium cursor-pointer"
          >
            {[5, 10, 20, 50].map((o) => (
              <option key={o} value={o}>
                {o}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-xs text-slate-500 font-medium">
            Showing{" "}
            <span className="font-bold text-slate-700">
              {Math.min((page - 1) * limit + 1, total)}
            </span>{" "}
            to{" "}
            <span className="font-bold text-slate-700">
              {Math.min(page * limit, total)}
            </span>{" "}
            of <span className="font-bold text-slate-700">{total}</span>
          </span>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onPageChange(page - 1)}
              disabled={page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="flex items-center gap-1 text-xs font-medium text-slate-600 px-2">
              Page {page} of {totalPages}
            </div>
            <button
              onClick={() => onPageChange(page + 1)}
              disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Weekly Financial View ────────────────────────────────────────────────────
export function WeeklyFinancialView() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  const [viewMode, setViewMode] = useState<"all" | "by_week">("all");
  const [shopId, setShopId] = useState("all");
  const [weekNumber, setWeekNumber] = useState("");
  const [monthNumber, setMonthNumber] = useState("");
  const [year, setYear] = useState("");

  const [draft, setDraft] = useState({
    viewMode: "all" as "all" | "by_week",
    shopId: "all",
    weekNumber: "",
    monthNumber: "",
    year: "",
  });

  const openFilterDialog = () => {
    setDraft({ viewMode, shopId, weekNumber, monthNumber, year });
    setFilterDialogOpen(true);
  };

  const applyFilters = () => {
    setViewMode(draft.viewMode);
    setShopId(draft.shopId);
    setWeekNumber(draft.weekNumber);
    setMonthNumber(draft.monthNumber);
    setYear(draft.year);
    setPage(1);
    setFilterDialogOpen(false);
  };

  const clearFilters = () => {
    const empty = {
      viewMode: "all" as const,
      shopId: "all",
      weekNumber: "",
      monthNumber: "",
      year: "",
    };
    setDraft(empty);
    setViewMode("all");
    setShopId("all");
    setWeekNumber("");
    setMonthNumber("");
    setYear("");
    setPage(1);
  };

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    shopsApi
      .list()
      .then((res: any) => {
        setShops(res.data.data.shops || []);
      })
      .catch(() => {});
  }, []);

  const fetchRecords = () => {
    setList([]);
    setLoading(true);
    const raw: Record<string, string> = {
      page: String(page),
      limit: String(limit),
    };
    if (weekNumber.trim()) raw.week_number = weekNumber.trim();
    if (monthNumber.trim()) raw.month = monthNumber.trim();
    if (year.trim()) raw.year = year.trim();

    if (viewMode === "all") {
      if (shopId !== "all") raw.shop_id = shopId;
    }

    financialsApi
      .getWeekly(new URLSearchParams(raw).toString())
      .then(({ data }: any) => {
        const d = data.data;
        setList(d.rows ?? d.data ?? []);
        // API returns total count, calculate pages
        const t = d.count ?? d.total ?? 0;
        setTotal(t);
        setTotalPages(Math.ceil(t / limit) || 1);
      })
      .catch(() => {
        setList([]);
        setTotal(0);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchRecords();
  }, [page, limit, viewMode, shopId, weekNumber, monthNumber, year]);

  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [deletingRecord, setDeletingRecord] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editForm, setEditForm] = useState({
    sales: "",
    net: "",
    vat: "",
    labour: "",
    royalties: "",
    food_cost: "",
    commision: "",
    commision_percentage: "",
  });

  const handleEdit = (record: any) => {
    const m = record.metrics || {};
    setEditForm({
      sales: String(m.sales || ""),
      net: String(m.net || ""),
      vat: String(m.vat || ""),
      labour: String(m.labour || ""),
      royalties: String(m.royalties || ""),
      food_cost: String(m.food_cost || ""),
      commision: String(m.commision || ""),
      commision_percentage: String(m.commision_percentage || ""),
    });
    setEditingRecord(record);
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    setIsSubmitting(true);
    try {
      const payload = {
        metrics: {
          sales: Number(editForm.sales),
          net: Number(editForm.net),
          vat: Number(editForm.vat),
          labour: Number(editForm.labour),
          royalties: Number(editForm.royalties),
          food_cost: Number(editForm.food_cost),
          commision: Number(editForm.commision),
          commision_percentage: Number(editForm.commision_percentage),
        },
      };
      await financialsApi.editWeekly(editingRecord._id, payload);
      toast.success("Record updated successfully");
      setEditingRecord(null);
      fetchRecords();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update record");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingRecord) return;
    setIsDeleting(true);
    try {
      await financialsApi.deleteWeekly(deletingRecord._id);
      toast.success("Record deleted successfully");
      setDeletingRecord(null);
      fetchRecords();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete record");
    } finally {
      setIsDeleting(false);
    }
  };

  const hasFilters =
    viewMode !== "all" ||
    shopId !== "all" ||
    weekNumber !== "" ||
    monthNumber !== "" ||
    year !== "";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <Loader2 className="animate-spin mr-2" size={22} />
        <span className="text-sm font-medium">Loading records…</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-3">
        <button
          onClick={openFilterDialog}
          className={`inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-lg border transition-colors ${
            hasFilters
              ? "bg-primary-50 text-primary-700 border-primary-200"
              : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
          }`}
        >
          <Filter size={14} />
          Filters
          {hasFilters && (
            <span className="ml-0.5 w-4 h-4 rounded-full bg-primary-600 text-white text-[9px] flex items-center justify-center font-black">
              !
            </span>
          )}
        </button>

        <div className="flex flex-wrap gap-1.5">
          {viewMode === "by_week" && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-slate-100 text-slate-700 pl-2 pr-1.5 py-1 rounded-full">
              By Week
              <button
                onClick={() => {
                  setViewMode("all");
                  setPage(1);
                }}
                className="p-0.5 hover:bg-slate-200 rounded-full transition-colors focus:outline-none"
              >
                <X size={10} />
              </button>
            </span>
          )}
          {shopId !== "all" && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-blue-50 text-blue-700 pl-2 pr-1.5 py-1 rounded-full">
              {shops.find((s) => s._id === shopId)?.name ?? "Shop"}
              <button
                onClick={() => {
                  setShopId("all");
                  setPage(1);
                }}
                className="p-0.5 hover:bg-blue-100/80 rounded-full transition-colors focus:outline-none"
              >
                <X size={10} />
              </button>
            </span>
          )}
          {weekNumber && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-violet-50 text-violet-700 pl-2 pr-1.5 py-1 rounded-full">
              Wk {weekNumber}
              <button
                onClick={() => {
                  setWeekNumber("");
                  setPage(1);
                }}
                className="p-0.5 hover:bg-violet-100/80 rounded-full transition-colors focus:outline-none"
              >
                <X size={10} />
              </button>
            </span>
          )}
          {monthNumber && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-emerald-50 text-emerald-700 pl-2 pr-1.5 py-1 rounded-full">
              Month {monthNumber}
              <button
                onClick={() => {
                  setMonthNumber("");
                  setPage(1);
                }}
                className="p-0.5 hover:bg-emerald-100/80 rounded-full transition-colors focus:outline-none"
              >
                <X size={10} />
              </button>
            </span>
          )}
          {year && (
            <span className="inline-flex items-center gap-1 text-[10px] font-semibold bg-orange-50 text-orange-700 pl-2 pr-1.5 py-1 rounded-full">
              {year}
              <button
                onClick={() => {
                  setYear("");
                  setPage(1);
                }}
                className="p-0.5 hover:bg-orange-100/80 rounded-full transition-colors focus:outline-none"
              >
                <X size={10} />
              </button>
            </span>
          )}
        </div>

        {hasFilters && (
          <button
            onClick={clearFilters}
            className="inline-flex items-center gap-1 text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest transition-colors"
          >
            <X size={12} /> Clear
          </button>
        )}

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-auto whitespace-nowrap">
          {total} Records
        </p>
      </div>

      <Dialog
        isOpen={filterDialogOpen}
        onClose={() => setFilterDialogOpen(false)}
        title="Filter Records"
        maxWidth="sm"
        footer={
          <>
            <button
              onClick={() => setFilterDialogOpen(false)}
              className="flex-1 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={applyFilters}
              className="flex-1 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors"
            >
              Apply
            </button>
          </>
        }
      >
        <div className="space-y-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
              View
            </p>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
              {(["all", "by_week"] as const).map((v) => (
                <button
                  key={v}
                  onClick={() => setDraft((d) => ({ ...d, viewMode: v }))}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    draft.viewMode === v
                      ? "bg-white text-slate-800 shadow-sm"
                      : "text-slate-500 hover:text-slate-700"
                  }`}
                >
                  {v === "all" ? "All" : "By Week"}
                </button>
              ))}
            </div>
          </div>

          {draft.viewMode === "all" && (
            <div className="space-y-3">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">
                  Shop
                </label>
                <Select
                  value={draft.shopId}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, shopId: e.target.value }))
                  }
                >
                  <option value="all">All Shops</option>
                  {shops
                    .filter((s) => !s.is_all_shops && s.is_active !== false)
                    .map((s) => (
                      <option key={s._id} value={s._id}>
                        {s.name}
                      </option>
                    ))}
                </Select>
              </div>
            </div>
          )}

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">
              Week Number
            </label>
            <Input
              type="number"
              placeholder="e.g. 14"
              min={1}
              max={53}
              value={draft.weekNumber}
              onChange={(e) =>
                setDraft((d) => ({ ...d, weekNumber: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">
              Month Number
            </label>
            <Input
              type="number"
              placeholder="1 – 12"
              min={1}
              max={12}
              value={draft.monthNumber}
              onChange={(e) =>
                setDraft((d) => ({ ...d, monthNumber: e.target.value }))
              }
            />
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1.5 block">
              Year
            </label>
            <Input
              type="number"
              placeholder="e.g. 2025"
              min={2000}
              max={2100}
              value={draft.year}
              onChange={(e) =>
                setDraft((d) => ({ ...d, year: e.target.value }))
              }
            />
          </div>
        </div>
      </Dialog>

      <div className="p-4">
        {viewMode === "all" && (
          <Table
            columns={[
              {
                header: "Week",
                render: (r) => (
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      W{r.week_number}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        {r.week_range_label}
                      </p>
                      <p className="text-[10px] text-slate-400">{r.year}</p>
                    </div>
                  </div>
                ),
              },
              {
                header: "Shop",
                render: (r) => (
                  <span className="text-xs font-medium text-slate-600">
                    {r.shop_id?.name || r.store_name_raw || "—"}
                  </span>
                ),
              },
              {
                header: "Sales",
                align: "right",
                render: (r) => (
                  <span className="text-xs font-bold text-slate-700">
                    £{fmtNum(n(r.metrics?.sales))}
                  </span>
                ),
              },
              {
                header: "Net",
                align: "right",
                render: (r) => (
                  <span className="text-xs font-bold text-emerald-700">
                    £{fmtNum(n(r.metrics?.net))}
                  </span>
                ),
              },
              {
                header: "Labour",
                align: "center",
                render: (r) => (
                  <span className="text-xs font-semibold text-violet-700">
                    £{fmtNum(n(r.metrics?.labour))}
                  </span>
                ),
              },
              {
                header: "Income",
                align: "center",
                render: (r) => (
                  <span className="text-xs font-semibold text-orange-700">
                    £{fmtNum(n(r.metrics?.income))}
                  </span>
                ),
              },
              {
                header: "Actions",
                align: "right",
                render: (r) => (
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() => setSelectedRecord(r)}
                      className="p-1.5 text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="View details"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => handleEdit(r)}
                      className="p-1.5 text-slate-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Edit Record"
                    >
                      <Edit size={14} />
                    </button>
                    <button
                      onClick={() => setDeletingRecord(r)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Record"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ),
              },
            ]}
            data={list}
            keyExtractor={(r) => r.id ?? r._id}
            emptyStateMessage="No weekly records found."
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
        )}

        {viewMode === "by_week" && (
          <ViewByWeek
            data={list}
            onView={setSelectedRecord}
            onEdit={handleEdit}
            onDelete={setDeletingRecord}
            page={page}
            limit={limit}
            total={total}
            totalPages={totalPages}
            onPageChange={setPage}
            onLimitChange={(newLimit: number) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        )}
      </div>

      <Dialog
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={
          selectedRecord
            ? `Week ${selectedRecord.week_number} — ${selectedRecord.shop_id?.name || selectedRecord.store_name_raw || ""}`
            : "Record Detail"
        }
        maxWidth="full"
        className="max-w-5xl"
      >
        {selectedRecord && <RecordDetailBody record={selectedRecord} />}
      </Dialog>

      {/* Edit Dialog */}
      <Dialog
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        title={`Edit Weekly Record - W${editingRecord?.week_number} ${editingRecord?.shop_id?.name || editingRecord?.store_name_raw || ""}`}
        maxWidth="2xl"
        footer={
          <>
            <button
              onClick={() => setEditingRecord(null)}
              className="flex-1 py-2 rounded-lg border border-slate-200 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              onClick={handleSaveEdit}
              className="flex-1 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 size={14} className="animate-spin" />}
              Save Changes
            </button>
          </>
        }
      >
        {editingRecord && (
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Sales"
              type="number"
              step="0.01"
              value={editForm.sales}
              onChange={(e) => setEditForm({ ...editForm, sales: e.target.value })}
            />
            <Input
              label="Net"
              type="number"
              step="0.01"
              value={editForm.net}
              onChange={(e) => setEditForm({ ...editForm, net: e.target.value })}
            />
            <Input
              label="VAT"
              type="number"
              step="0.01"
              value={editForm.vat}
              onChange={(e) => setEditForm({ ...editForm, vat: e.target.value })}
            />
            <Input
              label="Labour"
              type="number"
              step="0.01"
              value={editForm.labour}
              onChange={(e) => setEditForm({ ...editForm, labour: e.target.value })}
            />
            <Input
              label="Royalties"
              type="number"
              step="0.01"
              value={editForm.royalties}
              onChange={(e) => setEditForm({ ...editForm, royalties: e.target.value })}
            />
            <Input
              label="Food Cost"
              type="number"
              step="0.01"
              value={editForm.food_cost}
              onChange={(e) => setEditForm({ ...editForm, food_cost: e.target.value })}
            />
            <Input
              label="Commission"
              type="number"
              step="0.01"
              value={editForm.commision}
              onChange={(e) => setEditForm({ ...editForm, commision: e.target.value })}
            />
            <Input
              label="Commission %"
              type="number"
              step="0.01"
              value={editForm.commision_percentage}
              onChange={(e) => setEditForm({ ...editForm, commision_percentage: e.target.value })}
            />
          </div>
        )}
      </Dialog>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={!!deletingRecord}
        onClose={() => setDeletingRecord(null)}
        title="Confirm Deletion"
        maxWidth="sm"
        footer={
          <>
            <button
              onClick={() => setDeletingRecord(null)}
              className="flex-1 py-3 text-[10px] font-black text-slate-500 hover:text-slate-700 uppercase tracking-widest rounded-xl hover:bg-slate-200/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-3 bg-danger-600 hover:bg-danger-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-danger-500/30 transition-all"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="animate-spin inline" size={16} />
              ) : (
                "Delete"
              )}
            </button>
          </>
        }
      >
        <div className="text-center pb-2">
          <div className="w-16 h-16 bg-danger-50 text-danger-500 rounded-full flex items-center justify-center mx-auto mb-5">
            <Trash2 size={24} />
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-2 tracking-tight">
            Are you sure?
          </h3>
          <p className="text-sm font-medium text-slate-500">
            Do you really want to delete this record? This action cannot be
            undone and will permanently remove it.
          </p>
        </div>
      </Dialog>
    </div>
  );
}
