import { Filter, Loader2, X } from "lucide-react";
import { useEffect, useState } from "react";
import Dialog from "../../../../components/common/Dialog";
import Input from "../../../../components/common/Input";
import Select from "../../../../components/common/Select";
import Table from "../../../../components/common/Table";
import { financialsApi, shopsApi } from "../../../../config/apiCall";
import { fmtNum, fmtPct, n } from "./utils";

export function MonthlyFinancialView() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState<any[]>([]);

  // Filter state
  const [shopId, setShopId] = useState("all");
  const [monthNumber, setMonthNumber] = useState("");
  const [year, setYear] = useState("");
  
  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [draft, setDraft] = useState({ shopId: "all", monthNumber: "", year: "" });

  const hasFilters = shopId !== "all" || monthNumber !== "" || year !== "";

  const openFilterDialog = () => {
    setDraft({ shopId, monthNumber, year });
    setFilterDialogOpen(true);
  };

  const applyFilters = () => {
    setShopId(draft.shopId);
    setMonthNumber(draft.monthNumber);
    setYear(draft.year);
    setPage(1);
    setFilterDialogOpen(false);
  };

  const clearFilters = () => {
    setDraft({ shopId: "all", monthNumber: "", year: "" });
    setShopId("all");
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

  // Fetch records whenever filters or pagination change
  useEffect(() => {
    setList([]);
    setLoading(true);
    const raw: Record<string, string> = {
      group_by: "month",
      page: String(page),
      limit: String(limit),
    };

    if (shopId !== "all") raw.shop_id = shopId;
    if (monthNumber.trim()) raw.month = monthNumber.trim();
    if (year.trim()) raw.year = year.trim();

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
  }, [page, limit, shopId, monthNumber, year]);

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
            className="inline-flex items-center gap-1 text-[10px] font-black text-rose-500 hover:text-rose-600 uppercase tracking-widest px-2 transition-colors"
            title="Clear filters"
          >
            <X size={13} />
            Clear
          </button>
        )}

        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-auto whitespace-nowrap">
          {total} Records
        </p>
      </div>

      {/* Filter Dialog */}
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
      <div className="p-4 relative min-h-[300px]">
        {loading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/80">
            <Loader2 className="animate-spin text-slate-400" size={24} />
          </div>
        )}
        <Table
          columns={[
            {
              header: "Month",
              render: (r) => (
                <div className="flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                    M{r.month || r.monthNumber || "-"}
                  </span>
                  <div>
                    <p className="text-[10px] font-semibold text-slate-400">
                      {r.year || "-"}
                    </p>
                  </div>
                </div>
              ),
            },
            {
              header: "Shop",
              render: (r) => (
                <span className="text-xs font-medium text-slate-600">
                  {r.shopName ?? r.store_name ?? "—"}
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
          ]}
          data={list}
          keyExtractor={(r) => r.id ?? r._id}
          emptyStateMessage="No monthly financial records found. Click Add Record to upload data."
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
  );
}
