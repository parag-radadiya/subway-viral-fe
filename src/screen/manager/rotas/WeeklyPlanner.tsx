import { useEffect, useState, useCallback } from "react";
import { rotasApi, usersApi, shopsApi } from "../../../config/apiCall";
import { useAppSelector } from "../../../store";
import {
  Plus,
  Save,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertTriangle,
  Users as UsersIcon,
  Clock,
} from "lucide-react";
import { Rota } from "../../../utils/types";
import { toast } from "react-toastify";
import Button from "../../../components/common/Button";

interface ShiftCell {
  user_id: string;
  dayIndex: number; // 0-6 (Mon-Sun)
  start_time: string;
  end_time: string;
  isNew?: boolean;
  _id?: string;
}

const WeeklyPlanner = () => {
  const { user } = useAppSelector((s) => s.auth);
  const [loading, setLoading] = useState(true);
  const [publishing, setPublishing] = useState(false);

  // Data
  const [staff, setStaff] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [activeShopId, setActiveShopId] = useState("");

  // Selection
  const [currentDate, setCurrentDate] = useState(new Date());
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

  // Initial Fetch & Refresh on date/shop change
  const fetchPlannerData = useCallback(async () => {
    setLoading(true);
    try {
      const formattedDate = weekStart.toISOString().split("T")[0];
      const [usersRes, shopsRes, rotasRes] = await Promise.all([
        usersApi.list(),
        shopsApi.list(),
        rotasApi.week(formattedDate),
      ]);

      setStaff(usersRes.data.data.users);
      setShops(shopsRes.data.data.shops);

      if (!activeShopId) {
        if (user?.shop_id) setActiveShopId(user.shop_id);
        else if (shopsRes.data.data.shops.length > 0)
          setActiveShopId(shopsRes.data.data.shops[0]._id);
      }

      // Map existing rotas to shifts state
      const existingRotas: Rota[] = rotasRes.data.data.rotas || [];
      const mappedShifts: ShiftCell[] = existingRotas
        .map((r) => {
          const rUserId =
            typeof r.user_id === "string" ? r.user_id : (r.user_id as any)?._id;
          const rDate = new Date(r.shift_date);
          rDate.setHours(0, 0, 0, 0);

          const dayIndex = days.findIndex((d) => {
            const checkDate = new Date(d);
            checkDate.setHours(0, 0, 0, 0);
            return checkDate.getTime() === rDate.getTime();
          });

          return {
            user_id: rUserId,
            dayIndex,
            start_time: r.start_time,
            end_time: r.end_time || "",
            isNew: false,
            _id: r._id,
          };
        })
        .filter((s) => s.dayIndex !== -1);

      setShifts(mappedShifts);
    } catch (err) {
      toast.error("Failed to load planner data.");
    } finally {
      setLoading(false);
    }
  }, [weekStart, activeShopId, user?.shop_id]);

  useEffect(() => {
    fetchPlannerData();
  }, []);

  // Handle Bulk Publish
  const handlePublish = async () => {
    if (shifts.length === 0) return;
    setPublishing(true);
    setConflicts([]);

    const payload = {
      shop_id: activeShopId,
      week_start: weekStart.toISOString().split("T")[0],
      days: days.map((d) => d.toISOString().split("T")[0]),
      assignments: shifts.map((s) => ({
        user_id: s.user_id,
        shift_date: days[s.dayIndex].toISOString().split("T")[0],
        start_time: s.start_time,
        end_time: s.end_time || null,
      })),
    };

    try {
      const res = await rotasApi.bulkCreate(payload);
      if (res.data.data.conflicts?.length > 0) {
        setConflicts(res.data.data.conflicts);
        toast.warning(
          `Published with ${res.data.data.conflicts.length} conflicts.`,
        );
      } else {
        toast.success("Rota published successfully!");
        setShifts([]); // Reset for next edit or ideally fetch from back
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

        <div className="flex items-center gap-2">
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
            {staff.map((member) => (
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
                              onClick={async () => {
                                if (shift._id) {
                                  try {
                                    await rotasApi.remove(shift._id);
                                    toast.success("Shift removed");
                                  } catch {
                                    toast.error("Failed to remove shift");
                                    return;
                                  }
                                }
                                setShifts((prev) =>
                                  prev.filter((s) => s !== shift),
                                );
                              }}
                              className="opacity-0 group-hover/shift:opacity-100 p-1 hover:bg-danger-100 rounded-md text-danger-500 transition-all"
                            >
                              <Trash2 size={10} />
                            </button>
                          </div>
                          <p className="text-xs font-black text-primary-700">
                            {shift.start_time}
                          </p>
                          <p className="text-[9px] font-bold text-primary-400">
                            {shift.end_time || "---"}
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() =>
                            setShifts((prev) => [
                              ...prev,
                              {
                                user_id: member._id,
                                dayIndex: i,
                                start_time: "09:00",
                                end_time: "17:00",
                                isNew: true,
                              },
                            ])
                          }
                          className="w-full py-4 rounded-xl border-2 border-dashed border-slate-100 text-slate-300 hover:border-primary-200 hover:text-primary-300 flex items-center justify-center transition-all opacity-0 group-hover/cell:opacity-100"
                        >
                          <Plus size={16} />
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
          <UsersIcon size={16} /> {staff.length} Active Personnel
        </div>
        <p className="text-[10px] text-slate-400 font-medium italic">
          Changes are local until Published
        </p>
      </div>
    </div>
  );
};

export default WeeklyPlanner;
