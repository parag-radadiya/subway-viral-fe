import React, { useMemo, useState } from "react";
import { toast } from "react-toastify";
import {
  Save,
  Plus,
  Search,
  Users as UsersIcon,
  X,
  ChevronLeft,
  ChevronRight,
  Clock,
  AlertTriangle,
  Trash2,
} from "lucide-react";
import Input from "../../common/Input";
import Select from "../../common/Select";
import Button from "../../common/Button";
import { rotasApi } from "../../../config/apiCall";
import { ROUTES } from "../../../utils/routes";

interface ShiftCell {
  user_id: string;
  dayIndex: number; // 0-6 (Mon-Sun)
  shift_start: string;
  shift_end: string;
  note?: string;
  isNew?: boolean;
  _id?: string;
}

interface BulkWeeklyRotaFormProps {
  shopId: string;
  setShopId: (id: string) => void;
  shops: any[];
  users: any[];
  navigate: (path: string) => void;
}

const BulkWeeklyRotaForm: React.FC<BulkWeeklyRotaFormProps> = ({
  shopId,
  setShopId,
  shops,
  users,
  navigate,
}) => {
  const [bulkShifts, setBulkShifts] = useState<ShiftCell[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [modalData, setModalData] = useState<{
    user_id: string;
    dayIndex: number;
    shift_start: string;
    shift_end: string;
    note: string;
  } | null>(null);

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1);
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const weekStart = getWeekStart(currentDate);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  const filteredStaff = useMemo(() => {
    if (!searchQuery) return users;
    const lowerQ = searchQuery.toLowerCase();
    return users.filter((u) => u.name.toLowerCase().includes(lowerQ));
  }, [users, searchQuery]);

  const formatTimeGrid = (isoString: string) => {
    if (!isoString) return "---";
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const handlePublish = async () => {
    if (!shopId) {
      toast.error("Please select a shop first");
      return;
    }
    if (bulkShifts.length === 0) {
      toast.error("No shifts assigned to publish");
      return;
    }
    setPublishing(true);
    try {
      const payload = {
        shop_id: shopId,
        week_start: weekStart.toISOString().split("T")[0],
        days: [0, 1, 2, 3, 4, 5, 6],
        replace_existing: false,
        assignments: bulkShifts.map((s) => ({
          user_id: s.user_id,
          start_time: s.shift_start,
          end_time: s.shift_end,
          note: s.note || "",
        })),
      };
      const res = await rotasApi.bulkCreate(payload);
      if (res.data?.data?.conflicts?.length > 0) {
        setConflicts(res.data.data.conflicts);
        toast.warning(
          `Bulk saved with ${res.data.data.conflicts.length} conflicts.`,
        );
      } else {
        toast.success("Weekly rota published successfully!");
        navigate(ROUTES.ADMIN.ROTAS.LIST);
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to publish bulk rota");
    } finally {
      setPublishing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <Select
            value={shopId}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
              setShopId(e.target.value)
            }
          >
            <option value="" disabled>
              Select Shop
            </option>
            {shops.map((s) => (
              <option key={s._id} value={s._id}>
                {s.name}
              </option>
            ))}
          </Select>

          <div className="flex h-10 bg-slate-100 rounded-xl p-1">
            <button
              onClick={() => {
                const d = new Date(currentDate);
                d.setDate(d.getDate() - 7);
                setCurrentDate(d);
              }}
              className="p-2 hover:bg-white rounded-lg transition-all"
            >
              <ChevronLeft size={16} />
            </button>
            <div className="px-3 flex items-center text-xs font-bold text-slate-600 whitespace-nowrap">
              {weekStart.toLocaleDateString("en-GB", {
                day: "2-digit",
                month: "short",
              })}
            </div>
            <button
              onClick={() => {
                const d = new Date(currentDate);
                d.setDate(d.getDate() + 7);
                setCurrentDate(d);
              }}
              className="p-2 hover:bg-white rounded-lg transition-all"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {bulkShifts.length > 0 && (
            <button
              onClick={() => {
                if (window.confirm("Clear all assigned shifts in the grid?")) {
                  setBulkShifts([]);
                }
              }}
              className="text-[10px] font-black text-danger-500 hover:text-danger-600 uppercase tracking-widest px-3 py-2 transition-colors whitespace-nowrap"
            >
              Clear Grid
            </button>
          )}
          <Input
            placeholder="Find staff..."
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setSearchQuery(e.target.value)
            }
            startIcon={<Search size={16} />}
          />
          <Button
            variant="primary"
            onClick={handlePublish}
            isLoading={publishing}
          >
            <Save size={18} className="mr-2" />
            Publish Week
          </Button>
        </div>
      </div>

      {conflicts.length > 0 && (
        <div className="bg-danger-50 border border-danger-100 rounded-2xl p-4">
          <div className="flex items-center gap-2 text-danger-700 font-bold text-sm mb-2">
            <AlertTriangle size={18} /> Schedule Conflicts Detected
          </div>
          <div className="space-y-1">
            {conflicts.map((c, i) => (
              <p key={i} className="text-[10px] text-danger-600 font-medium">
                • {c.reason} {c.shift_date ? `on ${c.shift_date}` : ""}
              </p>
            ))}
          </div>
        </div>
      )}

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
                  className="p-4 border-l border-slate-100 min-w-[140px]"
                >
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">
                    {day.toLocaleDateString("en-GB", { weekday: "short" })}
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {day.getDate()}{" "}
                    {day.toLocaleDateString("en-GB", { month: "short" })}
                  </p>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredStaff.map((member) => (
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
                  const shift = bulkShifts.find(
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
                              onClick={() =>
                                setBulkShifts((prev) =>
                                  prev.filter((s) => s !== shift),
                                )
                              }
                              className="opacity-0 group-hover/shift:opacity-100 p-1 hover:bg-danger-100 rounded-md text-danger-500 transition-all"
                              title="Remove Shift"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                          <p className="text-xs font-black text-primary-700">
                            {formatTimeGrid(shift.shift_start)}
                          </p>
                          <p className="text-[9px] font-bold text-primary-400">
                            {formatTimeGrid(shift.shift_end)}
                          </p>
                        </div>
                      ) : (
                        <button
                          onClick={() => {
                            const shiftDate = new Date(days[i]);
                            const start = new Date(shiftDate);
                            start.setHours(9, 0, 0, 0);
                            const end = new Date(shiftDate);
                            end.setHours(17, 0, 0, 0);

                            setModalData({
                              user_id: member._id,
                              dayIndex: i,
                              shift_start: start.toISOString().slice(0, 16),
                              shift_end: end.toISOString().slice(0, 16),
                              note: "",
                            });
                          }}
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
          <UsersIcon size={16} /> {filteredStaff.length} Employees Available
        </div>
        <p className="text-[10px] text-slate-400 font-medium italic">
          Changes are local until you Publish Week
        </p>
      </div>

      {modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white rounded-3xl p-6 w-full max-w-sm shadow-2xl space-y-5 animate-scale-up">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800">Assign Shift</h3>
              <button
                onClick={() => setModalData(null)}
                className="p-1 hover:bg-slate-100 rounded-lg text-slate-500 transition-colors"
                title="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1">
                  Shift Timing
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="datetime-local"
                    value={modalData.shift_start}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setModalData({
                        ...modalData,
                        shift_start: e.target.value,
                      })
                    }
                  />
                  <Input
                    type="datetime-local"
                    value={modalData.shift_end}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setModalData({ ...modalData, shift_end: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-500 ml-1">
                  Instructions (Optional)
                </label>
                <textarea
                  value={modalData.note}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                    setModalData({ ...modalData, note: e.target.value })
                  }
                  placeholder="e.g. Closing duties..."
                  className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary-500 outline-none resize-none h-20"
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => setModalData(null)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                className="w-full"
                onClick={() => {
                  setBulkShifts((prev) => [
                    ...prev,
                    {
                      user_id: modalData.user_id,
                      dayIndex: modalData.dayIndex,
                      shift_start: new Date(
                        modalData.shift_start,
                      ).toISOString(),
                      shift_end: new Date(modalData.shift_end).toISOString(),
                      note: modalData.note,
                      isNew: true,
                    },
                  ]);
                  setModalData(null);
                }}
              >
                Confirm Shift
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BulkWeeklyRotaForm;
