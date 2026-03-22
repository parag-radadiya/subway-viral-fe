import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { shopsApi } from "../../../config/apiCall";
import {
  Store,
  MapPin,
  Navigation,
  Edit,
  Trash2,
  ArrowLeft,
  Loader2,
  Radius,
} from "lucide-react";
import { ROUTES } from "../../../utils/routes";
import Button from "../../../components/common/Button";

interface Shop {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  geofence_radius_m: number;
}

const ShopDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [shop, setShop] = useState<Shop | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      shopsApi
        .getById(id)
        .then((res) => setShop(res.data.data.shop))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-medium">Loading location details...</p>
      </div>
    );
  }

  if (!shop) {
    return (
      <div className="text-center p-12">
        <p className="text-slate-500">Shop not found.</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => navigate(ROUTES.ADMIN.SHOPS.LIST)}
        >
          <ArrowLeft size={16} className="mr-2" /> Back to List
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(ROUTES.ADMIN.SHOPS.LIST)}
          className="flex items-center text-slate-500 hover:text-primary-600 transition-colors text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft size={16} className="mr-1.5" />
          Back to Directory
        </button>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(ROUTES.ADMIN.SHOPS.EDIT(shop._id))}
          >
            <Edit size={16} className="mr-2" /> Edit Shop
          </Button>
          <Button variant="danger" size="sm">
            <Trash2 size={16} className="mr-2" /> Deactivate
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 h-32 relative">
          <div className="absolute -bottom-8 left-8 p-4 bg-primary-600 rounded-2xl shadow-lg border-4 border-white text-white">
            <Store size={32} />
          </div>
        </div>
        <div className="pt-12 p-8 pb-6">
          <h1 className="text-2xl font-bold text-slate-900">{shop.name}</h1>
          <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
            <MapPin size={14} /> Global Branch ID: {shop._id}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 pt-0 border-b border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
              Geofence Radius
            </p>
            <div className="flex items-end gap-2 text-slate-800">
              <Radius size={20} className="text-primary-500 mb-1" />
              <span className="text-xl font-black">
                {shop.geofence_radius_m}
              </span>
              <span className="text-xs font-bold mb-1 ml-[-4px]">meters</span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
              Latitude
            </p>
            <div className="flex items-end gap-2 text-slate-800">
              <Navigation size={20} className="text-accent-500 mb-1" />
              <span className="text-xl font-mono font-bold tracking-tighter">
                {shop.latitude.toFixed(6)}
              </span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
              Longitude
            </p>
            <div className="flex items-end gap-2 text-slate-800">
              <Navigation
                size={20}
                className="text-accent-500 mb-1 -rotate-90"
              />
              <span className="text-xl font-mono font-bold tracking-tighter">
                {shop.longitude.toFixed(6)}
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50/30 flex justify-between items-center text-[10px] text-slate-400 font-medium">
          <p>Created: Mar 10, 2026</p>
          <p>Last Sync: Just now</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-700">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            Security Protocol
          </h3>
          <p className="text-sm leading-relaxed">
            Attendance at this location requires active geofencing and biometric
            verification. The current radius of{" "}
            <span className="font-bold">{shop.geofence_radius_m}m</span> is
            optimized for the branch perimeter.
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-500" />
            Personnel Summary
          </h3>
          <p className="text-sm leading-relaxed">
            There are currently{" "}
            <span className="font-bold">12 staff members</span> assigned to this
            shop. User assignments can be managed via the Users directory.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ShopDetail;
