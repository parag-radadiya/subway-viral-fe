import { useEffect, useState } from "react";
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
import clsx from "clsx";
import Table from "../../../components/common/Table";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";
import Dialog from "../../../components/common/Dialog";
import Tabs from "../../../components/common/Tabs";
import Button from "../../../components/common/Button";
import { ROUTES } from "../../../utils/routes";

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
    const fetchInitialData = async () => {
      try {
        const [shopsRes, usersRes] = await Promise.all([
          shopsApi.list(),
          usersApi.list(),
        ]);
        setShops(shopsRes.data.data.shops || []);
        setUsers(usersRes.data.data?.users || usersRes.data?.users || []);
      } catch (err) {
        console.error(err);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (activeTab === "all") {
      const fetchRotas = async () => {
        try {
          setLoading(true);
          const query: Record<string, string> = {};
          if (activeFilters.shop_id !== "all")
            query.shop_id = activeFilters.shop_id;
          if (activeFilters.user_id !== "all")
            query.user_id = activeFilters.user_id;

          const res = await rotasApi.list(
            Object.keys(query).length > 0 ? query : undefined,
          );
          setRotas(res.data.data.rotas || []);
        } catch (err) {
          toast.error("Failed to load org-wide rota data.");
        } finally {
          setLoading(false);
        }
      };
      fetchRotas();
    }
  }, [activeFilters, activeTab]);

  useEffect(() => {
    if (activeTab === "weekly" && selectedWeek && selectedWeeklyShop) {
      setLoading(true);
      rotasApi
        .week({ week_start: selectedWeek, shop_id: selectedWeeklyShop })
        .then(({ data }) => setWeekData(data.data || data))
        .catch(() => toast.error("Failed to fetch weekly rotas."))
        .finally(() => setLoading(false));
    } else {
      setWeekData(null);
    }
  }, [activeTab, selectedWeek, selectedWeeklyShop]);

  const confirmDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await rotasApi.remove(deleteTargetId);

      if (activeTab === "all") {
        setRotas((prev) => prev.filter((r) => r._id !== deleteTargetId));
      } else {
        // Optimistically update weekly view data by reloading it briefly or filtering out locally
        if (selectedWeek && selectedWeeklyShop) {
          rotasApi
            .week({ week_start: selectedWeek, shop_id: selectedWeeklyShop })
            .then(({ data }) => setWeekData(data.data || data));
        }
      }
      toast.success("Shift deleted successfully.");
    } catch {
      toast.error("Failed to delete shift.");
    } finally {
      setDeleteTargetId(null);
    }
  };

  const clearFilters = () => {
    setActiveFilters({ shop_id: "all", user_id: "all" });
  };

  const hasActiveFilters =
    activeFilters.shop_id !== "all" || activeFilters.user_id !== "all";

  // we don't need local filtering since it's server-side now
  const filteredRotas = rotas;

  if (loading)
    return (
      <div className="p-12 text-center text-slate-400">
        <Loader2 className="animate-spin inline mr-2" /> Loading global rotas...
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Org-Wide Rotas</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Global oversight and management across all locations
          </p>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate(ROUTES.ADMIN.ROTAS.CREATE)}
          className="rounded-lg px-4"
        >
          <Plus size={18} className="mr-2" />
          Create Rota
        </Button>
      </div>

      <div className="flex bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-1 items-center gap-3 justify-between">
          <Tabs
            options={[
              { label: "All Rotas", value: "all" },
              { label: "Weekly View", value: "weekly" },
            ]}
            activeTab={activeTab}
            onChange={(val) => setActiveTab(val as "all" | "weekly")}
          />

          {activeTab === "all" && (
            <div className="flex  items-center gap-3 w-full sm:w-auto mt-4 md:mt-0">
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
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto mt-4 md:mt-0">
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
              />
            </div>
          )}
        </div>
      </div>
      {activeTab === "all" && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-4">
          <Table
            columns={[
              {
                header: "Employee",
                render: (rota) => (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                      <User size={18} />
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                      {typeof rota.user_id === "string"
                        ? rota.user_id
                        : rota.user_id?.name}
                    </p>
                  </div>
                ),
              },
              {
                header: "Date",
                render: (rota) => (
                  <div className="flex items-center gap-2 text-slate-600">
                    <Calendar size={14} className="text-slate-400" />
                    <p className="text-sm font-bold">
                      {new Date(rota.shift_date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                ),
              },
              {
                header: "Shift",
                render: (rota) => (
                  <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary-100 text-secondary-700">
                    <Clock size={12} /> {rota.start_time} -{" "}
                    {rota.end_time || "TBA"}
                  </div>
                ),
              },
              {
                header: "Location",
                render: (rota) => (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <Store size={14} className="text-slate-300" />
                    {typeof rota.shop_id === "string"
                      ? rota.shop_id
                      : rota.shop_id?.name}
                  </div>
                ),
              },
              {
                header: "Status",
                render: (rota) => (
                  <span
                    className={clsx(
                      "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter",
                      rota.is_published
                        ? "bg-success-50 text-success-600"
                        : "bg-warning-50 text-warning-600",
                    )}
                  >
                    {rota.is_published ? "Published" : "Draft"}
                  </span>
                ),
              },
              {
                header: "Actions",
                align: "right",
                render: (rota) => (
                  <div className="flex items-center justify-end gap-2">
                    <button
                      onClick={() =>
                        navigate(ROUTES.ADMIN.ROTAS.DETAILS(rota._id))
                      }
                      className="p-2 hover:bg-primary-50 text-primary-500 rounded-lg transition-colors"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={() =>
                        navigate(ROUTES.ADMIN.ROTAS.EDIT(rota._id))
                      }
                      className="p-2 hover:bg-accent-50 text-accent-500 rounded-lg transition-colors"
                      title="Edit Shift"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(rota._id)}
                      className="p-2 hover:bg-danger-50 text-danger-500 rounded-lg transition-colors inline-flex items-center"
                      title="Delete Shift"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ),
              },
            ]}
            data={filteredRotas}
            keyExtractor={(rota) => rota._id}
            emptyStateMessage={
              <div className="py-12 flex flex-col items-center justify-center text-slate-400">
                <BarChart3 size={48} className="mb-4 opacity-10" />
                <p className="text-sm font-bold uppercase tracking-tighter text-slate-500">
                  No Rotas Found
                </p>
                <p className="text-xs font-medium mt-1">
                  Try adjusting your filters or search term.
                </p>
              </div>
            }
          />
        </div>
      )}

      {activeTab === "weekly" && (
        <>
          {!selectedWeek || !selectedWeeklyShop ? (
            <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-20 flex flex-col items-center justify-center text-slate-400">
              <Calendar size={64} className="mb-4 opacity-5" />
              <p className="text-lg font-black uppercase tracking-tighter">
                Select Filters
              </p>
              <p className="text-sm font-medium">
                Please select a shop and a week start date to view this week's
                rotas.
              </p>
            </div>
          ) : weekData ? (
            <div className="space-y-6 animate-fade-in text-left">
              {Object.entries(weekData.days || {}).map(
                ([dayStr, shifts]: [string, any]) => {
                  return (
                    <div
                      key={dayStr}
                      className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm"
                    >
                      <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 font-bold text-slate-700 text-sm tracking-widest uppercase">
                        {dayStr}
                      </div>
                      <div className="p-6">
                        {shifts.length === 0 ? (
                          <p className="text-slate-400 text-sm italic py-2 text-center">
                            No shifts assigned for this day.
                          </p>
                        ) : (
                          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {shifts.map((shift: any) => (
                              <div
                                key={shift._id}
                                className="border border-slate-100 rounded-xl p-4 bg-white hover:border-primary-200 hover:shadow-md transition-all group relative"
                              >
                                <div className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                                  <button
                                    onClick={() =>
                                      navigate(
                                        ROUTES.ADMIN.ROTAS.DETAILS(shift._id),
                                      )
                                    }
                                    className="p-1 hover:bg-primary-50 text-primary-500 rounded-lg"
                                    title="View Details"
                                  >
                                    <Eye size={14} />
                                  </button>
                                  <button
                                    onClick={() =>
                                      navigate(
                                        ROUTES.ADMIN.ROTAS.EDIT(shift._id),
                                      )
                                    }
                                    className="p-1 hover:bg-accent-50 text-accent-500 rounded-lg"
                                    title="Edit Shift"
                                  >
                                    <Edit2 size={14} />
                                  </button>
                                  <button
                                    onClick={() => setDeleteTargetId(shift._id)}
                                    className="p-1 hover:bg-danger-50 text-danger-500 rounded-lg"
                                    title="Delete Shift"
                                  >
                                    <Trash2 size={14} />
                                  </button>
                                </div>
                                <div className="flex justify-between items-start mb-4">
                                  <div className="flex items-center gap-2">
                                    <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                                      {(typeof shift.user_id === "string"
                                        ? "U"
                                        : shift.user_id?.name?.slice(0, 2) ||
                                          "U"
                                      ).toUpperCase()}
                                    </div>
                                    <span className="text-xs font-bold text-slate-700">
                                      {typeof shift.user_id === "string"
                                        ? shift.user_id
                                        : shift.user_id?.name}
                                    </span>
                                  </div>
                                  {shift.is_published && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-success-600 uppercase ml-auto">
                                      <div className="w-1.5 h-1.5 rounded-full bg-success-500" />{" "}
                                      Published
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                                    <Clock size={20} />
                                  </div>
                                  <div>
                                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                                      Shift Time
                                    </p>
                                    <p className="text-sm font-bold text-slate-700">
                                      {shift.start_time} -{" "}
                                      {shift.end_time || "TBA"}
                                    </p>
                                  </div>
                                </div>
                                {shift.note && (
                                  <div className="mt-4 pt-3 border-t border-slate-50 text-xs text-slate-500 font-medium italic">
                                    Note: {shift.note}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                },
              )}
            </div>
          ) : null}
        </>
      )}

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
