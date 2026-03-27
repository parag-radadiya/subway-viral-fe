import {
  Activity,
  AlertCircle,
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Hash,
  Loader2,
  Package,
  PlusCircle,
  Store,
  Tag,
  Wrench,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import Dialog from "../../../components/common/Dialog";
import Table from "../../../components/common/Table";
import { inventoryApi } from "../../../config/apiCall";
import { ROUTES } from "../../../utils/routes";
import {
  InventoryItem,
  InventoryQuery,
  InventoryStatus,
  QueryStatus,
} from "../../../utils/types";

const InventoryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<InventoryItem | null>(null);
  const [queries, setQueries] = useState<InventoryQuery[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Open Issue Dialog State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [issueNote, setIssueNote] = useState("");
  const [isSubmittingDetail, setIsSubmittingDetail] = useState(false);

  const fetchData = () => {
    if (!id) return;
    setIsLoading(true);
    Promise.all([
      inventoryApi.getItemById(id),
      inventoryApi.getQueries({ item_id: id }),
    ])
      .then(([itemData, queriesData]) => {
        setItem(itemData);
        setQueries(queriesData.queries);
      })
      .catch((error: any) => {
        toast.error(error.message || "Failed to load item details");
        navigate(ROUTES.ADMIN.INVENTORY.LIST);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    fetchData();
  }, [id]);

  const handleOpenIssue = () => {
    if (!id || !issueNote.trim()) return;
    setIsSubmittingDetail(true);
    inventoryApi
      .openQuery({ item_id: id, issue_note: issueNote })
      .then(() => {
        toast.success(
          "Issue reported successfully. Item status updated to Damaged.",
        );
        setIsDialogOpen(false);
        setIssueNote("");
        fetchData(); // Refresh data
      })
      .catch((error: any) => {
        toast.error(error.message || "Failed to open issue");
      })
      .finally(() => {
        setIsSubmittingDetail(false);
      });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-medium">Loading asset details...</p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="text-center p-12">
        <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
        <p className="text-slate-500">Asset not found.</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => navigate(ROUTES.ADMIN.INVENTORY.LIST)}
        >
          <ArrowLeft size={16} className="mr-2" /> Back to List
        </Button>
      </div>
    );
  }

  const queryColumns = [
    {
      header: "Status",
      render: (q: InventoryQuery) => (
        <span
          className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            q.status === QueryStatus.OPEN
              ? "bg-rose-100 text-rose-700"
              : "bg-emerald-100 text-emerald-700"
          }`}
        >
          {q.status}
        </span>
      ),
    },
    {
      header: "Issue Note",
      render: (q: InventoryQuery) => (
        <p className="text-sm text-slate-600 line-clamp-1 max-w-xs">
          {q.issue_note}
        </p>
      ),
    },
    {
      header: "Opened At",
      render: (q: InventoryQuery) => new Date(q.createdAt).toLocaleDateString(),
    },
    {
      header: "Cost",
      render: (q: InventoryQuery) =>
        q.repair_cost ? `£${q.repair_cost}` : "-",
    },
    {
      header: "Actions",
      align: "right" as const,
      render: (q: InventoryQuery) => (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(ROUTES.ADMIN.INVENTORY.QUERY_DETAILS(q._id))}
          className="text-primary-600 font-bold"
        >
          View
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      {/* Header with back button and actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(ROUTES.ADMIN.INVENTORY.LIST)}
          className="flex items-center text-slate-500 hover:text-primary-600 transition-colors text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft size={16} className="mr-1.5" />
          Back to Directory
        </button>
        <div className="flex gap-2">
          {item.status !== InventoryStatus.DAMAGED && (
            <Button
              variant="secondary"
              size="sm"
              className="border-rose-200 text-rose-600 hover:bg-rose-50"
              onClick={() => setIsDialogOpen(true)}
            >
              <PlusCircle size={16} className="mr-2" /> Report Issue
            </Button>
          )}
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(ROUTES.ADMIN.INVENTORY.EDIT(item._id))}
          >
            <Edit size={16} className="mr-2" /> Edit Item
          </Button>
        </div>
      </div>

      {/* Hero Card */}
      <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 h-32 relative">
          <div className="absolute -bottom-8 left-8 p-4 bg-primary-600 rounded-2xl shadow-lg border-4 border-white text-white">
            <Package size={32} />
          </div>
        </div>
        <div className="pt-12 p-8 pb-6 flex justify-between items-end">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              {item.item_name}
            </h1>
            <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
              <Hash size={14} /> Global Asset ID: {item._id}
            </p>
          </div>
          <div className="flex flex-col items-end">
            <span
              className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest shadow-sm ${
                item.status === InventoryStatus.GOOD
                  ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                  : item.status === InventoryStatus.DAMAGED
                    ? "bg-rose-50 text-rose-600 border border-rose-100"
                    : "bg-amber-50 text-amber-600 border border-amber-100"
              }`}
            >
              {item.status}
            </span>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 pt-0 border-b border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
              Shop Location
            </p>
            <div className="flex items-end gap-2 text-slate-800">
              <Store size={20} className="text-primary-500 mb-1" />
              <span className="text-lg font-black truncate max-w-full">
                {typeof item.shop_id === "object"
                  ? item.shop_id.name
                  : "Unknown"}
              </span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
              Purchase Date
            </p>
            <div className="flex items-end gap-2 text-slate-800">
              <Calendar size={20} className="text-accent-500 mb-1" />
              <span className="text-xl font-mono font-bold tracking-tighter">
                {new Date(item.purchase_date).toLocaleDateString()}
              </span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
              History Snapshot
            </p>
            <div className="flex items-end gap-2 text-slate-800">
              <Activity size={20} className="text-amber-500 mb-1" />
              <span className="text-xl font-black">{queries.length}</span>
              <span className="text-xs font-bold mb-1 ml-[-4px]">Tickets</span>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50/30 flex justify-between items-center text-[10px] text-slate-400 font-medium tracking-wide">
          <p>LAST SYNC: JUST NOW</p>
          <p className="uppercase">Condition: {item.status}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-700">
        {/* Maintenance Summary Card */}
        <Card className="p-6 bg-gradient-to-br from-primary-600 to-indigo-700 text-white border-0 shadow-xl shadow-primary-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
              <Wrench size={20} />
            </div>
            <h4 className="font-bold text-lg leading-tight text-white">
              Maintenance Overview
            </h4>
          </div>
          <p className="text-primary-100 text-sm mb-6 leading-relaxed">
            This asset is currently marked as{" "}
            <span className="font-black uppercase">{item.status}</span>. All
            maintenance cycles and repair history should be documented here for
            operational continuity.
          </p>

          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs bg-white/10 p-3 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-primary-200 shrink-0" />
                <span>Warranty / Expiry</span>
              </div>
              <span className="font-bold">
                {item.expiry_date
                  ? new Date(item.expiry_date).toLocaleDateString()
                  : "None"}
              </span>
            </div>
            <div className="flex items-center justify-between text-xs bg-white/10 p-3 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-2">
                <Tag size={16} className="text-primary-200 shrink-0" />
                <span>Total Maintenance Cost</span>
              </div>
              <span className="font-bold">
                £
                {queries
                  .reduce((acc, q) => acc + (q.repair_cost || 0), 0)
                  .toFixed(2)}
              </span>
            </div>
          </div>
        </Card>

        {/* Security / Policy Card like in ShopDetail */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-500" />
            Asset Management Policy
          </h3>
          <p className="text-sm leading-relaxed text-slate-600 mb-4">
            Property of Subway Viral. Ensure all defects are reported
            immediately using the <strong>Report Issue</strong> action.
          </p>
          <div className="flex gap-4">
            <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Open Tickets
              </p>
              <p className="text-xl font-black text-rose-500">
                {queries.filter((q) => q.status === QueryStatus.OPEN).length}
              </p>
            </div>
            <div className="flex-1 bg-slate-50 p-3 rounded-xl border border-slate-100">
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Resolved Cases
              </p>
              <p className="text-xl font-black text-emerald-500">
                {queries.filter((q) => q.status === QueryStatus.CLOSED).length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket History Section */}
      <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mt-8 mb-4 flex items-center gap-2 px-1">
        <Activity size={14} className="text-primary-500" />
        Full Ticket History
      </h3>
      <Card className="border-slate-200 shadow-sm overflow-hidden">
        <Table
          columns={queryColumns}
          data={queries}
          keyExtractor={(q) => q._id}
          emptyStateMessage="No history logs found for this asset."
        />
      </Card>

      {/* Open Issue Dialog */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Report New Issue"
        maxWidth="sm"
        footer={
          <>
            <button
              onClick={() => setIsDialogOpen(false)}
              className="flex-1 py-3 text-[10px] font-black text-slate-500 hover:text-slate-700 uppercase tracking-widest rounded-xl hover:bg-slate-200/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleOpenIssue}
              className="flex-1 py-3 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary-500/30 transition-all disabled:opacity-50"
              disabled={isSubmittingDetail || !issueNote.trim()}
            >
              {isSubmittingDetail ? (
                <Loader2 className="animate-spin inline" size={16} />
              ) : (
                "Submit Report"
              )}
            </button>
          </>
        }
      >
        <div className="space-y-4 pt-2">
          <div className="p-4 bg-amber-50 rounded-xl border border-amber-100 flex gap-3">
            <AlertCircle size={20} className="text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 leading-snug">
              Reporting an issue will record a new ticket and automatically flag
              this item as <strong>Damaged</strong>.
            </p>
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
              Issue details *
            </label>
            <textarea
              className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 transition-all outline-none resize-none text-sm text-slate-700 placeholder:text-slate-300"
              placeholder="Explain the problem in detail..."
              value={issueNote}
              onChange={(e) => setIssueNote(e.target.value)}
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default InventoryDetail;
