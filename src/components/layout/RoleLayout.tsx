import { useState, type ReactNode } from "react";
import { useAppSelector } from "../../store";
import { Store, User, LogOut, Menu, X } from "lucide-react";
import { useAppDispatch } from "../../store";
import { logout } from "../../store/slices/authSlice";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../utils/routes";
import { authApi } from "../../config/apiCall";

interface RoleLayoutProps {
  children: ReactNode;
  roleTitle: string;
  navItems: { label: string; path: string; icon: any }[];
}

const RoleLayout = ({ children, roleTitle, navItems }: RoleLayoutProps) => {
  const { user } = useAppSelector((s) => s.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    try {
      const refreshToken = localStorage.getItem("refresh_token");
      await authApi.logout({ refresh_token: refreshToken || "" });
    } catch (err) {
      console.error("Logout API error:", err);
    } finally {
      dispatch(logout());
      navigate(ROUTES.LOGIN);
    }
  };

  const closeSidebar = () => setIsSidebarOpen(false);

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans relative">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-56 bg-primary-950 text-slate-300 flex flex-col border-r border-slate-800 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 flex items-center justify-between border-b border-white/5">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary-500 flex items-center justify-center text-white shrink-0">
              <Store size={18} />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white leading-tight">
                Subway
              </h1>
              <p className="text-[10px] text-slate-500">{roleTitle}</p>
            </div>
          </div>
          <button
            onClick={closeSidebar}
            className="md:hidden text-slate-400 hover:text-white p-1"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => (
            <button
              key={item.path}
              onClick={() => {
                navigate(item.path);
                closeSidebar();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm transition-all hover:bg-white/5 hover:text-white group"
            >
              <item.icon
                size={18}
                className="text-slate-500 group-hover:text-primary-400"
              />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-white/5 bg-black/20">
          <div className="flex items-center gap-3 px-3 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs text-white border border-white/10 overflow-hidden">
              <User size={14} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-white truncate">
                {user?.name || "User"}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {user?.email}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs text-danger-400 hover:bg-danger-400/10 transition-colors"
          >
            <LogOut size={16} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-slate-50 relative flex flex-col min-w-0 w-full">
        <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-slate-200 px-4 md:px-6 py-3 flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="md:hidden p-1.5 -ml-1.5 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <h2 className="text-sm font-semibold text-slate-800 uppercase tracking-wider truncate">
              {roleTitle} Portal
            </h2>
          </div>
          <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap hidden sm:block">
            {new Date().toLocaleDateString(undefined, {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </div>
          <div className="text-[10px] text-slate-400 font-medium whitespace-nowrap sm:hidden">
            {new Date().toLocaleDateString(undefined, {
              year: "numeric",
              month: "short",
              day: "numeric",
            })}
          </div>
        </header>
        <div className="p-4 md:p-6 flex-1">{children}</div>
      </main>
    </div>
  );
};

export default RoleLayout;
