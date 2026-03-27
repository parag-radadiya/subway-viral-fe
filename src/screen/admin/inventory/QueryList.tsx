import { ArrowLeft, Calendar, Eye, Loader2, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../../components/common/Button";
import Select from "../../../components/common/Select";
import Table from "../../../components/common/Table";
import { inventoryApi } from "../../../config/apiCall";
import { ROUTES } from "../../../utils/routes";
import { InventoryQuery, QueryStatus } from "../../../utils/types";

const QueryList = () => {
  const navigate = useNavigate();
  const [queries, setQueries] = useState<InventoryQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchQueries = () => {
    setLoading(true);
    inventoryApi
      .getQueries({
        page,
        limit: 10,
        status: statusFilter || undefined,
        sort_by: "createdAt",
        sort_order: "desc",
      })
      .then((data) => {
        setQueries(data.queries);
        setTotal(data.total);
      })
      .catch((error: any) => {
        toast.error(error.message || "Failed to fetch queries");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchQueries();
  }, [page, statusFilter]);

  const columns = [
    {
      header: "Status",
      render: (q: InventoryQuery) => (
        <span
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
            q.status === QueryStatus.OPEN
              ? "bg-rose-100 text-rose-700 border border-rose-200"
              : "bg-emerald-100 text-emerald-700 border border-emerald-200"
          }`}
        >
          {q.status}
        </span>
      ),
    },
    {
      header: "Item Name",
      render: (q: InventoryQuery) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
            <Package size={18} />
          </div>
          <span className="text-sm font-semibold text-slate-700">
            {typeof q.item_id === "object"
              ? q.item_id.item_name
              : "Item Removed"}
          </span>
        </div>
      ),
    },
    {
      header: "Issue Details",
      render: (q: InventoryQuery) => (
        <div className="max-w-xs">
          <p className="text-xs text-slate-600 font-medium line-clamp-1">
            {q.issue_note}
          </p>
        </div>
      ),
    },
    {
      header: "Opened At",
      render: (q: InventoryQuery) => (
        <div className="flex items-center gap-2 text-slate-500">
          <Calendar size={14} className="text-slate-400" />
          <div className="flex flex-col">
            <span className="text-xs font-mono font-bold tracking-tight">
              {new Date(q.createdAt).toLocaleDateString()}
            </span>
            <span className="text-[10px] text-slate-400 font-medium">
              {new Date(q.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </span>
          </div>
        </div>
      ),
    },
    {
      header: "Repair Cost",
      render: (q: InventoryQuery) => (
        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-50 text-slate-600 border border-slate-100">
          {q.repair_cost ? `£${q.repair_cost.toFixed(2)}` : "-"}
        </div>
      ),
    },
    {
      header: "Actions",
      align: "right" as const,
      render: (q: InventoryQuery) => (
        <div className="flex justify-end gap-1">
          <button
            onClick={() =>
              navigate(ROUTES.ADMIN.INVENTORY.QUERY_DETAILS(q._id))
            }
            className="p-2 hover:bg-primary-50 text-primary-500 rounded-lg transition-colors"
            title="View Ticket Details"
          >
            <Eye size={16} />
          </button>
        </div>
      ),
    },
  ];

  if (loading && queries.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-medium">Synchronizing maintenance logs...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button
            onClick={() => navigate(ROUTES.ADMIN.INVENTORY.LIST)}
            className="flex items-center text-slate-500 hover:text-primary-600 transition-colors text-[10px] font-black uppercase tracking-wider mb-2"
          >
            <ArrowLeft size={14} className="mr-1.5" />
            Back to Library
          </button>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Inventory Tickets
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Track and manage ongoing maintenance and repairs
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-w-[150px] bg-white border-slate-100 h-10"
            >
              <option value="">All Tickets</option>
              <option value={QueryStatus.OPEN}>Open Issues</option>
              <option value={QueryStatus.CLOSED}>Resolved</option>
            </Select>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-auto whitespace-nowrap">
            {total} Tickets Logged
          </p>
        </div>

        <div className="p-4">
          <Table
            columns={columns}
            data={queries}
            keyExtractor={(q) => q._id}
            emptyStateMessage="No maintenance tickets found matching your filters."
          />

          {total > 10 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30 -mx-4 -mb-4">
              <p className="text-xs text-slate-500">
                Showing{" "}
                <span className="font-bold text-slate-900">
                  {queries.length}
                </span>{" "}
                of <span className="font-bold text-slate-900">{total}</span>{" "}
                tickets
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
    </div>
  );
};

export default QueryList;
