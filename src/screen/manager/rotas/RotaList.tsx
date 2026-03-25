import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { rotasApi, shopsApi, usersApi } from "../../../config/apiCall";
import {
  Calendar,
  Store,
  Clock,
  Loader2,
  BarChart3,
  Trash2,
  Edit2,
  Eye,
  Plus,
  User,
} from "lucide-react";
import { Rota } from "../../../utils/types";
import { toast } from "react-toastify";
import Table from "../../../components/common/Table";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";
import Dialog from "../../../components/common/Dialog";
import Tabs from "../../../components/common/Tabs";
import Button from "../../../components/common/Button";
import { ROUTES } from "../../../utils/routes";
import WeeklyScheduleGrid from "../../../components/admin/rotas/WeeklyScheduleGrid";

const RotaList = () => {
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  // Tabs
  const [activeTab, setActiveTab] = useState<"all" | "weekly">("all");

  // Weekly View State
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [selectedWeeklyShop, setSelectedWeeklyShop] = useState<string>("");
  const [weekData, setWeekData] = useState<any>(null);

  // Delete confirm state
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Filter state
  const [activeFilters, setActiveFilters] = useState({
    shop_id: "all",
    user_id: "all",
  });

  useEffect(() => {
    const fetchInitialData = () => {
      Promise.all([shopsApi.list(), usersApi.list()])
        .then(([shopsRes, usersRes]) => {
          setShops(shopsRes.data.data.shops || []);
          setUsers(usersRes.data.data?.users || usersRes.data?.users || []);
        })
        .catch((err) => {
          console.error(err);
        });
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === "all") {
      const fetchRotas = () => {
        setLoading(true);
        const query: Record<string, string> = {};
        if (activeFilters.shop_id !== "all")
          query.shop_id = activeFilters.shop_id;
        if (activeFilters.user_id !== "all")
          query.user_id = activeFilters.user_id;

        rotasApi
          .list(Object.keys(query).length > 0 ? query : undefined)
          .then((res) => {
            setRotas(res.data.data.rotas || []);
          })
          .catch((err) => {
            toast.error(err.message || "Failed to load rota data.");
          })
          .finally(() => {
            setLoading(false);
          });
      };
      fetchRotas();
    }
  }, [activeFilters, activeTab]);

  useEffect(() => {
    if (activeTab === "weekly" && selectedWeek && selectedWeeklyShop) {
      setLoading(true);
      rotasApi
        .week({ week_start: selectedWeek, shop_id: selectedWeeklyShop })
        .then(({ data }) => setWeekData(data.data))
        .catch(() => toast.error("Failed to fetch weekly rotas."))
        .finally(() => setLoading(false));
    } else {
      setWeekData(null);
    }
  }, [activeTab, selectedWeek, selectedWeeklyShop]);

  const confirmDelete = () => {
    if (!deleteTargetId) return;
    rotasApi
      .remove(deleteTargetId)
      .then(() => {
        if (activeTab === "all") {
          setRotas((prev) => prev.filter((r) => r._id !== deleteTargetId));
        } else {
          if (selectedWeek && selectedWeeklyShop) {
            rotasApi
              .week({ week_start: selectedWeek, shop_id: selectedWeeklyShop })
              .then(({ data }) => setWeekData(data.data || data));
          }
        }
        toast.success("Shift deleted successfully.");
      })
      .catch((err) => {
        toast.error(err.message || "Failed to delete shift.");
      })
      .finally(() => {
        setDeleteTargetId(null);
      });
  };

  // Date/Time Formatters
  const formatDate = (dateStr: string) => {
    if (!dateStr) return "TBA";
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const rotaColumns = useMemo(
    () => [
      {
        header: "Employee",
        render: (rota: Rota) => (
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
              <User size={18} />
            </div>
            <p className="text-sm font-black text-slate-700">
              {typeof rota.user_id === "string"
                ? rota.user_id
                : rota.user_id?.name}
            </p>
          </div>
        ),
      },
      {
        header: "Date",
        render: (rota: Rota) => (
          <div className="flex items-center gap-2 text-slate-600">
            <Calendar size={14} className="text-slate-400" />
            <span className="text-xs font-medium">
              {formatDate(rota.shift_date)}
            </span>
          </div>
        ),
      },
      {
        header: "Shift Time",
        render: (rota: Rota) => (
          <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary-50 text-secondary-600 border border-secondary-100">
            <Clock size={12} /> {rota.start_time} - {rota.end_time || "TBA"}
          </div>
        ),
      },
      {
        header: "Location",
        render: (rota: Rota) => (
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
            <Store size={14} className="text-slate-400" />
            <span className="text-slate-700">
              {typeof rota.shop_id === "string"
                ? rota.shop_id
                : rota.shop_id?.name}
            </span>
          </div>
        ),
      },
      {
        header: "Actions",
        align: "right" as const,
        render: (rota: Rota) => (
          <div className="flex items-center justify-end gap-1">
            <button
              onClick={() => navigate(ROUTES.MANAGER.ROTAS.DETAILS(rota._id))}
              className="p-2 hover:bg-primary-50 text-primary-500 rounded-lg transition-colors"
              title="View Details"
            >
              <Eye size={16} />
            </button>
            <button
              onClick={() => navigate(ROUTES.MANAGER.ROTAS.EDIT(rota._id))}
              className="p-2 hover:bg-slate-50 text-slate-500 rounded-lg transition-colors"
              title="Edit Shift"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => setDeleteTargetId(rota._id)}
              className="p-2 hover:bg-danger-50 text-danger-500 rounded-lg transition-colors"
              title="Delete Shift"
            >
              <Trash2 size={16} />
            </button>
          </div>
        ),
      },
    ],
    [navigate, setDeleteTargetId],
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Rota Management
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage shifts across your assigned locations
          </p>
        </div>
        <div className="flex gap-3">
          <Tabs
            options={[
              { label: "All Rotas", value: "all" },
              { label: "Weekly View", value: "weekly" },
            ]}
            className="h-full"
            activeTab={activeTab}
            onChange={(val) => setActiveTab(val as "all" | "weekly")}
          />
          <Button
            variant="primary"
            onClick={() => navigate(ROUTES.MANAGER.ROTAS.CREATE)}
            className="rounded-lg px-4"
          >
            <Plus size={18} className="mr-2" />
            Create Rota
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
          {activeTab === "all" && (
            <div className="flex items-center gap-3">
              <Select
                value={activeFilters.shop_id}
                onChange={(e) =>
                  setActiveFilters({
                    ...activeFilters,
                    shop_id: e.target.value,
                  })
                }
              >
                <option value="all">All Shops</option>
                {shops.map((shop) => (
                  <option key={shop._id} value={shop._id}>
                    {shop.name}
                  </option>
                ))}
              </Select>

              <Select
                value={activeFilters.user_id}
                onChange={(e) =>
                  setActiveFilters({
                    ...activeFilters,
                    user_id: e.target.value,
                  })
                }
              >
                <option value="all">All Employees</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </Select>
            </div>
          )}
          {activeTab === "weekly" && (
            <div className="flex items-center gap-3">
              <Select
                value={selectedWeeklyShop}
                onChange={(e) => setSelectedWeeklyShop(e.target.value)}
              >
                <option value="" disabled>
                  Select Shop
                </option>
                {shops.map((shop) => (
                  <option key={shop._id} value={shop._id}>
                    {shop.name}
                  </option>
                ))}
              </Select>
              <Input
                type="date"
                value={selectedWeek}
                onChange={(e) => setSelectedWeek(e.target.value)}
                className="w-auto h-10"
              />
            </div>
          )}

          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-auto">
            {rotas.length} Total Rotas
          </p>
        </div>

        <div className="p-4">
          {loading && rotas.length === 0 && weekData === null ? (
            <div className="flex flex-col items-center justify-center p-20 text-slate-400">
              <Loader2
                className="animate-spin mb-4 text-primary-500"
                size={32}
              />
              <p className="text-xs font-black uppercase tracking-widest">
                Synchronizing Rota Logs...
              </p>
            </div>
          ) : (
            <>
              {activeTab === "all" ? (
                <Table
                  columns={rotaColumns}
                  data={rotas}
                  keyExtractor={(rota) => rota._id}
                  emptyStateMessage="No rotas found matching filters."
                />
              ) : (
                <div className="space-y-8 min-h-[400px]">
                  {!weekData ? (
                    <div className="flex flex-col items-center justify-center p-20 text-slate-400">
                      <BarChart3 className="mb-4 opacity-20" size={64} />
                      <p className="text-sm font-bold text-slate-400">
                        Select a Shop and Week to load the schedule.
                      </p>
                    </div>
                  ) : (
                    <WeeklyScheduleGrid
                      data={weekData}
                      onShiftClick={(shiftId) =>
                        navigate(ROUTES.MANAGER.ROTAS.DETAILS(shiftId))
                      }
                    />
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </div>

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
            >
              Cancel
            </button>
            <button
              onClick={confirmDelete}
              className="flex-1 py-3 bg-danger-600 hover:bg-danger-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-danger-500/30 transition-all"
            >
              Delete
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
            Do you really want to delete this shift? This action cannot be
            undone and will permanently remove it from the schedule.
          </p>
        </div>
      </Dialog>
    </div>
  );
};

export default RotaList;
