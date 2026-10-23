import { format } from "date-fns";
import { ArrowLeft, Calendar, Eye, Loader2, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Select from "../common/Select";
import Table from "../common/Table";
import { inventoryApi, shopsApi } from "../../config/apiCall";
import { useAppSelector } from "../../store";
import { InventoryQuery, QueryStatus } from "../../utils/types";

interface Props { routes: { list: string; query_details: (id: string) => string; } }

const QueryListContainer = ({ routes }: Props) => {
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const [queries, setQueries] = useState<InventoryQuery[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [activeFilters, setActiveFilters] = useState({
    shop_id: user?.shop_id || "all",
  });
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    shopsApi
      .list()
      .then((res) => {
        setShops(res.data.data.shops || []);
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.message || "Failed to load shops.");
      });
  }, []);

  const fetchQueries = () => {
    setLoading(true);
    inventoryApi
      .getQueries({
        page,
        limit,
        status: statusFilter || undefined,
        shop_id:
          activeFilters.shop_id !== "all" ? activeFilters.shop_id : undefined,
        sort_by: "createdAt",
        sort_order: "desc",
      })
      .then((data: any) => {
        setQueries(data.queries || data.data || []);
        setTotal(data.total || 0);
        setTotalPages(data.total_pages || data.totalPages || 1);
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
  }, [page, limit, statusFilter, activeFilters.shop_id]);

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
              {format(new Date(q.createdAt), "dd/MM/yyyy")}
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
              navigate(routes.query_details(q._id))
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
            onClick={() => navigate(routes.list)}
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
              value={activeFilters.shop_id}
              onChange={(e) => {
                setPage(1);
                setActiveFilters({
                  ...activeFilters,
                  shop_id: e.target.value,
                });
              }}
              className="min-w-[150px] bg-white border-slate-100 h-10"
            >
              <option value="all">All Shops</option>
              {shops.map((shop) => (
                <option key={shop._id} value={shop._id}>
                  {shop.name}
                </option>
              ))}
            </Select>

            <Select
              value={statusFilter}
              onChange={(e) => {
                setPage(1);
                setStatusFilter(e.target.value);
              }}
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
    </div>
  );
};

export default QueryListContainer;
