import { useEffect, useState } from "react";
import { rotasApi } from "../../../config/apiCall";
import {
  Users,
  Store,
  Clock,
  TrendingUp,
  Loader2,
  Calendar,
} from "lucide-react";
import { toast } from "react-toastify";
import clsx from "clsx";

interface Stats {
  total_shifts: number;
  total_hours: number;
  by_shop: Record<string, any>;
  by_employee: Record<string, any>;
}

const RotaDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<Stats | null>(null);
  const [currentDate] = useState(new Date());

  useEffect(() => {
    const fetchStats = () => {
      setLoading(true);
      rotasApi
        .dashboard()
        .then((res) => {
          setStats(res.data.data);
        })
        .catch((err) => {
          toast.error(err.message || "Failed to load rota analytics.");
        })
        .finally(() => {
          setLoading(false);
        });
    };
    fetchStats();
  }, [currentDate]);

  if (loading)
    return (
      <div className="p-12 text-center text-slate-400">
        <Loader2 className="animate-spin inline mr-2" /> Loading analytics...
      </div>
    );

  const StatCard = ({ icon: Icon, label, value, color }: any) => (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center gap-5">
      <div
        className={clsx(
          "w-14 h-14 rounded-2xl flex items-center justify-center transition-transform hover:scale-110",
          color,
        )}
      >
        <Icon size={28} />
      </div>
      <div>
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-0.5">
          {label}
        </p>
        <p className="text-2xl font-black text-slate-800">{value}</p>
      </div>
    </div>
  );

  // Compute overall total hours for the header stats
  let totalHours = 0;
  if (stats?.by_employee) {
    stats.by_employee.forEach((emp: any) => {
      (emp.shifts || []).forEach((s: any) => {
        if (s.start_time && s.end_time) {
          const [sh, sm] = s.start_time.split(":").map(Number);
          const [eh, em] = s.end_time.split(":").map(Number);
          let hours = eh + em / 60 - (sh + sm / 60);
          if (hours < 0) hours += 24;
          totalHours += hours;
        }
      });
    });
  }

  return (
    <div className="space-y-8 animate-fade-in pb-20">
      <div className="flex justify-between items-center bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-2xl font-black text-slate-800 uppercase tracking-tight">
            Rota Analytics
          </h1>
          <p className="text-xs text-slate-500 font-medium italic">
            Performance and distribution insights for the current week
          </p>
        </div>
        <div className="w-12 h-12 bg-accent-100 text-accent-600 rounded-2xl flex items-center justify-center">
          <TrendingUp size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon={Calendar}
          label="Total Shifts"
          value={stats?.total_shifts || 0}
          color="bg-primary-50 text-primary-600"
        />
        <StatCard
          icon={Clock}
          label="Planned Hours"
          value={`${Math.round(totalHours)}h`}
          color="bg-orange-50 text-orange-600"
        />
        <StatCard
          icon={Users}
          label="Employees"
          value={stats?.by_employee?.length || 0}
          color="bg-purple-50 text-purple-600"
        />
        <StatCard
          icon={Store}
          label="Active Shops"
          value={stats?.by_shop?.length || 0}
          color="bg-blue-50 text-blue-600"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* By Shop Summary */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-50 text-slate-400">
              <Store size={20} />
            </div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              Distribution by Shop
            </h3>
          </div>
          <div className="space-y-4">
            {(stats?.by_shop || []).map((shopData: any) => {
              const shopId = shopData.shop._id;
              const name = shopData.shop.name;
              let shiftCount = 0;
              Object.values(shopData.days || {}).forEach((shifts: any) => {
                shiftCount += shifts.length;
              });

              return (
                <div key={shopId} className="space-y-2">
                  <div className="flex justify-between text-xs font-bold text-slate-600 uppercase tracking-widest">
                    <span>{name}</span>
                    <span>{shiftCount} shifts</span>
                  </div>
                  <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary-500 rounded-full transition-all duration-1000"
                      style={{
                        width: `${(shiftCount / (stats?.total_shifts || 1)) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* By Employee Summary */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-8 space-y-6">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-slate-50 text-slate-400">
              <Users size={20} />
            </div>
            <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight">
              Employee Load Factor
            </h3>
          </div>
          <div className="space-y-3">
            {(stats?.by_employee || [])
              .slice(0, 6)
              .map((empData: any) => {
                const user = empData.user;
                const shifts = empData.shifts || [];
                let empHours = 0;
                shifts.forEach((s: any) => {
                  if (s.start_time && s.end_time) {
                    const [sh, sm] = s.start_time.split(":").map(Number);
                    const [eh, em] = s.end_time.split(":").map(Number);
                    let hours = eh + em / 60 - (sh + sm / 60);
                    if (hours < 0) hours += 24;
                    empHours += hours;
                  }
                });

                return (
                  <div
                    key={user._id}
                    className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-primary-200 transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary-50 flex items-center justify-center text-[10px] font-black text-primary-600 border border-primary-100 transition-colors uppercase">
                        {user.name?.slice(0, 2)}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-slate-700 truncate">
                          {user.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest truncate max-w-[120px]">
                          {user.email}
                        </p>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs font-black text-slate-800">
                        {Math.round(empHours)}h
                      </p>
                      <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tighter">
                        {shifts.length} Shifts
                      </p>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RotaDashboard;
