import { format } from "date-fns";
import { Bell, LogOut, User, Menu } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import { logout } from "../../store/slices/authSlice";
import { getInitials } from "../../utils";

interface HeaderProps {
  onMenuToggle: () => void;
}

const Header = ({ onMenuToggle }: HeaderProps) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(logout());
  };

  const today = new Date();
  const dateString = format(today, "EEEE, MMMM do, yyyy"); // e.g. "Friday, March 13th, 2026"

  return (
    <header className="fixed top-0 right-0 left-0 h-16 bg-white border-b border-slate-100 z-20 flex items-center px-4 gap-4 shadow-sm">
      {/* Mobile menu toggle */}
      <button
        onClick={onMenuToggle}
        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-primary-800 transition-colors md:hidden"
        aria-label="Toggle mobile menu"
      >
        <Menu size={20} />
      </button>

      {/* Date */}
      <div className="flex-1">
        <p className="text-xs text-slate-400 font-medium hidden sm:block">{dateString}</p>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Notifications (placeholder) */}
        <button
          className="relative p-2 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-primary-800 transition-colors"
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-danger-500 rounded-full ring-2 ring-white" />
        </button>

        {/* User Menu */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-slate-100">
          {/* Avatar */}
          <div className="w-8 h-8 rounded-full bg-accent-600 text-white text-xs font-bold flex items-center justify-center select-none">
            {user?.name ? getInitials(user.name) : <User size={14} />}
          </div>
          <div className="hidden sm:flex flex-col leading-tight">
            <span className="text-sm font-semibold text-primary-800">
              {user?.name ?? "Loading…"}
            </span>
            <span className="text-[10px] text-slate-400 font-medium truncate max-w-[120px]">
              {user?.role_id?.name ?? "—"}
            </span>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            title="Sign out"
            className="p-2 rounded-lg text-slate-400 hover:bg-red-50 hover:text-danger-500 transition-colors"
            aria-label="Sign out"
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
