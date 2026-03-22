import { useState, useEffect } from "react";
import {
  History,
  Clock,
  Package,
  PlusCircle,
  RefreshCcw,
  Trash2,
  AlertCircle,
  CheckCircle2,
  User,
} from "lucide-react";
import { inventoryApi } from "../../../config/inventoryApi";
import { InventoryAuditLog } from "../../../utils/types";
import Table from "../../../components/common/Table";
import Select from "../../../components/common/Select";
import Card from "../../../components/common/Card";
import Button from "../../../components/common/Button";
import { toast } from "react-toastify";

const AuditLogList = () => {
  const [logs, setLogs] = useState<InventoryAuditLog[]>([]);
  const [actionFilter, setActionFilter] = useState<string>("");
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);

  const fetchLogs = async () => {
    try {
      const data = await inventoryApi.getAuditLogs({
        page,
        limit: 20,
        action: actionFilter || undefined,
        sort_by: "createdAt",
        sort_order: "desc",
      });
      setLogs(data.logs);
      setTotal(data.total);
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch audit logs");
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [page, actionFilter]);

  const getActionInfo = (action: string) => {
    switch (action) {
      case "ITEM_CREATED":
        return {
          icon: <PlusCircle size={16} />,
          color: "text-emerald-600 bg-emerald-50 border-emerald-100",
          label: "Item Created",
        };
      case "ITEM_UPDATED":
        return {
          icon: <RefreshCcw size={16} />,
          color: "text-amber-600 bg-amber-50 border-amber-100",
          label: "Item Updated",
        };
      case "ITEM_DELETED":
        return {
          icon: <Trash2 size={16} />,
          color: "text-rose-600 bg-rose-50 border-rose-100",
          label: "Item Deleted",
        };
      case "QUERY_OPENED":
        return {
          icon: <AlertCircle size={16} />,
          color: "text-rose-500 bg-rose-50 border-rose-100",
          label: "Issue Opened",
        };
      case "QUERY_CLOSED":
        return {
          icon: <CheckCircle2 size={16} />,
          color: "text-emerald-500 bg-emerald-50 border-emerald-100",
          label: "Issue Resolved",
        };
      default:
        return {
          icon: <History size={16} />,
          color: "text-slate-600 bg-slate-50 border-slate-100",
          label: action,
        };
    }
  };

  const columns = [
    {
      header: "Action",
      render: (log: InventoryAuditLog) => {
        const info = getActionInfo(log.action);
        return (
          <div
            className={`inline-flex items-center gap-2 px-3 py-1 rounded-xl border text-xs font-bold ${info.color}`}
          >
            {info.icon}
            <span className="uppercase tracking-tight">{info.label}</span>
          </div>
        );
      },
    },
    {
      header: "Target Item",
      render: (log: InventoryAuditLog) => (
        <div className="flex items-center gap-2">
          <Package size={14} className="text-slate-400" />
          <span className="font-semibold text-slate-900">
            {typeof log.item_id === "object" ? log.item_id.item_name : "N/A"}
          </span>
        </div>
      ),
    },
    {
      header: "Performed By",
      render: () => (
        <div className="flex items-center gap-2 text-slate-600">
          <User size={14} className="text-slate-400" />
          <span className="text-sm">Manager User</span>
        </div>
      ),
    },
    {
      header: "Date/Time",
      render: (log: InventoryAuditLog) => (
        <div className="flex flex-col text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Clock size={10} /> {new Date(log.createdAt).toLocaleDateString()}
          </span>
          <span className="text-[10px] text-slate-400 pl-3.5">
            {new Date(log.createdAt).toLocaleTimeString()}
          </span>
        </div>
      ),
    },
    {
      header: "Details",
      render: (log: InventoryAuditLog) => (
        <p className="text-xs text-slate-400 font-mono line-clamp-1 max-w-[200px]">
          {JSON.stringify(log.details)}
        </p>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            Traceability Logs
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Audit trail of all inventory and maintenance activities.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={fetchLogs}
          className="bg-white border-slate-200"
        >
          <RefreshCcw size={16} className="mr-2" />
          Refresh
        </Button>
      </div>

      <Card className="overflow-hidden border-slate-200 shadow-sm bg-white">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row gap-4 justify-between">
          <div className="flex items-center gap-3">
            <Select
              value={actionFilter}
              onChange={(e) => setActionFilter(e.target.value)}
              className="min-w-[180px] bg-white border-slate-200"
            >
              <option value="">All Actions</option>
              <option value="ITEM_CREATED">Item Created</option>
              <option value="ITEM_UPDATED">Item Updated</option>
              <option value="ITEM_DELETED">Item Deleted</option>
              <option value="QUERY_OPENED">Issue Opened</option>
              <option value="QUERY_CLOSED">Issue Resolved</option>
            </Select>
          </div>
        </div>

        <Table
          columns={columns}
          data={logs}
          keyExtractor={(log) => log._id}
          emptyStateMessage="No audit logs found."
        />

        {total > 20 && (
          <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-white">
            <p className="text-sm text-slate-500">
              Showing{" "}
              <span className="font-medium text-slate-900">{logs.length}</span>{" "}
              of <span className="font-medium text-slate-900">{total}</span>{" "}
              logs
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
                disabled={page * 20 >= total}
                onClick={() => setPage((p) => p + 1)}
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

export default AuditLogList;
