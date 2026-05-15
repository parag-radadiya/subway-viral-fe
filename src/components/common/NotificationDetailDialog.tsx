import { format } from "date-fns";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "../../utils";
import { ROUTES } from "../../utils/routes";
import type { Notification } from "../../utils/notificationTypes";
import {
  CATEGORY_LABELS,
  EVENT_DISPLAY,
  SEVERITY_STYLES,
} from "../../utils/notificationTypes";
import Button from "./Button";
import Dialog from "./Dialog";

interface NotificationDetailDialogProps {
  notification: Notification | null;
  onClose: () => void;
  onMarkRead: (id: string) => void;
  onArchive: (id: string) => void;
}

// ─── Severity config ──────────────────────────────────────────────────────────

const SEVERITY_CONFIG = {
  info: {
    label: "Info",
    labelClass: "bg-slate-100 text-slate-600 border border-slate-200",
    iconRing: "ring-2 ring-slate-200 bg-slate-50",
  },
  warning: {
    label: "Warning",
    labelClass: "bg-warning-100 text-warning-600 border border-warning-200",
    iconRing: "ring-2 ring-warning-200 bg-warning-50",
  },
  critical: {
    label: "Critical",
    labelClass: "bg-danger-100 text-danger-600 border border-danger-200",
    iconRing: "ring-2 ring-danger-200 bg-danger-50",
  },
} as const;

// ─── Meta row ─────────────────────────────────────────────────────────────────

const MetaRow = ({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) => (
  <div className="flex items-start gap-3">
    <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center shrink-0 mt-0.5">
      <Icon size={13} className="text-slate-500" />
    </div>
    <div>
      <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 leading-none mb-0.5">
        {label}
      </p>
      <p className="text-xs font-medium text-slate-700">{value}</p>
    </div>
  </div>
);

// ─── Deep-link resolver ───────────────────────────────────────────────────────

function resolveDeepLink(
  n: Notification,
): { label: string; path: string } | null {
  if (n.attendance_id)
    return { label: "View attendance record", path: ROUTES.ADMIN.ATTENDANCE };
  if (n.inventory_query_id)
    return {
      label: "View inventory query",
      path: ROUTES.ADMIN.INVENTORY.QUERIES,
    };
  if (n.inventory_item_id)
    return { label: "View inventory item", path: ROUTES.ADMIN.INVENTORY.LIST };
  if (n.rota_id) return { label: "View rota", path: ROUTES.ADMIN.ROTAS.LIST };
  if (n.target_user_id) {
    const uid =
      typeof n.target_user_id === "object"
        ? n.target_user_id._id
        : n.target_user_id;
    return {
      label: "View user profile",
      path: ROUTES.ADMIN.USERS.DETAILS(uid),
    };
  }
  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────

const NotificationDetailDialog = ({
  notification: n,
  onClose,
  onMarkRead,
  onArchive,
}: NotificationDetailDialogProps) => {
  const navigate = useNavigate();

  // Let Dialog handle its isOpen guard, body-scroll-lock, backdrop, Escape key,
  // and the close ✕ button — we just supply the content.
  if (!n) return null;

  const display = EVENT_DISPLAY[n.event_type] ?? { icon: "🔔" };
  const severity = SEVERITY_STYLES[n.severity];
  const severityCfg = SEVERITY_CONFIG[n.severity];
  const deepLink = resolveDeepLink(n);
  const isUnread = !n.read_at;

  const actorName =
    typeof n.actor_id === "object" && n.actor_id ? n.actor_id.name : null;
  const targetName =
    typeof n.target_user_id === "object" && n.target_user_id
      ? n.target_user_id.name
      : null;
  const shopName =
    typeof n.shop_id === "object" && n.shop_id ? n.shop_id.name : null;

  const handleGoTo = () => {
    if (!deepLink) return;
    if (isUnread) onMarkRead(n._id);
    navigate(deepLink.path);
    onClose();
  };

  const handleArchive = () => {
    onArchive(n._id);
    onClose();
  };

  // ─── Footer passed to Dialog ─────────────────────────────────────────────

  const footer = (
    <>
      <button
        onClick={handleArchive}
        className="mr-auto text-[11px] font-medium text-slate-400 hover:text-danger-500 transition-colors px-2 py-1 rounded-lg hover:bg-danger-50"
      >
        Archive
      </button>

      {isUnread && (
        <Button
          variant="secondary"
          size="sm"
          onClick={() => {
            onMarkRead(n._id);
            onClose();
          }}
          className="text-xs"
        >
          Mark as read
        </Button>
      )}

      {deepLink && (
        <Button
          variant="primary"
          size="sm"
          rightIcon={<ExternalLink size={12} />}
          onClick={handleGoTo}
          className="text-xs gap-1"
        >
          {deepLink.label}
          <ArrowRight size={12} />
        </Button>
      )}
    </>
  );

  // ─── Render via the shared Dialog shell ──────────────────────────────────

  return (
    <Dialog
      isOpen
      onClose={onClose}
      title={n.title}
      maxWidth="md"
      footer={footer}
    >
      {/* Event summary strip — icon + severity/category/unread badges */}
      <div className="flex items-center gap-3 mb-5">
        <div
          className={cn(
            "w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shrink-0 shadow-sm border",
            severityCfg.iconRing,
            severity.border,
          )}
        >
          {display.icon}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span
            className={cn(
              "text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full",
              severityCfg.labelClass,
            )}
          >
            {severityCfg.label}
          </span>
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide bg-slate-100 px-2 py-0.5 rounded-full border border-slate-200">
            {CATEGORY_LABELS[n.category]}
          </span>
          {isUnread && (
            <span className="text-[10px] font-bold text-accent-700 bg-accent-100 px-2 py-0.5 rounded-full border border-accent-200">
              Unread
            </span>
          )}
        </div>
      </div>

      {/* Full message */}
      <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 rounded-xl px-4 py-3 border border-slate-100 mb-5">
        {n.message}
      </p>

      {/* Meta grid */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-3 mb-4">
        {shopName && <MetaRow icon={Building2} label="Shop" value={shopName} />}
        {actorName && <MetaRow icon={User} label="By" value={actorName} />}
        {targetName && targetName !== actorName && (
          <MetaRow icon={User} label="About" value={targetName} />
        )}
        <MetaRow
          icon={Calendar}
          label="Date"
          value={format(new Date(n.createdAt), "d MMM yyyy")}
        />
        <MetaRow
          icon={Clock}
          label="Time"
          value={format(new Date(n.createdAt), "HH:mm")}
        />
        {n.read_at && (
          <MetaRow
            icon={Clock}
            label="Read at"
            value={format(new Date(n.read_at), "d MMM, HH:mm")}
          />
        )}
      </div>

      {/* Extra metadata (e.g. late_minutes, repair_cost) */}
      {n.metadata && Object.keys(n.metadata).length > 0 && (
        <div className="rounded-xl border border-slate-100 bg-slate-50 px-4 py-3">
          <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400 mb-2">
            Details
          </p>
          <dl className="space-y-1">
            {Object.entries(n.metadata).map(([key, val]) => (
              <div
                key={key}
                className="flex items-center justify-between gap-2"
              >
                <dt className="text-xs text-slate-500 capitalize">
                  {key.replace(/_/g, " ")}
                </dt>
                <dd className="text-xs font-semibold text-slate-700">
                  {String(val)}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </Dialog>
  );
};

export default NotificationDetailDialog;
