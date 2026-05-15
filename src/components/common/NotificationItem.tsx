import { formatDistanceToNow } from "date-fns";
import { X } from "lucide-react";
import { cn } from "../../utils";
import type { Notification } from "../../utils/notificationTypes";
import {
  EVENT_DISPLAY,
  SEVERITY_STYLES,
} from "../../utils/notificationTypes";

interface NotificationItemProps {
  notification: Notification;
  onMarkRead: (id: string) => void;
  onArchive: (id: string) => void;
  onClick?: (n: Notification) => void;
}

const NotificationItem = ({
  notification: n,
  onMarkRead,
  onArchive,
  onClick,
}: NotificationItemProps) => {
  const display = EVENT_DISPLAY[n.event_type] ?? { icon: "🔔", color: "primary" };
  const severity = SEVERITY_STYLES[n.severity];
  const isUnread = !n.read_at;

  const handleClick = () => {
    if (isUnread) onMarkRead(n._id);
    onClick?.(n);
  };

  return (
    <div
      className={cn(
        "group relative flex gap-3 px-4 py-3 cursor-pointer transition-all duration-150",
        "border-b border-slate-100 last:border-0",
        isUnread
          ? "bg-accent-50/60 hover:bg-accent-50"
          : "bg-white hover:bg-slate-50",
      )}
      onClick={handleClick}
    >
      {/* Unread dot */}
      {isUnread && (
        <span
          className={cn(
            "absolute left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 rounded-full",
            severity.dot,
          )}
        />
      )}

      {/* Event icon */}
      <div
        className={cn(
          "shrink-0 w-9 h-9 rounded-xl flex items-center justify-center text-lg border",
          severity.border,
          severity.badge,
        )}
      >
        {display.icon}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0">
        <p
          className={cn(
            "text-xs leading-snug truncate",
            isUnread ? "font-semibold text-slate-800" : "font-medium text-slate-600",
          )}
        >
          {n.title}
        </p>
        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-2 leading-relaxed">
          {n.message}
        </p>
        <div className="flex items-center gap-2 mt-1">
          {n.shop_id && (
            <span className="text-[10px] font-medium text-primary-400 bg-primary-50 px-1.5 py-0.5 rounded-md">
              {n.shop_id.name}
            </span>
          )}
          <span className="text-[10px] text-slate-400">
            {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
          </span>
        </div>
      </div>

      {/* Archive button — visible on hover */}
      <button
        className={cn(
          "shrink-0 opacity-0 group-hover:opacity-100 transition-opacity",
          "p-1 rounded-md text-slate-400 hover:text-danger-500 hover:bg-danger-50",
        )}
        onClick={(e) => {
          e.stopPropagation();
          onArchive(n._id);
        }}
        title="Archive"
      >
        <X size={13} />
      </button>
    </div>
  );
};

export default NotificationItem;
