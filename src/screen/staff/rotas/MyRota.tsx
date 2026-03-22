import { useEffect, useState } from "react";
import { rotasApi } from "../../../config/apiCall";
import { useAppSelector } from "../../../store";
import { Calendar, Clock, MapPin, Loader2, Search } from "lucide-react";
import { Rota } from "../../../utils/types";
import { toast } from "react-toastify";
import clsx from "clsx";
import Input from "../../../components/common/Input";
import Table from "../../../components/common/Table";

const MyRota = () => {
  const { user } = useAppSelector((s) => s.auth);
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [weekData, setWeekData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWeek, setSelectedWeek] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState("");

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
                  new Date(b.shift_date).getTime() -
                  new Date(a.shift_date).getTime(),
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

  const filteredRotas = rotas.filter((rota) => {
    const shopName = typeof rota.shop_id === 'string' ? rota.shop_id : rota.shop_id?.name || "";
    return shopName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-medium">Fetching your schedule...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">My Rota</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your upcoming shifts and assignments
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex flex-col">
            <input
              type="date"
              className="px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 shadow-sm"
              value={selectedWeek}
              onChange={(e) => setSelectedWeek(e.target.value)}
            />
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
                <div className="bg-slate-50 border-b border-slate-200 px-6 py-3 font-bold text-slate-700 text-[10px] tracking-widest uppercase">
                  {dayStr}
                </div>
                <div className="p-6">
                  {myShifts.length === 0 ? (
                    <p className="text-slate-400 text-xs italic py-2 text-center">No shifts assigned for this day.</p>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {myShifts.map((shift: any) => (
                        <div key={shift._id} className="border border-slate-100 rounded-xl p-4 bg-white hover:border-primary-200 hover:shadow-md transition-all group">
                          <div className="flex justify-between items-start mb-4">
                            {shift.is_published && (
                               <span className="flex items-center gap-1 text-[10px] font-black text-emerald-600 uppercase ml-auto">
                                 <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" /> Published
                               </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 bg-orange-50 text-orange-600 rounded-lg flex items-center justify-center group-hover:bg-orange-600 group-hover:text-white transition-colors">
                              <Clock size={20} />
                            </div>
                            <div>
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shift Time</p>
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
                              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Location</p>
                              <p className="text-sm font-bold text-slate-700">
                                {typeof shift.shop_id === 'string' ? shift.shop_id : shift.shop_id?.name}
                              </p>
                            </div>
                          </div>
                          {shift.note && (
                            <div className="mt-4 pt-3 border-t border-slate-50 text-[11px] text-slate-500 font-medium italic">
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
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <Input
              placeholder="Search by shop name..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startIcon={<Search size={16} />}
            />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-auto whitespace-nowrap">
              {filteredRotas.length} Upcoming Shifts
            </p>
          </div>
          
          <div className="p-4">
            <Table
              columns={[
                {
                  header: "Date",
                  render: (rota) => (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                        <Calendar size={16} />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        {new Date(rota.shift_date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>
                  ),
                },
                {
                  header: "Shift Time",
                  render: (rota) => (
                    <div className="flex items-center gap-2">
                       <Clock size={12} className="text-slate-300" />
                       <span className="text-sm font-medium text-slate-600">
                         {rota.start_time} - {rota.end_time || "TBA"}
                       </span>
                    </div>
                  ),
                },
                {
                  header: "Location",
                  render: (rota) => (
                    <div className="flex items-center gap-1.5 text-slate-500">
                      <MapPin size={14} className="text-slate-400" />
                      <span className="text-sm font-medium text-slate-700">
                        {typeof rota.shop_id === "string"
                          ? rota.shop_id
                          : rota.shop_id?.name}
                      </span>
                    </div>
                  ),
                },
                {
                  header: "Status",
                  align: "right",
                  render: (rota) => (
                    <span
                      className={clsx(
                        "inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                        rota.is_published
                          ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                          : "bg-amber-50 text-amber-600 border-amber-100",
                      )}
                    >
                      {rota.is_published ? "Published" : "Draft"}
                    </span>
                  ),
                },
              ]}
              data={filteredRotas}
              keyExtractor={(rota) => rota._id}
              emptyStateMessage={
                <span className="italic text-slate-400 text-sm">
                  No upcoming shifts found matching your filter.
                </span>
              }
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRota;
