import { useEffect, useState } from "react";
import { rotasApi, shopsApi } from "../../../config/apiCall";
import { Calendar, Search, Filter, Store, Clock, Loader2, BarChart3, Trash2 } from "lucide-react";
import { Rota } from "../../../utils/types";
import { toast } from "react-toastify";
import clsx from "clsx";

const RotaManagement = () => {
  const [rotas, setRotas] = useState<Rota[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedShop, setSelectedShop] = useState("all");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [rotasRes, shopsRes] = await Promise.all([
          rotasApi.list(),
          shopsApi.list()
        ]);
        setRotas(rotasRes.data.data.rotas || []);
        setShops(shopsRes.data.data.shops || []);
      } catch (err) {
        toast.error("Failed to load org-wide rota data.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this shift?")) return;
    try {
      await rotasApi.remove(id);
      setRotas(prev => prev.filter(r => r._id !== id));
      toast.success("Shift deleted successfully.");
    } catch {
      toast.error("Failed to delete shift.");
    }
  };

  const filteredRotas = rotas.filter(r => {
    const userName = typeof r.user_id === 'string' ? r.user_id : r.user_id?.name || "";
    const shopMatches = selectedShop === "all" || (typeof r.shop_id === 'string' ? r.shop_id === selectedShop : r.shop_id?._id === selectedShop);
    const searchMatches = userName.toLowerCase().includes(searchTerm.toLowerCase());
    return shopMatches && searchMatches;
  });

  if (loading) return <div className="p-12 text-center text-slate-400"><Loader2 className="animate-spin inline mr-2" /> Loading global rotas...</div>;

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">Org-Wide Rotas</h1>
          <p className="text-xs text-slate-500 font-medium">Global oversight and management across all locations</p>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text" 
              placeholder="Search employee..."
              className="w-full h-11 bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 text-xs font-bold focus:ring-2 focus:ring-primary-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter size={16} className="text-slate-400 shrink-0" />
            <select 
              className="h-11 flex-1 sm:w-48 bg-slate-50 border border-slate-200 rounded-xl px-4 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-primary-500 transition-all"
              value={selectedShop}
              onChange={(e) => setSelectedShop(e.target.value)}
            >
              <option value="all">All Shops</option>
              {shops.map(shop => (
                <option key={shop._id} value={shop._id}>{shop.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredRotas.map((rota) => (
          <div key={rota._id} className="bg-white rounded-2xl border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 group relative overflow-hidden">
            <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={() => handleDelete(rota._id)}
                className="p-2 hover:bg-danger-50 text-danger-500 rounded-lg transition-colors"
                title="Delete Shift"
              >
                <Trash2 size={16} />
              </button>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center text-xs font-black uppercase">
                {(typeof rota.user_id === 'string' ? 'U' : rota.user_id?.name?.slice(0,2) || 'U')}
              </div>
              <div>
                <p className="text-sm font-black text-slate-800">{typeof rota.user_id === 'string' ? rota.user_id : rota.user_id?.name}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest leading-none">Employee</p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-50 text-slate-400">
                  <Calendar size={14} />
                </div>
                <p className="text-xs font-bold text-slate-600">
                  {new Date(rota.shift_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-50 text-slate-400">
                  <Clock size={14} />
                </div>
                <p className="text-xs font-bold text-slate-600">
                  {rota.start_time} - {rota.end_time || "---"}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-slate-50 text-slate-400">
                  <Store size={14} />
                </div>
                <p className="text-[10px] font-black text-slate-500 uppercase truncate">
                  {typeof rota.shop_id === 'string' ? rota.shop_id : rota.shop_id?.name}
                </p>
              </div>
            </div>

            <div className={clsx(
              "mt-6 pt-4 border-t border-slate-50 flex items-center justify-between",
              rota.is_published ? "text-success-600" : "text-warning-600"
            )}>
              <span className="text-[9px] font-black uppercase tracking-widest">
                {rota.is_published ? "Published" : "Draft"}
              </span>
              <div className={clsx("w-1.5 h-1.5 rounded-full animate-pulse", rota.is_published ? "bg-success-500" : "bg-warning-500")} />
            </div>
          </div>
        ))}

        {filteredRotas.length === 0 && (
          <div className="col-span-full bg-white rounded-3xl border border-dashed border-slate-200 p-20 flex flex-col items-center justify-center text-slate-400">
            <BarChart3 size={64} className="mb-4 opacity-5" />
            <p className="text-lg font-black uppercase tracking-tighter">No Rotas Found</p>
            <p className="text-sm font-medium">Try adjusting your filters or search term.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RotaManagement;
