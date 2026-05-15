import { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react";
import { cn } from "../../utils";
import { useNotifications } from "../../hooks/useNotifications";
import { useAppSelector } from "../../store";
import {
  TABS_BY_ROLE,
  type NotificationUserRole,
  type Notification,
} from "../../utils/notificationTypes";
import NotificationPopover from "./NotificationPopover";
import NotificationDetailDialog from "./NotificationDetailDialog";

interface NotificationBellProps {
  className?: string;
}

const NotificationBell = ({ className }: NotificationBellProps) => {
  const [open, setOpen] = useState(false);
  const [selectedNotification, setSelectedNotification] =
    useState<Notification | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const notifications = useNotifications();

  // ── Derive visible categories from the logged-in user's role ────────────
  const { user } = useAppSelector((s) => s.auth);
  const roleName =
    (user?.role as { role_name?: string } | undefined)?.role_name ??
    (user?.role as unknown as string | undefined) ??
    "Staff";

  const resolvedRole: NotificationUserRole =
    roleName === "Root"
      ? "Root"
      : roleName === "Admin"
        ? "Admin"
        : roleName === "Manager"
          ? "Manager"
          : roleName === "Sub-Manager"
            ? "Sub-Manager"
            : "Staff";

  const visibleCategories = TABS_BY_ROLE[resolvedRole];

  // Staff have no notifications — hide bell entirely
  if (visibleCategories.length === 0) return null;

  const total = notifications.unreadCount?.total ?? 0;

  // ── Close popover on outside click (but not when dialog is open) ────────
  const handleOutsideClick = (e: MouseEvent) => {
    if (
      containerRef.current &&
      !containerRef.current.contains(e.target as Node)
    ) {
      setOpen(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Escape" && !selectedNotification) setOpen(false);
  };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  useEffect(() => {
    if (open) {
      document.addEventListener("mousedown", handleOutsideClick);
      document.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, selectedNotification]);

  return (
    <>
      {/* ── Bell + popover (inside relative container) ──────────────────── */}
      <div ref={containerRef} className="relative">
        <button
          id="notification-bell-btn"
          aria-label={`Notifications${total > 0 ? `, ${total} unread` : ""}`}
          aria-haspopup="dialog"
          aria-expanded={open}
          onClick={() => setOpen((prev) => !prev)}
          className={cn(
            "relative p-2 rounded-xl transition-all duration-150",
            "text-slate-500 hover:text-accent-600",
            "hover:bg-accent-50 focus:outline-none focus:ring-2 focus:ring-accent-200",
            open && "bg-accent-50 text-accent-600",
            className,
          )}
        >
          <Bell size={18} />

          {total > 0 && (
            <span
              className={cn(
                "absolute -top-0.5 -right-0.5",
                "min-w-[17px] h-[17px] px-1",
                "flex items-center justify-center",
                "rounded-full text-[10px] font-bold leading-none",
                "bg-danger-500 text-white",
                "shadow-sm ring-2 ring-white",
              )}
            >
              {total > 99 ? "99+" : total}
            </span>
          )}
        </button>

        <NotificationPopover
          isOpen={open}
          onClose={() => setOpen(false)}
          visibleCategories={visibleCategories}
          notifications={notifications.notifications}
          unreadCount={notifications.unreadCount}
          isListLoading={notifications.isListLoading}
          hasMore={notifications.hasMore}
          activeCategory={notifications.activeCategory}
          error={notifications.error}
          onSetCategory={notifications.setCategory}
          onMarkRead={notifications.markRead}
          onMarkAllRead={notifications.markAllRead}
          onArchive={notifications.archive}
          onLoadMore={notifications.loadMore}
          onRefresh={notifications.refresh}
          onFetchNotifications={notifications.fetchNotifications}
          onOpenDetail={setSelectedNotification}
        />
      </div>

      {/* ── Detail dialog — sibling to the relative container so it renders  */}
      {/* outside any stacking context and the z-50 backdrop works correctly. */}
      <NotificationDetailDialog
        notification={selectedNotification}
        onClose={() => setSelectedNotification(null)}
        onMarkRead={notifications.markRead}
        onArchive={(id) => {
          notifications.archive(id);
          setSelectedNotification(null);
        }}
      />
    </>
  );
};

export default NotificationBell;
