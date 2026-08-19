import { differenceInCalendarDays, format, startOfISOWeek } from "date-fns";

import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Pencil,
  Plus,
  Save,
  Search,
  Trash2,
  Users as UsersIcon,
  X,
} from "lucide-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-toastify";
import { rotasApi } from "../../../config/apiCall";
import Button from "../../common/Button";
import Input from "../../common/Input";
import Select from "../../common/Select";

interface ShiftCell {
  user_id: string;
  dayIndex: number; // 0-6 (Mon-Sun)
  shift_start: string;
  shift_end: string;
  note?: string;
  isNew?: boolean;
  _id?: string;
  isPreviousWeek?: boolean; // copied from previous week
}

interface BulkWeeklyRotaFormProps {
  shopId: string;
  setShopId: (id: string) => void;
  shops: any[];
  users: any[];
  loadingUser: boolean;
  onSuccess: () => void;
}

const UserWeeklyTotal = React.memo(
  ({ memberId, bulkShifts }: { memberId: string; bulkShifts: ShiftCell[] }) => {
    const totalString = useMemo(() => {
      const userShifts = bulkShifts.filter((s) => s.user_id === memberId);
      let totalMins = 0;
      userShifts.forEach((s) => {
        const start = new Date(s.shift_start).getTime();
        const end = new Date(s.shift_end).getTime();
        if (!isNaN(start) && !isNaN(end) && end > start) {
          totalMins += (end - start) / 60000;
        }
      });
      const hours = Math.floor(totalMins / 60);
      const mins = Math.round(totalMins % 60);

      return hours > 0 || mins > 0
        ? `${hours}h ${mins > 0 ? `${mins}m` : ""}`.trim()
        : "---";
    }, [bulkShifts, memberId]);

    return <>{totalString}</>;
  },
);

