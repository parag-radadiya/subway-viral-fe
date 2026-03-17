import { useEffect, useState } from "react";
import { rotasApi } from "../../../config/apiCall";
import { useAppSelector } from "../../../store";
import { Calendar, Clock, MapPin, Loader2 } from "lucide-react";
import { Rota } from "../../../utils/types";
import { toast } from "react-toastify";

const MyRota = () => {
  const { user } = useAppSelector((s) => s.auth);
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      // Backend expects user_id for filtering
      rotasApi
        .list()
        .then((res) => {
          // Filter manually if backend doesn't support query params yet
          // based on typical list behavior
          const allRotas = res.data.data.rotas || [];
          const myRotas = allRotas.filter((r: any) => {
            const rUserId = typeof r.user_id === 'string' ? r.user_id : r.user_id?._id;
            return rUserId === user.id;
          });
          
          setRotas(myRotas.sort((a: any, b: any) => 
            new Date(a.shift_date).getTime() - new Date(b.shift_date).getTime()
          ));
        })
        .catch((err) => {
          console.error("Error fetching rotas:", err);
          toast.error("Failed to load your rota schedule.");
        })
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-medium">Fetching your schedule...</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">My Rota</h1>
          <p className="text-sm text-slate-500 mt-0.5">View your upcoming shifts and assignments</p>
        </div>
        <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-500">
          <Calendar size={28} />
        </div>
      </div>

      {rotas.length === 0 ? (
        <div className="bg-white rounded-3xl border border-dashed border-slate-200 p-20 flex flex-col items-center justify-center text-slate-400">
          <Calendar size={64} className="mb-4 opacity-10" />
          <p className="text-lg font-bold">No Shifts Found</p>
          <p className="text-sm">You have no upcoming shifts assigned.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {rotas.map((rota) => (
            <div 
              key={rota._id} 
              className="bg-white rounded-2xl border border-slate-200 p-5 hover:shadow-lg transition-all duration-300 group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  {new Date(rota.shift_date).toLocaleDateString(undefined, { weekday: 'long' })}
                </div>
                {rota.is_published && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-success-600 uppercase">
                    <div className="w-1.5 h-1.5 rounded-full bg-success-500" /> Published
                  </span>
                )}
              </div>
              
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                    <Calendar size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Date</p>
                    <p className="text-sm font-bold text-slate-700">
                      {new Date(rota.shift_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600 transition-colors group-hover:bg-orange-600 group-hover:text-white">
                    <Clock size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Shift Time</p>
                    <p className="text-sm font-bold text-slate-700">
                      {rota.start_time} - {rota.end_time || "End TBA"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600 transition-colors group-hover:bg-blue-600 group-hover:text-white">
                    <MapPin size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Location</p>
                    <p className="text-sm font-bold text-slate-700">
                      {typeof rota.shop_id === 'string' ? rota.shop_id : rota.shop_id?.name}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyRota;
