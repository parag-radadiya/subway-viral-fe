import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  Store,
} from "lucide-react";
import { cn } from "../../utils";
import type { NavItem } from "../../utils/types";
import { ROUTES } from "../../utils/routes";
import { ENV } from "../../utils/constants";
import { useAppSelector } from "../../store";

interface SidebarProps {
  isCollapsed: boolean;
  onToggle: () => void;
}

const navItems: NavItem[] = [
  { label: "Dashboard", path: ROUTES.DASHBOARD, icon: LayoutDashboard },
  { label: "Inventory", path: ROUTES.INVENTORY, icon: Package, permission: "can_manage_inventory" },
  { label: "Sales", path: ROUTES.SALES, icon: ShoppingCart },
  { label: "Reports", path: ROUTES.REPORTS, icon: BarChart3, permission: "can_view_all_staff" },
  { label: "Settings", path: ROUTES.SETTINGS, icon: Settings },
];

const Sidebar = ({ isCollapsed, onToggle }: SidebarProps) => {
  const location = useLocation();
  const user = useAppSelector((s) => s.auth.user);
  const permissions = user?.role_id?.permissions;

  const visibleItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return permissions?.[item.permission] ?? false;
  });

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 h-full bg-primary-900 flex flex-col z-30 sidebar-transition shadow-sidebar",
        isCollapsed ? "w-[72px]" : "w-64"
      )}
    >
      {/* Brand */}
      <div
        className={cn(
          "flex items-center gap-3 px-4 border-b border-primary-700/60",
          "h-16 shrink-0"
        )}
      >
        <div className="shrink-0 flex items-center justify-center w-9 h-9 rounded-lg bg-accent-600 text-white">
          <Store size={18} />
        </div>
        {!isCollapsed && (
          <div className="overflow-hidden">
            <p className="text-white font-bold text-sm leading-tight truncate">
              {ENV.APP_NAME}
            </p>
            <p className="text-primary-400 text-[10px] font-medium uppercase tracking-widest">
              Management
            </p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.path === ROUTES.DASHBOARD
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={isCollapsed ? item.label : undefined}
              className={cn(
                "nav-link",
                isActive ? "nav-link-active" : "nav-link-inactive",
                isCollapsed && "justify-center px-2"
              )}
            >
              <Icon size={18} className="shrink-0" />
              {!isCollapsed && (
                <span className="truncate">{item.label}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Collapse Toggle */}
      <div className="px-2 py-3 border-t border-primary-700/60">
        <button
          onClick={onToggle}
          className={cn(
            "nav-link nav-link-inactive w-full",
            isCollapsed && "justify-center px-2"
          )}
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {isCollapsed ? <ChevronRight size={18} /> : (
            <>
              <ChevronLeft size={18} />
              <span className="text-xs">Collapse</span>
            </>
          )}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
