import { useEffect, useState } from "react";
import { rotasApi } from "../../../config/apiCall";
import { useAppSelector } from "../../../store";
import { Calendar, Clock, MapPin, Loader2 } from "lucide-react";
import { Rota } from "../../../utils/types";
import { toast } from "react-toastify";
import clsx from "clsx";
import Table from "../../../components/common/Table";

const MyRota = () => {
  const { user } = useAppSelector((s) => s.auth);
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [weekData, setWeekData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<string>("");

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      const fetchCall = selectedWeek
        ? rotasApi.week({ week_start: selectedWeek })
        : rotasApi.list();

      fetchCall
        .then(({ data }) => {
          if (selectedWeek) {
            setWeekData(data.data || data);
            setRotas([]);
          } else {
            setWeekData(null);
            let allRotas = data.data.rotas || [];
            const myRotas = allRotas.filter((r: any) => {
              const rUserId =
                typeof r.user_id === "string" ? r.user_id : r.user_id?._id;
              return rUserId === user.id;
            });

            setRotas(
              myRotas.sort(
                (a: any, b: any) =>
                  new Date(a.shift_date).getTime() -
                  new Date(b.shift_date).getTime(),
              ),
            );
          }
        })
        .catch((err) => {
          console.error("Error fetching rotas:", err);
          toast.error("Failed to load your rota schedule.");
        })
        .finally(() => setLoading(false));
    }
  }, [user?.id, selectedWeek]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-medium">Fetching your schedule...</p>
      </div>
    );
  }

  return (
    <div className=" space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Rota</h1>
          <p className="text-sm text-slate-500 mt-0.5">
            View your upcoming shifts and assignments
          </p>
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="flex flex-col flex-1 sm:flex-initial">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
              Select Week Start
            </label>
            <input
              type="date"
              className="px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary-500 w-full sm:w-auto"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
            />
          </div>
          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-500 shrink-0">
            <Calendar size={28} />
          </div>
        </div>
      </div>

      {selectedWeek && weekData ? (
        <div className="space-y-6 animate-fade-in text-left">
          {Object.entries(weekData.days || {}).map(([dayStr, shifts]: [string, any]) => {
            const myShifts = shifts.filter((s: any) => {
              const sUserId = typeof s.user_id === "string" ? s.user_id : s.user_id?._id;
              return sUserId === user?.id;
            });

            return (
              <div key={dayStr} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 font-bold text-slate-700 text-sm tracking-widest uppercase">
                  {dayStr}
                </div>
                <div className="p-6">
                  {myShifts.length === 0 ? (
                    <p className="text-slate-400 text-sm italic py-2 text-center">No shifts assigned for this day.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myShifts.map((shift: any) => (
                        <div key={shift._id} className="border border-slate-100 rounded-xl p-4 bg-white hover:border-primary-200 hover:shadow-md transition-all group">
                          <div className="flex justify-between items-start mb-4">
                            {shift.is_published && (
                               <span className="flex items-center gap-1 text-[10px] font-bold text-success-600 uppercase ml-auto">
                                 <div className="w-1.5 h-1.5 rounded-full bg-success-500" /> Published
                               </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                              <Clock size={20} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Shift Time</p>
                              <p className="text-sm font-bold text-slate-700">
                                {shift.start_time} - {shift.end_time || "TBA"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 bg-primary-50 text-primary-600 rounded-lg flex items-center justify-center group-hover:bg-primary-600 group-hover:text-white transition-colors">
                              <MapPin size={20} />
                            </div>
                            <div>
                              <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location</p>
                              <p className="text-sm font-bold text-slate-700">
                                {typeof shift.shop_id === 'string' ? shift.shop_id : shift.shop_id?.name}
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
          })}
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <Table
            columns={[
              {
                header: "Date",
                render: (rota) => (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-primary-600">
                      <Calendar size={14} />
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                      {new Date(rota.shift_date).toLocaleDateString(undefined, {
                        weekday: "short",
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </p>
                  </div>
                ),
              },
              {
                header: "Shift",
                render: (rota) => (
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">
                    <Clock size={12} /> {rota.start_time} -{" "}
                    {rota.end_time || "TBA"}
                  </div>
                ),
              },
              {
                header: "Location",
                render: (rota) => (
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <MapPin size={14} className="text-slate-300" />
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
            ]}
            data={rotas}
            keyExtractor={(rota) => rota._id}
            emptyStateMessage={
              <span className="italic text-slate-400">
                You have no upcoming shifts assigned.
              </span>
            }
          />
        </div>
      )}
    </div>
  );
};

export default MyRota;
