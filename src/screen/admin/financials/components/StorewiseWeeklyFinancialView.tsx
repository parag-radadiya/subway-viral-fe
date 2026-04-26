import {
  ChevronLeft,
  ChevronRight,
  DollarSign,
  Eye,
  Filter,
  Loader2,
  ShoppingBag,
  TrendingUp,
  Truck,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import Dialog from "../../../../components/common/Dialog";
import Input from "../../../../components/common/Input";
import Select from "../../../../components/common/Select";
import Table from "../../../../components/common/Table";
import { financialsApi, shopsApi } from "../../../../config/apiCall";
import { WeekAccordionCard } from "./WeekAccordionCard";
import { SectionHeading } from "./SectionHeading";
import { fmtNum, fmtPct, n } from "./utils";

// ─── KPI badge colours ────────────────────────────────────────────────────────
const kpiCards = (m: any) => [
  {
    label: "Net Sales",
    val: `£${fmtNum(n(m["NET SALES"]))}`,
    bg: "bg-blue-50 text-blue-700 border-blue-100",
  },
  {
    label: "Total 3PD",
    val: `£${fmtNum(n(m["Total 3PD Sale"]))}`,
    bg: "bg-orange-50 text-orange-700 border-orange-100",
  },
  {
    label: "Delivery %",
    val: fmtPct(n(m["Delivery %"])),
    bg: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  {
    label: "Labour %",
    val: fmtPct(n(m["Labour cost %"])),
    bg: "bg-violet-50 text-violet-700 border-violet-100",
  },
  {
    label: "Food Cost %",
    val: fmtPct(n(m["Food cost %"])),
    bg: "bg-rose-50 text-rose-700 border-rose-100",
  },
  {
    label: "Total Cost %",
    val: fmtPct(n(m["TOTAL COST %"])),
    bg: "bg-slate-100 text-slate-700 border-slate-200",
  },
];

// ─── Record detail body (rendered inside Dialog) ─────────────────────────────
function RecordDetailBody({ record }: { record: any }) {
  const m = record.metrics || {};

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      {/* Identity strip */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl px-4 py-3">
        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
          W{record.weekNumber}
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
            {record.shopName}
          </p>
          <p className="text-sm font-bold text-white">
            {record.weekRange} ({record.year})
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
        {/* Sales */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm">
          <SectionHeading
            icon={<TrendingUp size={12} />}
            title="Sales"
            accent="text-emerald-700"
          />
          <div className="space-y-1.5 mt-3 text-[11px]">
            {[
              ["Gross Sales", `£${fmtNum(n(m["GROSS SALES"]))}`],
              ["VAT", `£${fmtNum(n(m["VAT"]))}`],
              ["VAT %", fmtPct(n(m["VAT %"]))],
              ["Adjusted VAT", `£${fmtNum(n(m["Adjusted VAT"]))}`],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span className="text-slate-500">{label}</span>
                <span className="font-bold text-slate-700">{val}</span>
              </div>
            ))}
            <div className="flex justify-between pt-1.5 border-t border-slate-200">
              <span className="text-slate-500 font-semibold">Net Sales</span>
              <span className="font-bold text-slate-800">
                £{fmtNum(n(m["NET SALES"]))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">Delivery %</span>
              <span className="font-bold text-slate-800">
                {fmtPct(n(m["Delivery %"]))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">
                Total 3PD Sale
              </span>
              <span className="font-bold text-slate-800">
                £{fmtNum(n(m["Total 3PD Sale"]))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Customer Count</span>
              <span className="font-bold text-slate-700">
                {fmtNum(n(m["Customer Count"]))}
              </span>
            </div>
          </div>
        </div>

        {/* Delivery Platforms */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm">
          <SectionHeading
            icon={<Truck size={12} />}
            title="Delivery"
            accent="text-blue-700"
          />
          <div className="space-y-3 mt-3 text-[11px]">
            {[
              {
                name: "JustEat",
                sale: m["JustEat Sale"],
                charge: m["JUST Charge"],
                vat: m["JustEat 20% Vat"],
                receive: m["Receive from Justeat"],
              },
              {
                name: "Uber Eats",
                sale: m["UberEat Sale"],
                charge: m["UBEREAT Charge"],
                vat: m["UBEREAT 20% Vat"],
                receive: m["Receive From Uber"],
              },
              {
                name: "Deliveroo",
                sale: m["Deliveroo sale"],
                charge: m["DELIVEROO Charge"],
                vat: m["DELIVEROO 20% Vat"],
                receive: m["Recive From Deliveroo"],
              },
            ].map((plat) => (
              <div
                key={plat.name}
                className="border border-slate-200/60 rounded-md p-2 bg-white"
              >
                <div className="text-[9px] uppercase font-bold text-slate-400 mb-1.5">
                  {plat.name}
                </div>
                <div className="grid grid-cols-4 gap-1 text-center divide-x divide-slate-100">
                  {[
                    ["Sale", `£${fmtNum(n(plat.sale))}`],
                    ["Charge", `£${fmtNum(n(plat.charge))}`],
                    ["20% VAT", `£${fmtNum(n(plat.vat))}`],
                    ["Receive", `£${fmtNum(n(plat.receive))}`],
                  ].map(([lbl, val]) => (
                    <div key={lbl}>
                      <div className="text-[9px] text-slate-400">{lbl}</div>
                      <div className="font-bold text-slate-700">{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Costs & Labour */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm">
          <SectionHeading
            icon={<DollarSign size={12} />}
            title="Costs & Labour"
            accent="text-violet-700"
          />
          <div className="space-y-1.5 mt-3 text-[11px]">
            {[
              ["Delivery Total", `£${fmtNum(n(m["delivery Charges TOTAL"]))}`],
              ["Delivery %", fmtPct(n(m["Delivery Charge %"]))],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span className="text-slate-500">{label}</span>
                <span className="font-bold text-slate-700">{val}</span>
              </div>
            ))}
            <div className="flex justify-between pt-1.5 border-t border-slate-200">
              <span className="text-slate-500">Labour Hours</span>
              <span className="font-bold text-slate-700">
                {fmtNum(n(m["LABOUR HOURS"]))}
              </span>
            </div>
            {[
              ["Labour Cost", `£${fmtNum(n(m["LABOUR COST "]))}`],
              ["Labour Cost %", fmtPct(n(m["Labour cost %"]))],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span className="text-slate-500">{label}</span>
                <span className="font-bold text-slate-700">{val}</span>
              </div>
            ))}
            <div className="flex justify-between pt-1.5 border-t border-slate-200">
              <span className="text-slate-500">Food Cost (BID)</span>
              <span className="font-bold text-slate-700">
                £{fmtNum(n(m["BID FOOD "]))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Food Cost %</span>
              <span className="font-bold text-slate-700">
                {fmtPct(n(m["Food cost %"]))}
              </span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-slate-200">
              <span className="text-slate-500 font-semibold">Total Cost %</span>
              <span className="font-bold border px-1.5 py-0.5 rounded-md text-slate-800 bg-white shadow-sm border-slate-200">
                {fmtPct(n(m["TOTAL COST %"]))}
              </span>
            </div>
          </div>
        </div>

        {/* Instore & Variables */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm">
          <SectionHeading
            icon={<ShoppingBag size={12} />}
            title="Instore & Variables"
            accent="text-rose-700"
          />
          <div className="space-y-1.5 mt-3 text-[11px]">
            <div className="flex justify-between">
              <span className="text-slate-500">Instore Food Cost</span>
              <span className="font-bold text-slate-700">
                {fmtPct(n(m["Instore Food Cost"]) / 100)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Instore Labour Cost</span>
              <span className="font-bold text-slate-700">
                {fmtPct(n(m["Instore Labour Cost"]) / 100)}
              </span>
            </div>
            <div className="flex justify-between pt-1.5 border-t border-slate-200">
              <span className="text-slate-500">Bidfood Prev Week</span>
              <span className="font-bold text-slate-700">
                £{fmtNum(n(m["Previous Week"]))}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500 font-semibold">
                Bidfood Diff Total
              </span>
              <span className="font-bold text-slate-800">
                £{fmtNum(n(m["Bidfood Total"]))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const ViewByWeek = ({
  data,
  onView,
  page,
  limit,
  total,
  totalPages,
  onPageChange,
  onLimitChange,
}: {
  data: any[];
  onView: (record: any) => void;
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  onPageChange: (p: number) => void;
  onLimitChange: (l: number) => void;
}) => {
  // Group by weekRange, then sort groups by weekNumber ascending
  const weeklyData = useMemo(() => {
    const grouped = data.reduce<Record<string, any[]>>((obj, itm) => {
      const key = itm.weekRange ?? "Unknown";
      obj[key] = [itm, ...(obj[key] ?? [])];
      return obj;
    }, {});
    return Object.entries(grouped).sort(([, a], [, b]) => {
      const wA = Number(a[0]?.weekNumber ?? 0);
      const wB = Number(b[0]?.weekNumber ?? 0);
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
      {weeklyData.map(([weekRange, shops]) => (
        <WeekAccordionCard
          key={weekRange}
          weekRange={weekRange}
          shops={shops}
          onView={onView}
        />
      ))}

      {/* Pagination bar — matches Table component style */}
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
export function StorewiseWeeklyFinancialView() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any | null>(null);
  const [shops, setShops] = useState<any[]>([]);
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);

  // Committed (live) filter state — drives the API call
  const [viewMode, setViewMode] = useState<"all" | "by_week">("all");
  const [shopId, setShopId] = useState("all");
  const [weekNumber, setWeekNumber] = useState("");
  const [monthNumber, setMonthNumber] = useState("");
  const [year, setYear] = useState("");

  // Draft state — lives only while the dialog is open
  const [draft, setDraft] = useState({
    viewMode: "all" as "all" | "by_week",
    shopId: "all",
    weekNumber: "",
    monthNumber: "",
    year: "",
  });

  const openFilterDialog = () => {
    // Seed draft from live values
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

  // Pagination
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch shops once
  useEffect(() => {
    shopsApi
      .list()
      .then((res: any) => {
        setShops(res.data.data.shops || []);
      })
      .catch(() => {});
  }, []);

  // Fetch records whenever committed filters or pagination change
  useEffect(() => {
    setList([]);
    setLoading(true);
    const raw: Record<string, string> = {
      view: "reconciled",
      report_type: "weekly_financial",
      page: String(page),

      include_weekly_totals: `${viewMode === "by_week"}`,
    };
    if (weekNumber.trim()) raw.week_number = weekNumber.trim();
    if (monthNumber.trim()) raw.month = monthNumber.trim();
    if (year.trim()) raw.year = year.trim();
    raw.limit = String(limit);

    if (viewMode === "all") {
      if (shopId !== "all") raw.shop_id = shopId;
    } else {
      raw.pagination_basis = "week_number";
    }
    financialsApi
      .list(new URLSearchParams(raw).toString())
      .then(({ data }: any) => {
        const d = data.data;
        setList(d.rows ?? d.data ?? []);
        setTotal(d.pagination?.total ?? d.count ?? 0);
        setTotalPages(d.pagination?.page_count ?? 1);
      })
      .catch(() => {
        setList([]);
        setTotal(0);
        setTotalPages(1);
      })
      .finally(() => setLoading(false));
  }, [page, limit, viewMode, shopId, weekNumber, monthNumber, year]);

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
      {/* Filter bar — inside the card */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-3">
        {/* Filter button */}
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

        {/* Active filter chips */}
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

        {/* Clear */}
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

      {/* ─── Filter Dialog ──────────────────────────────────────────────────────────── */}
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
          {/* View toggle */}
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

          {/* Conditional fields — only shown in ALL mode */}
          {draft.viewMode === "all" && (
            <div className="space-y-3">
              {/* Shop */}
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
                  {shops.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name}
                    </option>
                  ))}
                </Select>
              </div>
            </div>
          )}

          {/* Week number */}
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

          {/* Month number */}
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

          {/* Year */}
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

      {/* Table */}
      <div className="p-4">
        {viewMode === "all" && (
          <Table
            columns={[
              {
                header: "Week",
                render: (r) => (
                  <div className="flex items-center gap-2">
                    <span className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                      W{r.weekNumber}
                    </span>
                    <div>
                      <p className="text-xs font-semibold text-slate-700">
                        {r.weekRange}
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
                    {r.shopName ?? "—"}
                  </span>
                ),
              },
              {
                header: "Net Sales",
                align: "right",
                render: (r) => (
                  <span className="text-xs font-bold text-emerald-700">
                    £{fmtNum(n(r.metrics?.["NET SALES"]))}
                  </span>
                ),
              },
              {
                header: "Total 3PD",
                align: "right",
                render: (r) => (
                  <span className="text-xs font-semibold text-slate-700">
                    £{fmtNum(n(r.metrics?.["Total 3PD Sale"]))}
                  </span>
                ),
              },
              {
                header: "Delivery %",
                align: "center",
                render: (r) => (
                  <span className="text-xs font-semibold text-blue-700">
                    {fmtPct(n(r.metrics?.["Delivery %"]))}
                  </span>
                ),
              },
              {
                header: "Labour %",
                align: "center",
                render: (r) => (
                  <span className="text-xs font-semibold text-violet-700">
                    {fmtPct(n(r.metrics?.["Labour cost %"]))}
                  </span>
                ),
              },
              {
                header: "Food Cost %",
                align: "center",
                render: (r) => (
                  <span className="text-xs font-semibold text-orange-700">
                    {fmtPct(n(r.metrics?.["Food cost %"]))}
                  </span>
                ),
              },
              {
                header: "Total Cost %",
                align: "center",
                render: (r) => {
                  const pct = n(r.metrics?.["TOTAL COST %"]);
                  const colour =
                    pct > 70
                      ? "text-rose-700 bg-rose-50 border-rose-200"
                      : pct > 55
                        ? "text-amber-700 bg-amber-50 border-amber-200"
                        : "text-emerald-700 bg-emerald-50 border-emerald-200";
                  return (
                    <span
                      className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${colour}`}
                    >
                      {fmtPct(pct)}
                    </span>
                  );
                },
              },
              {
                header: "Actions",
                align: "right",
                render: (r) => (
                  <button
                    onClick={() => setSelectedRecord(r)}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-800 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors"
                    title="View details"
                  >
                    <Eye size={14} />
                    View
                  </button>
                ),
              },
            ]}
            data={list}
            keyExtractor={(r) => r.id ?? r._id}
            emptyStateMessage="No weekly financial records found. Click Add Record to upload data."
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
            page={page}
            limit={limit}
            total={total}
            totalPages={totalPages}
            onPageChange={setPage}
            onLimitChange={(newLimit) => {
              setLimit(newLimit);
              setPage(1);
            }}
          />
        )}
      </div>

      {/* Detail dialog */}
      <Dialog
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title={
          selectedRecord
            ? `Week ${selectedRecord.weekNumber} — ${selectedRecord.shopName ?? ""}`
            : "Record Detail"
        }
        maxWidth="full"
        className="max-w-5xl"
      >
        {selectedRecord && <RecordDetailBody record={selectedRecord} />}
      </Dialog>
    </div>
  );
}
