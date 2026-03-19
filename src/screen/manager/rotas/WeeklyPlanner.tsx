import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Loader2,
  Plus,
  Save,
  Search,
  Trash2,
  Users as UsersIcon,
  X,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import Button from "../../../components/common/Button";
import { rotasApi, shopsApi, usersApi } from "../../../config/apiCall";
import { useAppSelector } from "../../../store";

// ShiftCell interface update
interface ShiftCell {
  user_id: string;
  dayIndex: number; // 0-6 (Mon-Sun)
  shift_start: string;
  shift_end: string;
  note?: string;
  isNew?: boolean;
  _id?: string;
}

const WeeklyPlanner = () => {
  const { user } = useAppSelector((s) => s.auth);
  const [loading, _] = useState(false);
  const [publishing, setPublishing] = useState(false);

  // Data
  const [staff, setStaff] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [activeShopId, setActiveShopId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State
  const [modalData, setModalData] = useState<{
    user_id: string;
    dayIndex: number;
    shift_start: string;
    shift_end: string;
    note: string;
  } | null>(null);

  const [shiftToDelete, setShiftToDelete] = useState<ShiftCell | null>(null);

  // Selection
  const [currentDate, setCurrentDate] = useState(new Date());
  const [allRotas, setAllRota] = useState<ShiftCell[]>([]);
  const [shifts, setShifts] = useState<ShiftCell[]>([]);
  console.log("🚀 - WeeklyPlanner - shifts:", shifts);
  const [conflicts, setConflicts] = useState<any[]>([]);

  // Helpers
  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Monday start
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const weekStart = getWeekStart(currentDate);

  const getWeekDays = () => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  };

  const days = getWeekDays();

  useEffect(() => {
    let fetchedShops: any[] = [];
    let currentShopId = activeShopId;

    usersApi
      .list()
      .then(({ data }) => {
        setStaff(data.data.users);
      })
      .catch(() => {
        toast.error("Failed to load staff.");
      });

    shopsApi
      .list()
      .then(({ data }) => {
        fetchedShops = data.data.shops;
        setShops(fetchedShops);
      })
      .catch(() => {
        toast.error("Failed to load shops.");
      });

    rotasApi
      .list()
      .then(({ data }) => {
        const existingRotas: any[] = data?.data?.rotas || [];
        setAllRota(existingRotas);
      })
      .catch(() => {
        toast.error("Failed to load rotas.");
      });

    if (!currentShopId) {
      if (user?.shop_id) currentShopId = user.shop_id;
      else if (fetchedShops.length > 0) currentShopId = fetchedShops[0]._id;
      setActiveShopId(currentShopId);
    }
  }, []);

  // Initial Fetch & Refresh on date/shop change
  const fetchPlannerData = async () => {
    const mappedShifts: ShiftCell[] = allRotas
      .filter((r: any) => r.shop_id._id === activeShopId)
      .map((r: any) => {
        const rUserId = r.user_id?._id;
        const shiftStart = new Date(r.shift_start);
        const rDate = new Date(shiftStart);
        rDate.setHours(0, 0, 0, 0);
        const dayIndex = days.findIndex((d) => {
          const checkDate = new Date(d);
          checkDate.setHours(0, 0, 0, 0);
          return checkDate.getTime() === rDate.getTime();
        });
        return {
          user_id: rUserId,
          dayIndex,
          shift_start: r.shift_start || shiftStart.toISOString(),
          shift_end: r.shift_end || "",
          note: r.note || "",
          isNew: false,
          _id: r._id,
        };
      })
      .filter((s) => s.dayIndex !== -1);
    setShifts(mappedShifts);
  };

  useEffect(() => {
    fetchPlannerData();
  }, [activeShopId, allRotas]);

  // Handle Bulk Publish
  const handlePublish = async () => {
    if (shifts.length === 0) return;
    setPublishing(true);
    setConflicts([]);

    const payload = {
      shop_id: activeShopId,
      week_start: weekStart.toISOString().split("T")[0],
      days: [0, 1, 2, 3, 4, 5, 6],
      replace_existing: false,
      assignments: shifts
        .filter((s) => s.isNew)
        .map((s) => ({
          user_id: s.user_id,
          start_time: s.shift_start,
          end_time: s.shift_end,
          note: s.note || "",
        })),
    };

    try {
      const res = await rotasApi.bulkCreate(payload);
      if (res.data?.data?.conflicts?.length > 0) {
        setConflicts(res.data.data.conflicts);
        toast.warning(
          `Published with ${res.data.data.conflicts.length} conflicts.`,
        );
      } else {
        toast.success("Rota published successfully!");
        fetchPlannerData(); // Refresh the grid with the rotas api
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to publish rota.");
    } finally {
      setPublishing(false);
    }
  };

  const toggleWeek = (dir: "next" | "prev") => {
    const d = new Date(currentDate);
    d.setDate(d.getDate() + (dir === "next" ? 7 : -7));
    setCurrentDate(d);
  };

  const handleAddShiftClick = (user_id: string, dayIndex: number) => {
    const shiftDate = new Date(days[dayIndex]);

    // Default to 09:00 - 17:00
    const start = new Date(shiftDate);
    start.setHours(9, 0, 0, 0);

    const end = new Date(shiftDate);
    end.setHours(17, 0, 0, 0);

    // Get input formatted value slice(0, 16) matches YYYY-MM-DDThh:mm
    setModalData({
      user_id,
      dayIndex,
      shift_start: start.toISOString().slice(0, 16),
      shift_end: end.toISOString().slice(0, 16),
      note: "",
    });
  };

  const handleModalSave = () => {
    if (!modalData) return;
    setShifts((prev) => [
      ...prev,
      {
        user_id: modalData.user_id,
        dayIndex: modalData.dayIndex,
        shift_start: new Date(modalData.shift_start).toISOString(),
        shift_end: new Date(modalData.shift_end).toISOString(),
        note: modalData.note,
        isNew: true,
      },
    ]);
    setModalData(null);
  };

  const handleDeleteConfirm = async () => {
    if (!shiftToDelete) return;
    if (shiftToDelete._id) {
      try {
        await rotasApi.remove(shiftToDelete._id);
        toast.success("Shift removed");
      } catch {
        toast.error("Failed to remove shift");
        setShiftToDelete(null);
        return;
      }
    }
    setShifts((prev) => prev.filter((s) => s !== shiftToDelete));
    setShiftToDelete(null);
  };

  const filteredStaff = useMemo(() => {
    if (!searchQuery) return staff;
    const lowerQ = searchQuery.toLowerCase();
    return staff.filter((u) => u.name.toLowerCase().includes(lowerQ));
  }, [staff, searchQuery]);

  // Formatter for grid cell display
  const formatTime = (isoString: string) => {
    if (!isoString) return "---";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // UI Components
  if (loading)
    return (
      <div className="p-12 text-center text-slate-400">
        <Loader2 className="animate-spin inline mr-2" /> Loading planner...
      </div>
    );

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-800">Weekly Planner</h1>
          <p className="text-xs text-slate-500 font-medium">
            Monday {weekStart.toLocaleDateString()} - Sunday{" "}
            {days[6].toLocaleDateString()}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search staff..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-primary-500 outline-none w-48 transition-all"
            />
          </div>

          <select
            value={activeShopId}
            onChange={(e) => setActiveShopId(e.target.value)}
            className="h-10 rounded-xl border border-slate-200 px-4 text-xs font-bold bg-slate-50 outline-none focus:ring-2 focus:ring-primary-500 transition-all"
          >
            {shops.map((shop) => (
              <option key={shop._id} value={shop._id}>
                {shop.name}
              </option>
            ))}
          </select>
          <div className="flex h-10 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => toggleWeek("prev")}
              className="p-2 hover:bg-white rounded-lg transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => toggleWeek("next")}
              className="p-2 hover:bg-white rounded-lg transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
          <Button
            variant="primary"
            onClick={handlePublish}
            isLoading={publishing}
            disabled={shifts.length === 0}
          >
            <Save size={16} className="mr-2" /> Publish Week
          </Button>
        </div>
      </div>

      {conflicts.length > 0 && (
        <div className="bg-danger-50 border border-danger-100 rounded-2xl p-4 animate-shake">
          <div className="flex items-center gap-2 text-danger-700 font-bold text-sm mb-2">
            <AlertTriangle size={18} /> Scheduling Conflicts Detected
          </div>
          <div className="space-y-1">
            {conflicts.map((c, i) => (
              <p key={i} className="text-[10px] text-danger-600 font-medium">
                • {c.reason}: User {c.user_id} on {c.shift_date}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Grid */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-100">
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left sticky left-0 bg-slate-50 z-10 w-48">
                Employee
              </th>
              {days.map((day, i) => (
                <th
                  key={i}
                  className="p-4 border-l border-slate-100 min-w-[120px]"
                >
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                    {day.toLocaleDateString(undefined, { weekday: "short" })}
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {day.getDate()}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStaff.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-8 text-center text-slate-400">
                  No staff members found.
                </td>
              </tr>
            ) : (
              filteredStaff.map((member) => (
                <tr
                  key={member._id}
                  className="hover:bg-slate-50 transition-colors group"
                >
                  <td className="p-4 sticky left-0 bg-white group-hover:bg-slate-50 z-10 shadow-[2px_0_4px_rgba(0,0,0,0.02)]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-50 text-primary-600 flex items-center justify-center text-[10px] font-black">
                        {member.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-800 truncate">
                          {member.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium truncate">
                          {member.role_id?.role_name}
                        </p>
                      </div>
                    </div>
                  </td>
                  {days.map((_, i) => {
                    const shift = shifts.find(
                      (s) => s.user_id === member._id && s.dayIndex === i,
                    );
                    return (
                      <td
                        key={i}
                        className="p-2 border-l border-slate-100 group/cell relative"
                      >
                        {shift ? (
                          <div className="p-3 rounded-xl bg-primary-50 border border-primary-100 group/shift hover:shadow-md transition-all">
                            <div className="flex justify-between items-start mb-1">
                              <Clock size={12} className="text-primary-600" />
                              <button
                                onClick={() => setShiftToDelete(shift)}
                                className="opacity-0 group-hover/shift:opacity-100 p-1 hover:bg-danger-100 rounded-md text-danger-500 transition-all"
                              >
                                <Trash2 size={10} />
                              </button>
                            </div>
                            <p className="text-xs font-black text-primary-700">
                              {formatTime(shift.shift_start)}
                            </p>
                            <p className="text-[9px] font-bold text-primary-400">
                              {formatTime(shift.shift_end)}
                            </p>
                            {shift.note && (
                              <p
                                className="mt-1 text-[9px] text-primary-600 truncate opacity-80"
                                title={shift.note}
                              >
                                {shift.note}
                              </p>
                            )}
                          </div>
                        ) : (
                          <button
                            onClick={() => handleAddShiftClick(member._id, i)}
                            className="w-full py-4 rounded-xl border-2 border-dashed border-slate-100 text-slate-300 hover:border-primary-200 hover:text-primary-300 flex items-center justify-center transition-all opacity-0 group-hover/cell:opacity-100"
                          >
                            <Plus size={16} />
                          </button>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
          <UsersIcon size={16} /> {filteredStaff.length} Active Personnel
        </div>
        <p className="text-[10px] text-slate-400 font-medium italic">
          Changes are local until Published
        </p>
      </div>

      {/* Modal for adding a shift */}
      {modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-5 animate-scale-up">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Add Shift</h3>
              <button
                onClick={() => setModalData(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1">
                  Start Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={modalData.shift_start}
                  onChange={(e) =>
                    setModalData((prev: any) => ({
                      ...prev,
                      shift_start: e.target.value,
                    }))
                  }
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1">
                  End Date & Time
                </label>
                <input
                  type="datetime-local"
                  value={modalData.shift_end}
                  onChange={(e) =>
                    setModalData((prev: any) => ({
                      ...prev,
                      shift_end: e.target.value,
                    }))
                  }
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-500 ml-1">
                  Note
                </label>
                <textarea
                  value={modalData.note}
                  onChange={(e) =>
                    setModalData((prev: any) => ({
                      ...prev,
                      note: e.target.value,
                    }))
                  }
                  placeholder="Optional shift notes..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none h-20"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setModalData(null)}
              >
                Cancel
              </Button>
              <Button variant="primary" fullWidth onClick={handleModalSave}>
                Save Shift
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {shiftToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-900/30 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-4 animate-scale-up">
            <div className="flex items-center gap-3 text-danger-600 mb-2">
              <AlertTriangle size={24} />
              <h3 className="font-bold text-slate-800 text-lg">Remove Shift</h3>
            </div>
            <p className="text-sm text-slate-500">
              Are you sure you want to remove this shift? This action cannot be
              undone once published.
            </p>
            <div className="flex gap-3 pt-4">
              <Button
                variant="secondary"
                fullWidth
                onClick={() => setShiftToDelete(null)}
              >
                Cancel
              </Button>
              <button
                className="w-full py-2.5 rounded-xl text-sm font-bold bg-danger-50 text-danger-600 hover:bg-danger-100 transition-colors"
                onClick={handleDeleteConfirm}
              >
                Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default WeeklyPlanner;
