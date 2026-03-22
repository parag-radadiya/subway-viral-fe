import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { usersApi } from "../../../config/apiCall";
import {
  User as UserIcon,
  Mail,
  Shield,
  MapPin,
  Edit,
  Power,
  ArrowLeft,
  Loader2,
  Lock,
  Building,
} from "lucide-react";
import { ROUTES } from "../../../utils/routes";
import Button from "../../../components/common/Button";
import { toast } from "react-toastify";

interface User {
  _id: string;
  name: string;
  email: string;
  role_id: {
    _id: string;
    name: string;
    permissions: any;
  };
  assigned_shop_ids: string[];
}

const UserDetail = () => {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      usersApi
        .getById(id)
        .then((res) => {
          setUser(res.data.data.user);
        })
        .catch((err) => {
          toast.error("Failed to load user profile");
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-medium">Loading user profile...</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center p-12">
        <p className="text-slate-500">User not found.</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => navigate(ROUTES.ADMIN.USERS.LIST)}
        >
          <ArrowLeft size={16} className="mr-2" /> Back to Personnel
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(ROUTES.ADMIN.USERS.LIST)}
          className="flex items-center text-slate-500 hover:text-primary-600 transition-colors text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft size={16} className="mr-1.5" />
          Back to Directory
        </button>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(ROUTES.ADMIN.USERS.EDIT(user._id))}
          >
            <Edit size={16} className="mr-2" /> Update Profile
          </Button>
          <Button variant="danger" size="sm">
            <Power size={16} className="mr-2" /> Deactivate
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 h-32 relative">
          <div className="absolute -bottom-8 left-8 p-4 bg-primary-600 rounded-2xl shadow-lg border-4 border-white text-white">
            <UserIcon size={32} />
          </div>
        </div>
        <div className="pt-12 p-8 pb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">{user.name}</h1>
              <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1 font-medium">
                <Mail size={14} className="text-slate-400" /> {user.email}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-primary-50 text-primary-700 border border-primary-100">
                {user.role_id.name}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 pt-0 border-b border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
              Account Role
            </p>
            <div className="flex items-end gap-2 text-slate-800">
              <Shield size={20} className="text-primary-500 mb-1" />
              <span className="text-xl font-black capitalize">
                {user.role_id.name}
              </span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
              Assignments
            </p>
            <div className="flex items-end gap-2 text-slate-800">
              <Building size={20} className="text-accent-500 mb-1" />
              <span className="text-xl font-black">
                {user.assigned_shop_ids.length}
              </span>
              <span className="text-xs font-bold mb-1 ml-[-4px]">
                Location(s)
              </span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
              Security
            </p>
            <div className="flex items-end gap-2 text-slate-800">
              <Lock size={20} className="text-amber-500 mb-1" />
              <span className="text-sm font-bold">Standard Auth</span>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50/30 flex justify-between items-center text-[10px] text-slate-400 font-medium tracking-tight">
          <p>System User ID: {user._id}</p>
          <p>Last Activity: Today, 21:14</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            Module Access Control
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {user.role_id.permissions &&
              Object.entries(user.role_id.permissions).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100 hover:border-primary-100 transition-colors"
                >
                  <span className="text-[11px] font-bold text-slate-600 capitalize tracking-tight flex items-center gap-2">
                    <div
                      className={`w-1 h-1 rounded-full ${value ? "bg-success-500" : "bg-slate-300"}`}
                    />
                    {key.replace(/_/g, " ")}
                  </span>
                  <span
                    className={`text-[9px] font-black uppercase tracking-widest ${value ? "text-success-600" : "text-slate-400"}`}
                  >
                    {value ? "Enabled" : "Restricted"}
                  </span>
                </div>
              ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm font-medium">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-500" />
            Location Distribution
          </h3>
          {user.assigned_shop_ids.length > 0 ? (
            <div className="space-y-3">
              {user.assigned_shop_ids.map((shopId) => (
                <div
                  key={shopId}
                  className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 text-xs font-bold text-slate-700 flex items-center justify-between group hover:border-accent-200 transition-all cursor-pointer"
                  onClick={() => navigate(ROUTES.ADMIN.SHOPS.DETAILS(shopId))}
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white rounded-lg border border-slate-100 text-slate-400 group-hover:text-accent-500 transition-colors">
                      <MapPin size={14} />
                    </div>
                    <span>Global Branch {shopId.slice(-6).toUpperCase()}</span>
                  </div>
                  <div className="flex items-center text-primary-500 hover:text-primary-600 transition-colors uppercase tracking-widest text-[9px] font-black">
                    View
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 bg-slate-50 rounded-xl border border-dashed border-slate-200 text-slate-400">
              <Building size={24} className="mb-2 opacity-50" />
              <p className="text-[11px] font-bold italic">
                No branch assignments found.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserDetail;