const BulkWeeklyRotaForm: React.FC<BulkWeeklyRotaFormProps> = ({
  shopId,
  setShopId,
  shops,
  users,
  onSuccess,
  loadingUser,
}) => {
  const [bulkShifts, setBulkShifts] = useState<ShiftCell[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState("");
  const [publishing, setPublishing] = useState(false);
  const [conflicts, setConflicts] = useState<any[]>([]);
  const [loadingExisting, setLoadingExisting] = useState(false);
  const prevWeekShopKey = useRef<string>("");
  const [modalData, setModalData] = useState<{
    user_id: string;
    dayIndex: number;
    shift_start: string;
    shift_end: string;
    note: string;
  } | null>(null);

  const getWeekStart = (date: Date) => {
    return startOfISOWeek(new Date(date));
  };

  const weekStart = getWeekStart(currentDate);

  const days = useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => {
      const d = new Date(weekStart);
      d.setDate(d.getDate() + i);
      return d;
    });
  }, [weekStart]);

  // ─── Fetch existing rotas for the selected shop + week (+ previous week) ─────
  useEffect(() => {
    if (!shopId) return;
    const weekStartStr = format(weekStart, "yyyy-MM-dd");
    const key = `${shopId}::${weekStartStr}`;
    if (prevWeekShopKey.current === key) return;
    prevWeekShopKey.current = key;

    // Compute previous week start
    const prevWeekDate = new Date(weekStart);
    prevWeekDate.setDate(prevWeekDate.getDate() - 7);
    const prevWeekStartStr = format(prevWeekDate, "yyyy-MM-dd");

    const parseShifts = (
      rotas: any[],
      baseWeekStart: Date,
      isPreviousWeek: boolean,
    ): ShiftCell[] =>
      rotas.map((r: any) => {
        // Use new Date() and LOCAL getters so the calendar date is always
        // correct for the user's timezone regardless of ISO string format.
        const raw = new Date(r.shift_date || r.shift_start);
        // Normalise to local midnight so differenceInCalendarDays is exact.
        const shiftDay = new Date(
          raw.getFullYear(),
          raw.getMonth(),
          raw.getDate(),
        );

        // dayIndex: 0 = Monday … 6 = Sunday (matches the UI Mon–Sun grid)
        const dayIndex = Math.max(
          0,
          Math.min(6, differenceInCalendarDays(shiftDay, baseWeekStart)),
        );

        return {
          _id: r._id,
          user_id:
            typeof r.user_id === "string" ? r.user_id : (r.user_id?._id ?? ""),
          dayIndex,
          shift_start: r.shift_start,
          shift_end: r.shift_end,
          note: r.note || "",
          isPreviousWeek,
        };
      });

    setLoadingExisting(true);

    Promise.all([
      rotasApi.week({ week_start: weekStartStr, shop_id: shopId }),
      rotasApi.week({ week_start: prevWeekStartStr, shop_id: shopId }),
    ])
      .then(([currentRes, prevRes]) => {
        const currentRotas: any[] = Object.values(
          currentRes.data?.data?.days ?? {},
        ).flat();
        const prevRotas: any[] = Object.values(
          prevRes.data?.data?.days ?? {},
        ).flat();
        const currentShifts = parseShifts(currentRotas, weekStart, false);
        // For previous-week shifts: remap their shift times to the CURRENT week
        // so they appear on the same day columns. Also strip _id so they're treated
        // as new entries (copyable template) unless they already exist this week.
        const prevShifts: ShiftCell[] = prevRotas
          .map((r: any) => {
            // Same approach: Date object + local getters → local midnight
            const start_raw = new Date(r.shift_start);
            const end_raw = new Date(r.shift_end);

            const startIndex = Math.max(
              0,
              Math.min(
                6,
                differenceInCalendarDays(
                  new Date(
                    start_raw.getFullYear(),
                    start_raw.getMonth(),
                    start_raw.getDate(),
                  ),
                  prevWeekDate,
                ),
              ),
            );
            const endIndex = Math.max(
              0,
              Math.min(
                6,
                differenceInCalendarDays(
                  new Date(
                    end_raw.getFullYear(),
                    end_raw.getMonth(),
                    end_raw.getDate(),
                  ),
                  prevWeekDate,
                ),
              ),
            );
            const userId =
              typeof r.user_id === "string"
                ? r.user_id
                : (r.user_id?._id ?? "");

            // Remap shift_start / shift_end to the equivalent day this week
            const remapToCurrentWeek = (isoStr: string, dayIdx: number) => {
              const orig = new Date(isoStr);
              const target = new Date(weekStart);
              target.setDate(target.getDate() + dayIdx);
              target.setHours(
                orig.getHours(),
                orig.getMinutes(),
                orig.getSeconds(),
                0,
              );
              return target.toISOString();
            };

            return {
              user_id: userId,
              dayIndex: startIndex,
              shift_start: remapToCurrentWeek(r.shift_start, startIndex),
              shift_end: remapToCurrentWeek(r.shift_end, endIndex),
              note: r.note || "",
              isPreviousWeek: true,
              isNew: true, // no _id → will be included in publish
            } as ShiftCell;
          })
          // Only keep previous-week shifts where the same user has NO current-week
          // shift on that day (avoid duplicates)
          .filter(
            (ps) =>
              !currentShifts.some(
                (cs) =>
                  cs.user_id === ps.user_id && cs.dayIndex === ps.dayIndex,
              ),
          );

        setBulkShifts([...currentShifts, ...prevShifts]);
      })
      .catch(() => {})
      .finally(() => setLoadingExisting(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [shopId, weekStart.toISOString()]);

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
    // Publish all shifts without an _id (new shifts + carried-over previous-week shifts)
    const newShifts = bulkShifts.filter((s) => !s._id);
    if (newShifts.length === 0) {
      toast.error("No new shifts assigned to publish");
      return;
    }
    setPublishing(true);
    try {
      const payload = {
        shop_id: shopId,
        week_start: format(weekStart, "yyyy-MM-dd"),
        days: [0, 1, 2, 3, 4, 5, 6],
        replace_existing: false,
        assignments: newShifts.map((s) => ({
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
        onSuccess();
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
              {format(weekStart, "dd MMM")}
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
                    {format(day, "EEE")}
                  </p>
                  <p className="text-sm font-bold text-slate-700">
                    {day.getDate()} {format(day, "MMM")}
                  </p>
                </th>
              ))}
              <th className="p-4 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center border-l border-slate-100 min-w-[80px]">
                Total
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {!filteredStaff.length && (
              <tr>
                <td colSpan={9} className="text-center py-8">
                  <p className="text-slate-400 text-sm">
                    {!shopId
                      ? "Select a shop to see users"
                      : loadingUser
                        ? "Loading staff..."
                        : "No staff found"}
                  </p>
                </td>
              </tr>
            )}
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
                  const isPrev = shift?.isPreviousWeek === true;
                  return (
                    <td
                      key={i}
                      className="p-2 border-l border-slate-100 group/cell relative"
                    >
                      {shift ? (
                        <div
                          className={`rounded-xl border group/shift hover:shadow-md transition-all cursor-pointer overflow-hidden ${
                            isPrev
                              ? "bg-amber-50 border-amber-200 hover:border-amber-300"
                              : "bg-primary-50 border-primary-100 hover:border-primary-200"
                          }`}
                          onClick={() =>
                            setModalData({
                              user_id: shift.user_id,
                              dayIndex: shift.dayIndex,
                              shift_start: new Date(shift.shift_start)
                                .toISOString()
                                .slice(0, 16),
                              shift_end: new Date(shift.shift_end)
                                .toISOString()
                                .slice(0, 16),
                              note: shift.note ?? "",
                            })
                          }
                        >
                          {/* Header */}
                          <div className="flex items-center justify-between px-2.5 pt-2 pb-0">
                            <div className="flex items-center gap-1">
                              <Clock
                                size={11}
                                className={
                                  isPrev ? "text-amber-400" : "text-primary-400"
                                }
                              />
                              {isPrev && (
                                <span className="text-[8px] font-black uppercase tracking-widest text-amber-500 leading-none">
                                  prev
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-0.5 opacity-0 group-hover/shift:opacity-100 transition-all">
                              <span
                                className={`p-0.5 rounded transition-all ${
                                  isPrev
                                    ? "hover:bg-amber-100 text-amber-400"
                                    : "hover:bg-primary-100 text-primary-400"
                                }`}
                                title="Edit Shift"
                              >
                                <Pencil size={12} />
                              </span>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setBulkShifts((prev) =>
                                    prev.filter((s) => s !== shift),
                                  );
                                }}
                                className="p-0.5 hover:bg-danger-50 rounded text-danger-400 transition-all"
                                title="Remove Shift"
                              >
                                <Trash2 size={12} />
                              </button>
                            </div>
                          </div>
                          {/* Time block */}
                          <div className="px-2.5 pt-1.5 pb-2.5">
                            <div className="flex items-center gap-1.5">
                              <div className="flex-1 min-w-0">
                                <p
                                  className={`text-[9px] font-bold uppercase tracking-wide leading-none mb-0.5 ${
                                    isPrev
                                      ? "text-amber-400"
                                      : "text-primary-400"
                                  }`}
                                >
                                  Start
                                </p>
                                <p
                                  className={`text-[11px] font-black tabular-nums leading-tight truncate ${
                                    isPrev
                                      ? "text-amber-700"
                                      : "text-primary-700"
                                  }`}
                                >
                                  {formatTimeGrid(shift.shift_start)}
                                </p>
                              </div>

                              <div className="flex-1 min-w-0 text-right">
                                <p
                                  className={`text-[9px] font-bold uppercase tracking-wide leading-none mb-0.5 ${
                                    isPrev
                                      ? "text-amber-400"
                                      : "text-primary-400"
                                  }`}
                                >
                                  End
                                </p>
                                <p
                                  className={`text-[11px] font-black tabular-nums leading-tight truncate ${
                                    isPrev
                                      ? "text-amber-500"
                                      : "text-primary-500"
                                  }`}
                                >
                                  {formatTimeGrid(shift.shift_end)}
                                </p>
                              </div>
                            </div>
                          </div>
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
                <td className="p-4 border-l border-slate-100 text-center bg-slate-50/50 font-bold text-slate-700 text-sm">
                  <UserWeeklyTotal
                    memberId={member._id}
                    bulkShifts={bulkShifts}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap justify-between items-center gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-100">
        <div className="flex items-center gap-2 text-slate-500 text-xs font-bold">
          <UsersIcon size={16} /> {filteredStaff.length} Employees Available
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-primary-100 border border-primary-200" />
            <span className="text-[10px] text-slate-500 font-medium">
              This week
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-sm bg-amber-100 border border-amber-200" />
            <span className="text-[10px] text-slate-500 font-medium">
              Carried from previous week
            </span>
          </div>
        </div>
        <p className="text-[10px] text-slate-400 font-medium italic">
          Changes are local until you Publish Week
        </p>
      </div>

      {modalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 backdrop-blur-sm animate-fade-in text-left">
          <div className="bg-white rounded-3xl p-6 w-full max-w-xl shadow-2xl space-y-5 animate-scale-up">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-800">
                {bulkShifts.some(
                  (s) =>
                    s.user_id === modalData.user_id &&
                    s.dayIndex === modalData.dayIndex,
                )
                  ? "Edit Shift"
                  : "Assign Shift"}
              </h3>
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
                    type="time"
                    value={modalData.shift_start.split("T")[1] || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setModalData({
                        ...modalData,
                        shift_start: `${modalData.shift_start.split("T")[0]}T${e.target.value}`,
                      })
                    }
                  />
                  <Input
                    type="time"
                    value={modalData.shift_end.split("T")[1] || ""}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setModalData({
                        ...modalData,
                        shift_end: `${modalData.shift_end.split("T")[0]}T${e.target.value}`,
                      })
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
                  const start = new Date(modalData.shift_start);
                  const end = new Date(modalData.shift_end);
                  if (+end < +start) {
                    end.setDate(end.getDate() + 1);
                  }
                  setBulkShifts((prev) => {
                    const idx = prev.findIndex(
                      (s) =>
                        s.user_id === modalData.user_id &&
                        s.dayIndex === modalData.dayIndex,
                    );
                    if (idx !== -1) {
                      // update in-place
                      const updated = [...prev];
                      updated[idx] = {
                        ...updated[idx],
                        shift_start: start.toISOString(),
                        shift_end: end.toISOString(),
                        note: modalData.note,
                      };
                      return updated;
                    }
                    return [
                      ...prev,
                      {
                        user_id: modalData.user_id,
                        dayIndex: modalData.dayIndex,
                        shift_start: start.toISOString(),
                        shift_end: end.toISOString(),
                        note: modalData.note,
                        isNew: true,
                      },
                    ];
                  });
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
