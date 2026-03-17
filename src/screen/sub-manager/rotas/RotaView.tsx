import { useEffect, useState } from "react";
import { rotasApi } from "../../../config/apiCall";
import { Clock, MapPin, Loader2, Search } from "lucide-react";
import { Rota } from "../../../utils/types";
import { toast } from "react-toastify";
import clsx from "clsx";

const RotaView = () => {
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchRotas = async () => {
      try {
        const res = await rotasApi.list();
        // Sub-manager sees all shifts or filtered by shop
        const allRotas = res.data.data.rotas || [];
        setRotas(allRotas.sort((a: any, b: any) => 
          new Date(a.shift_date).getTime() - new Date(b.shift_date).getTime()
        ));
      } catch (err) {
        toast.error("Failed to load shop rotas.");
      } finally {
        setLoading(false);
      }
    };
    fetchRotas();
  }, []);

  const filteredRotas = rotas.filter((r: Rota) => {
    const userName = typeof r.user_id === 'string' ? r.user_id : r.user_id?.name || "";
    return userName.toLowerCase().includes(searchTerm.toLowerCase());
  });

  if (loading) return <div className="p-12 text-center text-slate-400"><Loader2 className="animate-spin inline mr-2" /> Loading schedules...</div>;

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl font-bold text-slate-800">Shop Roster</h1>
          <p className="text-xs text-slate-500 font-medium">View-only access to published shift assignments</p>
        </div>
        
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input 
            type="text" 
            placeholder="Search by employee name..."
            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2 text-xs focus:ring-2 focus:ring-primary-500 outline-none transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-widest text-left">
              <th className="p-4">Employee</th>
              <th className="p-4">Date</th>
              <th className="p-4">Shift</th>
              <th className="p-4">Location</th>
              <th className="p-4">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredRotas.map((rota: Rota) => (
              <tr key={rota._id} className="hover:bg-slate-50 transition-colors">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-black text-slate-500">
                      {(typeof rota.user_id === 'string' ? 'U' : rota.user_id?.name?.slice(0,2) || 'U').toUpperCase()}
                    </div>
                    <p className="text-sm font-bold text-slate-700">
                      {typeof rota.user_id === 'string' ? rota.user_id : rota.user_id?.name}
                    </p>
                  </div>
                </td>
                <td className="p-4">
                  <p className="text-sm font-bold text-slate-600">
                    {new Date(rota.shift_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                  </p>
                </td>
                <td className="p-4">
                  <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-lg text-xs font-bold text-slate-600">
                    <Clock size={12} /> {rota.start_time} - {rota.end_time || "TBA"}
                  </div>
                </td>
                <td className="p-4">
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                    <MapPin size={14} className="text-slate-300" />
                    {typeof rota.shop_id === 'string' ? rota.shop_id : rota.shop_id?.name}
                  </div>
                </td>
                <td className="p-4">
                  <span className={clsx(
                    "inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter",
                    rota.is_published ? "bg-success-50 text-success-600" : "bg-warning-50 text-warning-600"
                  )}>
                    {rota.is_published ? "Published" : "Draft"}
                  </span>
                </td>
              </tr>
            ))}
            {filteredRotas.length === 0 && (
              <tr>
                <td colSpan={5} className="p-12 text-center text-slate-400 italic text-sm">
                  No shifts found matching your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RotaView;
