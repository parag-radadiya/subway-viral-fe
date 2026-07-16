import { Filter, Loader2, X, Edit, Trash2, Eye } from "lucide-react";
import { useEffect, useState } from "react";
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
    label: "Gross Sales",
    val: `£${fmtNum(n(m?.grossSale))}`,
    bg: "bg-blue-50 text-blue-700 border-blue-100",
  },
  {
    label: "Net Sales",
    val: `£${fmtNum(n(m?.netSale))}`,
    bg: "bg-emerald-50 text-emerald-700 border-emerald-100",
  },
  {
    label: "Customers",
    val: `${fmtNum(n(m?.customerCount))}`,
    bg: "bg-violet-50 text-violet-700 border-violet-100",
  },
  {
    label: "Labour Hrs",
    val: `${fmtNum(n(m?.labourHour))}`,
    bg: "bg-rose-50 text-rose-700 border-rose-100",
  },
  {
    label: "Rev Score",
    val: `${fmtNum(n(m?.revScoreQ1))}`,
    bg: "bg-orange-50 text-orange-700 border-orange-100",
  },
];

// ─── Record detail body (rendered inside Dialog) ─────────────────────────────
function RecordDetailBody({ record }: { record: any }) {
  const m = record.metrics || {};
  const shopName = record.shop_id?.name || record.store_name || "—";

  return (
    <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
      {/* Identity strip */}
      <div className="flex items-center gap-3 bg-gradient-to-r from-slate-800 to-slate-700 rounded-xl px-4 py-3">
        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white shrink-0">
          M{record.month || record.monthNumber || "-"}
        </div>
        <div>
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
            {shopName}
          </p>
          <p className="text-sm font-bold text-white">
            {record.year || "-"}
          </p>
        </div>
      </div>

      {/* KPI Top Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
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
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm">
          <div className="space-y-1.5 mt-3 text-[11px]">
            {[
              ["Gross Sales", `£${fmtNum(n(m.grossSale))}`],
              ["Net Sales", `£${fmtNum(n(m.netSale))}`],
              ["Customer Count", `${fmtNum(n(m.customerCount))}`],
              ["Bidfood", `£${fmtNum(n(m.bidfood))}`],
              ["Labour Hour", `${fmtNum(n(m.labourHour))}`],
              ["Kiosk %", `${fmtNum(n(m.kioskPct))}%`],
            ].map(([label, val]) => (
              <div key={label} className="flex justify-between">
                <span className="text-slate-500">{label}</span>
                <span className="font-bold text-slate-700">{val}</span>
              </div>
            ))}
            <div className="flex justify-between pt-1.5 border-t border-slate-200">
              <span className="text-slate-500 font-semibold">Rev Score Q1</span>
              <span className="font-bold text-emerald-700 text-sm">
                {fmtNum(n(m.revScoreQ1))}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MonthlyFinancialView() {
  const [list, setList] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [shops, setShops] = useState<any[]>([]);

  // Filter state
  const [shopId, setShopId] = useState("all");
  const [monthNumber, setMonthNumber] = useState("");
  const [year, setYear] = useState("");

  const [filterDialogOpen, setFilterDialogOpen] = useState(false);
  const [draft, setDraft] = useState({
    shopId: "all",
    monthNumber: "",
    year: "",
  });

  const [editingRecord, setEditingRecord] = useState<any>(null);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);
  const [deletingRecord, setDeletingRecord] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [editForm, setEditForm] = useState({
    grossSale: "",
    netSale: "",
    customerCount: "",
    bidfood: "",
    labourHour: "",
    kioskPct: "",
    revScoreQ1: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const fetchRecords = () => {
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
      .getMonthlySale(new URLSearchParams(raw).toString())
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
  };

  useEffect(() => {
    fetchRecords();
  }, [page, limit, shopId, monthNumber, year]);

  const handleEdit = (record: any) => {
    const m = record.metrics || {};
    setEditForm({
      grossSale: String(m.grossSale || ""),
      netSale: String(m.netSale || ""),
      customerCount: String(m.customerCount || ""),
      bidfood: String(m.bidfood || ""),
      labourHour: String(m.labourHour || ""),
      kioskPct: String(m.kioskPct || ""),
      revScoreQ1: String(m.revScoreQ1 || ""),
    });
    setEditingRecord(record);
  };

  const handleSaveEdit = async () => {
    if (!editingRecord) return;
    setIsSubmitting(true);
    try {
      const payload = {
        metrics: {
          grossSale: Number(editForm.grossSale),
          netSale: Number(editForm.netSale),
          customerCount: Number(editForm.customerCount),
          bidfood: Number(editForm.bidfood),
          labourHour: Number(editForm.labourHour),
          kioskPct: Number(editForm.kioskPct),
          revScoreQ1: Number(editForm.revScoreQ1),
        },
      };
      await financialsApi.editMonthlySale(editingRecord._id, payload);
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
      await financialsApi.deleteMonthlySale(deletingRecord._id);
      toast.success("Record deleted successfully");
      setDeletingRecord(null);
      fetchRecords();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete record");
    } finally {
      setIsDeleting(false);
    }
  };

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
              {shops
                .filter((s) => !s.is_all_shops && s.is_active !== false)
                .map((s) => (
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
                  {r.shop_id?.name ?? r.store_name ?? "—"}
                </span>
              ),
            },
            {
              header: "Gross Sales",
              align: "right",
              render: (r) => (
                <span className="text-xs font-semibold text-slate-700">
                  £{fmtNum(n(r.metrics?.grossSale))}
                </span>
              ),
            },
            {
              header: "Net Sales",
              align: "right",
              render: (r) => (
                <span className="text-xs font-bold text-emerald-700">
                  £{fmtNum(n(r.metrics?.netSale))}
                </span>
              ),
            },
            {
              header: "Customer Count",
              align: "right",
              render: (r) => (
                <span className="text-xs font-semibold text-blue-700">
                  {fmtNum(n(r.metrics?.customerCount))}
                </span>
              ),
            },
            {
              header: "VAT",
              align: "right",
              render: (r) => (
                <span className="text-xs font-semibold text-slate-700">
                  £{fmtNum(n(r.metrics?.vat))}
                </span>
              ),
            },
            {
              header: "Bidfood",
              align: "right",
              render: (r) => (
                <span className="text-xs font-semibold text-orange-700">
                  £{fmtNum(n(r.metrics?.bidfood))}
                </span>
              ),
            },
            {
              header: "Labour Hour",
              align: "right",
              render: (r) => (
                <span className="text-xs font-semibold text-violet-700">
                  {fmtNum(n(r.metrics?.labourHour))}
                </span>
              ),
            },
            {
              header: "Kiosk %",
              align: "center",
              render: (r) => (
                <span className="text-xs font-semibold text-teal-700">
                  {fmtPct(n(r.metrics?.kioskPct))}
                </span>
              ),
            },
            {
              header: "Rev Score Q1",
              align: "center",
              render: (r) => (
                <span className="text-xs font-semibold text-slate-700">
                  {fmtNum(n(r.metrics?.revScoreQ1))}
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

      {/* View Dialog */}
      <Dialog
        isOpen={!!selectedRecord}
        onClose={() => setSelectedRecord(null)}
        title="Monthly Summary"
        maxWidth="2xl"
      >
        {selectedRecord && <RecordDetailBody record={selectedRecord} />}
      </Dialog>

      <Dialog
        isOpen={!!editingRecord}
        onClose={() => setEditingRecord(null)}
        title={`Edit Monthly Record - ${editingRecord?.shop_id?.name || editingRecord?.store_name_raw || ""}`}
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
              className="flex-1 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
              label="Gross Sale"
              type="number"
              step="0.01"
              value={editForm.grossSale}
              onChange={(e) =>
                setEditForm({ ...editForm, grossSale: e.target.value })
              }
            />
            <Input
              label="Net Sale"
              type="number"
              step="0.01"
              value={editForm.netSale}
              onChange={(e) =>
                setEditForm({ ...editForm, netSale: e.target.value })
              }
            />
            <Input
              label="Customer Count"
              type="number"
              value={editForm.customerCount}
              onChange={(e) =>
                setEditForm({ ...editForm, customerCount: e.target.value })
              }
            />
            <Input
              label="Bidfood"
              type="number"
              step="0.01"
              value={editForm.bidfood}
              onChange={(e) =>
                setEditForm({ ...editForm, bidfood: e.target.value })
              }
            />
            <Input
              label="Labour Hour"
              type="number"
              step="0.01"
              value={editForm.labourHour}
              onChange={(e) =>
                setEditForm({ ...editForm, labourHour: e.target.value })
              }
            />
            <Input
              label="Kiosk %"
              type="number"
              step="0.01"
              value={editForm.kioskPct}
              onChange={(e) =>
                setEditForm({ ...editForm, kioskPct: e.target.value })
              }
            />
            <Input
              label="Rev Score Q1"
              type="number"
              step="0.01"
              value={editForm.revScoreQ1}
              onChange={(e) =>
                setEditForm({ ...editForm, revScoreQ1: e.target.value })
              }
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
