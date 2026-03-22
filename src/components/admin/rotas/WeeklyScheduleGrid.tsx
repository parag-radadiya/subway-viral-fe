import React from "react";
import { Clock } from "lucide-react";

interface UserInfo {
  _id: string;
  name: string;
  email?: string;
  phone_num?: string;
}

interface ShopInfo {
  _id: string;
  name: string;
}

interface Shift {
  _id: string;
  user_id: UserInfo | string;
  shop_id: ShopInfo | string;
  shift_date: string;
  start_time: string;
  shift_start: string;
  shift_end: string;
  end_time?: string;
  note?: string;
}

interface WeeklyScheduleGridProps {
  data: {
    week_start: string;
    week_end: string;
    shop_id: string;
    days: {
      [dateKey: string]: Shift[];
    };
  };
  onShiftClick: (shiftId: string) => void;
}

const WeeklyScheduleGrid: React.FC<WeeklyScheduleGridProps> = ({
  data,
  onShiftClick,
}) => {
  return (
    <div className="flex flex-col gap-4">
      {Object.entries(data.days).map(([dateKey, shifts]) => {
        // dateKey is like "Mon 16 Mar"
        const [dayName, ...dateParts] = dateKey.split(" ");
        const displayDate = dateParts.join(" ");

        return (
          <div
            key={dateKey}
            className="bg-slate-50/50 rounded-2xl border border-slate-200 flex flex-col h-full"
          >
            <div className="p-4 border-b border-slate-100 bg-white rounded-t-2xl">
              <p className="text-[10px] font-black uppercase text-primary-600 tracking-widest">
                {dayName}
              </p>
              <p className="text-sm font-black text-slate-800 tracking-tight whitespace-nowrap">
                {displayDate}
              </p>
            </div>

            <div className="p-3 space-y-3 flex-1 overflow-auto max-h-[500px] grid grid-cols-4">
              {shifts.length === 0 ? (
                <div className="h-20 flex items-center justify-center border-2 border-dashed border-slate-100 rounded-xl">
                  <p className="text-[10px] font-bold text-slate-300 uppercase tracking-tighter">
                    Empty
                  </p>
                </div>
              ) : (
                shifts.map((shift) => (
                  <div
                    key={shift._id}
                    className="group bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm hover:border-primary-200 hover:shadow-md transition-all relative overflow-hidden cursor-pointer"
                    onClick={() => onShiftClick(shift._id)}
                  >
                    <div className="flex items-center justify-between mb-3 text-[10px] font-black uppercase tracking-tighter">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center text-[10px] font-black">
                          {(typeof shift.user_id === "string"
                            ? "U"
                            : shift.user_id?.name?.slice(0, 2) || "U"
                          ).toUpperCase()}
                        </div>
                        <span className="text-xs font-semibold text-slate-700 truncate max-w-[100px]">
                          {typeof shift.user_id === "string"
                            ? shift.user_id
                            : shift.user_id?.name}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-8 h-8 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                        <Clock size={16} />
                      </div>
                      <div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">
                          Shift Time
                        </p>
                        <p className="text-xs font-bold text-slate-800">
                          {shift.start_time} - {shift.end_time || "TBA"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default WeeklyScheduleGrid;
