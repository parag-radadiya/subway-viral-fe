import { useEffect } from "react";
import { Bell, RefreshCw, CheckCheck, X } from "lucide-react";
import { cn } from "../../utils";
import Button from "./Button";
import NotificationItem from "./NotificationItem";
import type {
  Notification,
  NotificationCategory,
  UnreadCountData,
} from "../../utils/notificationTypes";
import { CATEGORY_LABELS } from "../../utils/notificationTypes";

// ─── Props ────────────────────────────────────────────────────────────────────

interface NotificationPopoverProps {
  isOpen: boolean;
  onClose: () => void;

  /** Categories the current user's role is allowed to see (V2 §2) */
  visibleCategories: NotificationCategory[];

  notifications: Notification[];
  unreadCount: UnreadCountData | null;
  isListLoading: boolean;
  hasMore: boolean;
  activeCategory: NotificationCategory | "all";
  error: string | null;

  onSetCategory: (cat: NotificationCategory | "all") => void;
  onMarkRead: (id: string) => void;
  onMarkAllRead: (category?: NotificationCategory) => void;
  onArchive: (id: string) => void;
  onLoadMore: () => void;
  onRefresh: () => void;
  onFetchNotifications: (
    cat: NotificationCategory | "all",
    page?: number,
  ) => void;
  /** Called when the user clicks a notification row — parent renders the dialog */
  onOpenDetail: (n: Notification) => void;
}

// ─── Category pill ────────────────────────────────────────────────────────────

