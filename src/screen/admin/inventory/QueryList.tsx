import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Eye,
  AlertCircle,
  CheckCircle2,
  Clock,
  Package
} from "lucide-react";
import { inventoryApi } from "../../../config/inventoryApi";
import { InventoryQuery, QueryStatus } from "../../../utils/types";
import { ROUTES } from "../../../utils/routes";
import Table from "../../../components/common/Table";
import Button from "../../../components/common/Button";
import Select from "../../../components/common/Select";
import Card from "../../../components/common/Card";
import { toast } from "react-toastify";

const QueryList = () => {
  const navigate = useNavigate();
  const [queries, setQueries] = useState<InventoryQuery[]>([]);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchQueries = async () => {
    try {
      const data = await inventoryApi.getQueries({
        page,
        limit: 10,
        status: statusFilter || undefined,
        sort_by: "createdAt",
        sort_order: "desc"
      });
      setQueries(data.queries);
      setTotal(data.total);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch queries");
    }
  };

  useEffect(() => {
    fetchQueries();
  }, [page, statusFilter]);

  const columns = [
    {
      header: "Status",
      render: (q: InventoryQuery) => (
        <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
          q.status === QueryStatus.OPEN ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'
        }`}>
          {q.status}
        </span>
      )
    },
    {
      header: "Item",
      render: (q: InventoryQuery) => (
        <div className="flex items-center gap-2">
           <Package size={14} className="text-slate-400" />
           <span className="font-medium text-slate-900">
             {typeof q.item_id === 'object' ? q.item_id.item_name : 'Item Removed'}
           </span>
        </div>
      )
    },
    {
      header: "Issue Note",
      render: (q: InventoryQuery) => (
        <p className="text-sm text-slate-500 line-clamp-1 max-w-[250px]">{q.issue_note}</p>
      )
    },
    {
      header: "Opened At",
      render: (q: InventoryQuery) => (
        <div className="flex flex-col text-xs text-slate-500">
           <span>{new Date(q.opened_at).toLocaleDateString()}</span>
           <span className="text-[10px] text-slate-400">{new Date(q.opened_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )
    },
    {
       header: "Cost",
       render: (q: InventoryQuery) => (
         <span className="font-mono text-slate-900">
            {q.repair_cost ? `£${q.repair_cost}` : '-'}
         </span>
       )
    },
    {
      header: "Actions",
      align: "right" as const,
      render: (q: InventoryQuery) => (
        <div className="flex justify-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate(ROUTES.ADMIN.INVENTORY.QUERY_DETAILS(q._id))}
            className="text-primary-600 hover:bg-primary-50"
          >
            <Eye size={16} />
            <span className="ml-2">Details</span>
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Tickets</h1>
        <p className="text-slate-500 text-sm mt-1">Track and manage maintenance requests and repairs.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         <Card className="p-5 border-slate-200 shadow-sm bg-white">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600 shadow-inner">
                  <AlertCircle size={24} />
               </div>
               <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Open Tickets</p>
                  <h4 className="text-2xl font-bold text-slate-900 italic">{queries.filter(q => q.status === QueryStatus.OPEN).length}</h4>
               </div>
            </div>
         </Card>
         <Card className="p-5 border-slate-200 shadow-sm bg-white">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner">
                  <CheckCircle2 size={24} />
               </div>
               <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Resolved This Week</p>
                  <h4 className="text-2xl font-bold text-slate-900 italic">...</h4>
               </div>
            </div>
         </Card>
         <Card className="p-5 border-slate-200 shadow-sm bg-white">
            <div className="flex items-center gap-4">
               <div className="w-12 h-12 rounded-2xl bg-primary-50 flex items-center justify-center text-primary-600 shadow-inner">
                  <Clock size={24} />
               </div>
               <div>
                  <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Avg. Repair Time</p>
                  <h4 className="text-2xl font-bold text-slate-900 italic">2.4 Days</h4>
               </div>
            </div>
         </Card>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex items-center gap-3">
            <Select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="min-w-[150px] bg-white border-slate-200"
            >
              <option value="">All Tickets</option>
              <option value={QueryStatus.OPEN}>Open Issues</option>
              <option value={QueryStatus.CLOSED}>Resolved</option>
            </Select>
          </div>
        </div>

        <Table
          columns={columns}
          data={queries}
          keyExtractor={(q) => q._id}
          emptyStateMessage="No inventory tickets found."
        />
        
        {total > 10 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/30">
            <p className="text-sm text-slate-500">
              Showing <span className="font-medium text-slate-900">{queries.length}</span> of <span className="font-medium text-slate-900">{total}</span> tickets
            </p>
            <div className="flex gap-2">
              <Button 
                variant="secondary" 
                size="sm" 
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button 
                variant="secondary" 
                size="sm"
                disabled={page * 10 >= total}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default QueryList;
