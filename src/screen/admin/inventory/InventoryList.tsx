import {
  Activity,
  AlertCircle,
  Calendar,
  Edit2,
  Eye,
  Loader2,
  MessageSquare,
  Package,
  Plus,
  Search,
  Store,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../../components/common/Button";
import Dialog from "../../../components/common/Dialog";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";
import Table from "../../../components/common/Table";
import { inventoryApi } from "../../../config/inventoryApi";
import { ROUTES } from "../../../utils/routes";
import { InventoryItem, InventoryStatus } from "../../../utils/types";

const InventoryList = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  // Delete confirm state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Report Issue state
  const [reportIssueItemId, setReportIssueItemId] = useState<string | null>(
    null,
  );
  const [issueNote, setIssueNote] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const data = await inventoryApi.getItems({
        page,
        limit: 10,
        status: statusFilter || undefined,
        sort_by: "item_name",
        sort_order: "asc",
      });
      setItems(data.items);
      setTotal(data.total);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch inventory items");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, [page, statusFilter]);

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    setIsDeleting(true);
    try {
      await inventoryApi.deleteItem(deleteTargetId);
      toast.success("Item deleted successfully");
      setDeleteTargetId(null);
      fetchItems();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete item");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOpenIssue = async () => {
    if (!reportIssueItemId || !issueNote.trim()) return;
    setIsReporting(true);
    try {
      await inventoryApi.openQuery({
        item_id: reportIssueItemId,
        issue_note: issueNote,
      });
      toast.success(
        "Issue reported successfully. Item status moved to Damaged.",
      );
      setReportIssueItemId(null);
      setIssueNote("");
      fetchItems();
    } catch (error: any) {
      toast.error(error.message || "Failed to report issue");
    } finally {
      setIsReporting(false);
    }
  };

  const filteredItems = items.filter((item) =>
    item.item_name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  const columns = [
    {
      header: "Item Name",
      render: (item: InventoryItem) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
            <Package size={18} />
          </div>
          <span className="text-sm font-semibold text-slate-700">
            {item.item_name}
          </span>
        </div>
      ),
    },
    {
      header: "Location",
      render: (item: InventoryItem) => (
        <div className="flex items-center gap-1.5 text-slate-500">
          <Store size={14} className="text-slate-400" />
          <span className="text-xs font-medium">
            {typeof item.shop_id === "object" ? item.shop_id.name : "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "Condition",
      render: (item: InventoryItem) => (
        <span
          className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
            item.status === InventoryStatus.GOOD
              ? "bg-emerald-100 text-emerald-700"
              : item.status === InventoryStatus.DAMAGED
                ? "bg-rose-100 text-rose-700"
                : "bg-amber-100 text-amber-700"
          }`}
        >
          {item.status}
        </span>
      ),
    },
    {
      header: "Purchase Date",
      render: (item: InventoryItem) => (
        <div className="flex items-center gap-1.5 text-slate-500">
          <Calendar size={14} className="text-slate-400" />
          <span className="text-xs font-mono">
            {new Date(item.purchase_date).toLocaleDateString(undefined, {
              dateStyle: "medium",
            })}
          </span>
        </div>
      ),
    },
    {
      header: "Actions",
      align: "right" as const,
      render: (item: InventoryItem) => (
        <div className="flex items-center justify-end gap-1">
          <button
            onClick={() => navigate(ROUTES.ADMIN.INVENTORY.DETAILS(item._id))}
            className="p-2 hover:bg-primary-50 text-primary-500 rounded-lg transition-colors"
            title="View Details"
          >
            <Eye size={16} />
          </button>
          <button
            onClick={() => setReportIssueItemId(item._id)}
            className="p-2 hover:bg-amber-50 text-amber-500 rounded-lg transition-colors"
            title="Report Issue"
          >
            <MessageSquare size={16} />
          </button>
          <button
            onClick={() => navigate(ROUTES.ADMIN.INVENTORY.EDIT(item._id))}
            className="p-2 hover:bg-slate-50 text-slate-500 rounded-lg transition-colors"
            title="Edit Item"
          >
            <Edit2 size={16} />
          </button>
          <button
            onClick={() => setDeleteTargetId(item._id)}
            className="p-2 hover:bg-danger-50 text-danger-500 rounded-lg transition-colors"
            title="Delete Item"
          >
            <Trash2 size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (loading && items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-medium">Loading inventory directory...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Inventory Library
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage and track shop equipment and assets
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="secondary"
            onClick={() => navigate(ROUTES.ADMIN.INVENTORY.QUERIES)}
            className="rounded-lg px-4"
          >
            <Activity size={18} className="mr-2" />
            View Tickets
          </Button>
          <Button
            variant="primary"
            onClick={() => navigate(ROUTES.ADMIN.INVENTORY.CREATE)}
            className="rounded-lg px-4"
          >
            <Plus size={18} className="mr-2" />
            Add New Item
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Input
              placeholder="Search items by name..."
              className="min-w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startIcon={<Search size={16} />}
            />
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white"
            >
              <option value="">All Status</option>
              <option value={InventoryStatus.GOOD}>Good</option>
              <option value={InventoryStatus.DAMAGED}>Damaged</option>
              <option value={InventoryStatus.IN_REPAIR}>In Repair</option>
            </Select>
          </div>

          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap hidden md:block">
            {total} Total Assets
          </p>
        </div>
        <div className="p-4">
          <Table
            columns={columns}
            data={filteredItems}
            keyExtractor={(item) => item._id}
            emptyStateMessage="No inventory items found matching your filters."
          />

          {total > 10 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30 -mx-4 -mb-4">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-bold text-slate-900">{items.length}</span>{" "}
                of <span className="font-bold text-slate-900">{total}</span>{" "}
                items
              </p>
              <div className="flex gap-2">
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page === 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  Previous
                </Button>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={page * 10 >= total}
                  onClick={() => setPage((p) => p + 1)}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!deleteTargetId}
        onClose={() => setDeleteTargetId(null)}
        title="Confirm Deletion"
        maxWidth="sm"
        footer={
          <>
            <button
              onClick={() => setDeleteTargetId(null)}
              className="flex-1 py-3 text-[10px] font-black text-slate-500 hover:text-slate-700 uppercase tracking-widest rounded-xl hover:bg-slate-200/50 transition-colors"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-3 bg-danger-600 hover:bg-danger-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-danger-500/30 transition-all disabled:opacity-50"
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
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            Do you really want to delete this inventory item? This action cannot
            be undone and will permanently remove it from the system.
          </p>
        </div>
      </Dialog>

      {/* Report Issue Dialog */}
      <Dialog
        isOpen={!!reportIssueItemId}
        onClose={() => {
          setReportIssueItemId(null);
          setIssueNote("");
        }}
        title="Quick Report Issue"
        maxWidth="sm"
        footer={
          <>
            <button
              onClick={() => {
                setReportIssueItemId(null);
                setIssueNote("");
              }}
              className="flex-1 py-3 text-[10px] font-black text-slate-500 hover:text-slate-700 uppercase tracking-widest rounded-xl hover:bg-slate-200/50 transition-colors"
              disabled={isReporting}
            >
              Cancel
            </button>
            <button
              onClick={handleOpenIssue}
              className="flex-1 py-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-amber-500/30 transition-all disabled:opacity-50"
              disabled={isReporting || !issueNote.trim()}
            >
              {isReporting ? (
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
            <AlertCircle className="text-amber-500 shrink-0" size={20} />
            <p className="text-xs text-amber-800 leading-snug">
              Reporting an issue will record a new maintenance ticket and
              automatically flag this item as <strong>Damaged</strong>.
            </p>
          </div>
          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
              Issue details *
            </label>
            <textarea
              className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 transition-all outline-none resize-none text-sm text-slate-700 placeholder:text-slate-300"
              placeholder="Explain the problem in detail..."
              value={issueNote}
              onChange={(e) => setIssueNote(e.target.value)}
              autoFocus
            />
          </div>
        </div>
      </Dialog>
    </div>
  );
};

export default InventoryList;
