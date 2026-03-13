import { useEffect } from "react";
import { format } from "date-fns";
import {
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import { StatCard } from "../../components/common/Card";
import { useAppDispatch, useAppSelector } from "../../store";
import { setUser } from "../../store/slices/authSlice";
import { authApi } from "../../config/apiCall";
import type { User } from "../../utils/types";

// ─── Mock data (replace with real API data in future phases) ──────────────────
const MOCK_STATS = [
  {
    title: "Total Sales",
    value: "£24,563",
    change: "+12.5% from last month",
    changeType: "up" as const,
    icon: <ShoppingCart size={20} />,
    variant: "info" as const,
    subtitle: "March 2026",
  },
  {
    title: "Orders",
    value: "1,284",
    change: "+8.3% from last month",
    changeType: "up" as const,
    icon: <TrendingUp size={20} />,
    variant: "success" as const,
    subtitle: "This month",
  },
  {
    title: "Active Staff",
    value: "42",
    change: "2 new this week",
    changeType: "up" as const,
    icon: <Users size={20} />,
    variant: "default" as const,
    subtitle: "Across all shops",
  },
  {
    title: "Low Stock Items",
    value: "7",
    change: "Requires attention",
    changeType: "down" as const,
    icon: <AlertTriangle size={20} />,
    variant: "warning" as const,
    subtitle: "Below reorder threshold",
  },
];

const Dashboard = () => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  // Fetch user profile on mount if not yet loaded
  useEffect(() => {
    if (!user) {
      authApi
        .getMe()
        .then((res) => {
          dispatch(setUser(res.data.data as User));
        })
        .catch(() => {
          // Profile fetch error is non-critical on dashboard; silently ignore
        });
    }
  }, [dispatch, user]);

  const today = new Date();
  const dateDisplay = format(today, "EEEE, MMMM do, yyyy");

  const hour = today.getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <h1 className="text-2xl font-bold text-primary-900">
            {greeting}, {user?.name?.split(" ")[0] ?? "there"} 👋
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">{dateDisplay}</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-success-50 text-success-700 text-xs font-semibold border border-success-100">
            <span className="w-1.5 h-1.5 rounded-full bg-success-500 animate-pulse" />
            All systems operational
          </span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {MOCK_STATS.map((stat, i) => (
          <div
            key={stat.title}
            style={{ animationDelay: `${i * 0.07}s` }}
            className="animate-fade-in-up"
          >
            <StatCard
              title={stat.title}
              value={stat.value}
              change={stat.change}
              changeType={stat.changeType}
              icon={stat.icon}
              variant={stat.variant}
              subtitle={stat.subtitle}
            />
          </div>
        ))}
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Activity */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-card border border-slate-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-primary-800">Recent Activity</h2>
            <button className="text-xs text-accent-600 hover:text-accent-700 font-medium transition-colors">
              View all →
            </button>
          </div>
          <div className="space-y-3">
            {[
              { label: "Order #1042 placed — Sandwich Platter", time: "2 min ago", color: "bg-accent-500" },
              { label: "Inventory restocked — Bread Rolls (200 units)", time: "18 min ago", color: "bg-success-500" },
              { label: "Low stock alert — Lettuce", time: "1 hr ago", color: "bg-warning-500" },
              { label: "New staff member onboarded — Alex J.", time: "3 hr ago", color: "bg-primary-400" },
              { label: "Report generated — Weekly Sales", time: "Yesterday", color: "bg-slate-400" },
            ].map((item, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-slate-50 last:border-0">
                <div className={`w-2 h-2 rounded-full shrink-0 ${item.color}`} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-primary-700 truncate">{item.label}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">{item.time}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-card border border-slate-100 p-5">
          <h2 className="text-base font-bold text-primary-800 mb-4">Quick Actions</h2>
          <div className="space-y-2">
            {[
              { label: "Add Inventory Item", icon: <Package size={15} />, color: "hover:bg-accent-50 hover:text-accent-700" },
              { label: "Create Sales Order", icon: <ShoppingCart size={15} />, color: "hover:bg-success-50 hover:text-success-700" },
              { label: "View Staff Roster", icon: <Users size={15} />, color: "hover:bg-primary-50 hover:text-primary-700" },
              { label: "Generate Report", icon: <TrendingUp size={15} />, color: "hover:bg-warning-50 hover:text-warning-700" },
            ].map((action, i) => (
              <button
                key={i}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-600 bg-slate-50 ${action.color} transition-all duration-150 text-left`}
              >
                <span>{action.icon}</span>
                {action.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