const CategoryPill = ({
  label,
  count,
  active,
  onClick,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    className={cn(
      "relative flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold",
      "transition-all duration-150 whitespace-nowrap focus:outline-none",
      active
        ? "bg-accent-600 text-white shadow-sm"
        : "text-slate-500 hover:text-slate-700 hover:bg-slate-100",
    )}
  >
    {label}
    {count > 0 && (
      <span
        className={cn(
          "text-[8px] h-[14px] w-[14px] flex items-center justify-center font-bold px-1 rounded-full leading-none",
          active ? "bg-white/30 text-white" : "bg-accent-100 text-accent-700",
        )}
      >
        {count > 99 ? "99+" : count}
      </span>
    )}
  </button>
);

// ─── Skeleton row ─────────────────────────────────────────────────────────────

const SkeletonRow = () => (
  <div className="flex gap-3 px-4 py-3 animate-pulse">
    <div className="w-9 h-9 rounded-xl bg-slate-100 shrink-0" />
    <div className="flex-1 space-y-2 pt-1">
      <div className="h-2.5 bg-slate-100 rounded-full w-3/4" />
      <div className="h-2 bg-slate-100 rounded-full w-full" />
      <div className="h-2 bg-slate-100 rounded-full w-1/3" />
    </div>
  </div>
);

// ─── Main popover ─────────────────────────────────────────────────────────────

const NotificationPopover = ({
  isOpen,
  onClose,
  visibleCategories,
  notifications,
  unreadCount,
  isListLoading,
  hasMore,
  activeCategory,
  error,
  onSetCategory,
  onMarkRead,
  onMarkAllRead,
  onArchive,
  onLoadMore,
  onRefresh,
  onFetchNotifications,
  onOpenDetail,
}: NotificationPopoverProps) => {
  // Fetch list whenever popover opens
  useEffect(() => {
    if (isOpen) onFetchNotifications(activeCategory, 1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const totalUnread = unreadCount?.total ?? 0;
  const byCat = unreadCount?.by_category;

  const activeCatCount =
    activeCategory === "all" ? totalUnread : (byCat?.[activeCategory] ?? 0);

  if (!isOpen) return null;

  return (
    <>
      {/* ── invisible backdrop (click-outside handled by Bell, but belt-and-braces) */}
      <div className="fixed inset-0 z-[49]" onClick={onClose} aria-hidden />

      {/* ── Popover panel ────────────────────────────────────────────────── */}
      <div
        role="dialog"
        aria-label="Notifications"
        className={cn(
          // positioning: anchored top-right under the bell
          "absolute right-0 top-[calc(100%+10px)] z-[50]",
          // size
          "w-[380px] max-h-[520px]",
          // shape & shadow
          "bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.14)]",
          "border border-slate-200/80",
          // flex column
          "flex flex-col overflow-hidden",
          // entrance animation
          "animate-popover-in",
        )}
        style={{
          // make sure it doesn't overflow viewport on the right
          right: "0",
          // arrow notch via pseudo – we'll do it with a tiny element
        }}
      >
        {/* ── Arrow notch ──────────────────────────────────────────────── */}
        <div
          aria-hidden
          className="absolute -top-[7px] right-[14px] w-3.5 h-3.5
            bg-white border-l border-t border-slate-200/80
            rotate-45 rounded-tl-sm z-[51]"
        />

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between px-4 pt-4 pb-3 border-b border-slate-100">
          {/* Left: icon + title + badge */}
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-accent-50 flex items-center justify-center">
              <Bell size={14} className="text-accent-600" />
            </div>
            <span className="text-sm font-bold text-slate-800">
              Notifications
            </span>
            {totalUnread > 0 && (
              <span className="text-[8px] h-[14px] w-[14px] flex items-center justify-center font-bold bg-danger-500 text-white px-1.5 py-0.5 rounded-full leading-none">
                {totalUnread > 99 ? "99+" : totalUnread}
              </span>
            )}
          </div>

          {/* Right: refresh + mark-all + close */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={onRefresh}
              title="Refresh"
              className="p-1.5 rounded-lg text-slate-400 hover:text-accent-600 hover:bg-accent-50 transition-colors"
            >
              <RefreshCw
                size={13}
                className={isListLoading ? "animate-spin" : ""}
              />
            </button>

            {activeCatCount > 0 && (
              <button
                onClick={() =>
                  onMarkAllRead(
                    activeCategory !== "all" ? activeCategory : undefined,
                  )
                }
                title="Mark all as read"
                className="flex items-center gap-1 px-2 py-1 rounded-lg text-[11px] font-medium text-accent-600 hover:bg-accent-50 transition-colors"
              >
                <CheckCheck size={13} />
                <span className="hidden sm:inline">Mark all read</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        {/* ── Category pills (filtered by role per V2 §2) ─────────────── */}
        <div
          className="flex items-center gap-1 px-3 py-2 overflow-x-auto border-b border-slate-100 bg-slate-50/50 min-h-[42px] h-[42px]"
          style={{ scrollbarWidth: "none" }}
        >
          {/* "All" pill — total across the role's visible categories only */}
          <CategoryPill
            label="All"
            count={totalUnread}
            active={activeCategory === "all"}
            onClick={() => onSetCategory("all")}
          />
          {visibleCategories.map((cat) => (
            <CategoryPill
              key={cat}
              label={CATEGORY_LABELS[cat]}
              count={byCat?.[cat] ?? 0}
              active={activeCategory === cat}
              onClick={() => onSetCategory(cat)}
            />
          ))}
        </div>

        {/* ── List ─────────────────────────────────────────────────────── */}
        <div
          className="flex-1 overflow-y-auto"
          style={{ scrollbarWidth: "thin" }}
        >
          {/* Skeleton */}
          {isListLoading && notifications.length === 0 && (
            <div className="py-1">
              {[...Array(4)].map((_, i) => (
                <SkeletonRow key={i} />
              ))}
            </div>
          )}

          {/* Error */}
          {error && !isListLoading && (
            <div className="flex flex-col items-center justify-center py-10 gap-3 text-center px-4">
              <span className="text-3xl">⚠️</span>
              <p className="text-xs text-slate-500">{error}</p>
              <Button variant="secondary" size="sm" onClick={onRefresh}>
                Try again
              </Button>
            </div>
          )}

          {/* Empty */}
          {!isListLoading && !error && notifications.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 gap-2 text-center px-4">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl mb-1">
                🔔
              </div>
              <p className="text-sm font-semibold text-slate-700">
                All caught up!
              </p>
              <p className="text-xs text-slate-400">
                No{" "}
                {activeCategory !== "all"
                  ? CATEGORY_LABELS[activeCategory].toLowerCase()
                  : ""}{" "}
                notifications yet.
              </p>
            </div>
          )}

          {/* Rows */}
          {notifications.map((n) => (
            <NotificationItem
              key={n._id}
              notification={n}
              onMarkRead={onMarkRead}
              onArchive={onArchive}
              onClick={onOpenDetail}
            />
          ))}

          {/* Load more */}
          {hasMore && (
            <div className="px-4 py-3 flex justify-center border-t border-slate-100">
              <Button
                variant="ghost"
                size="sm"
                isLoading={isListLoading}
                onClick={onLoadMore}
                className="text-[11px] text-slate-500 w-full"
              >
                Load more
              </Button>
            </div>
          )}

          {/* Loading more spinner */}
          {isListLoading && notifications.length > 0 && (
            <div className="py-3 flex justify-center">
              <RefreshCw size={13} className="animate-spin text-slate-300" />
            </div>
          )}
        </div>

        {/* ── Footer ───────────────────────────────────────────────────── */}
        <div className="px-4 py-2 border-t border-slate-100 bg-slate-50/40 flex items-center justify-center">
          <p className="text-[10px] text-slate-400 tracking-wide">
            Auto-refreshes every 30 s
          </p>
        </div>
      </div>

      {/* ── Keyframe style ────────────────────────────────────────────── */}
      <style>{`
        @keyframes popover-in {
          from { opacity: 0; transform: translateY(-6px) scale(0.97); }
          to   { opacity: 1; transform: translateY(0)   scale(1);    }
        }
        .animate-popover-in {
          animation: popover-in 0.18s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </>
  );
};

export default NotificationPopover;
