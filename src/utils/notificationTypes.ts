// ─── Notification Types ───────────────────────────────────────────────────────

export type NotificationCategory =
  | "attendance"
  | "inventory"
  | "rota"
  | "system";

export type NotificationSeverity = "info" | "warning" | "critical";

export type NotificationEventType =
  // Attendance
  | "LATE_PUNCH_IN"
  | "MISSED_PUNCH_IN"
  | "AUTO_PUNCH_OUT"
  | "MISSED_PUNCH_OUT"
  | "MANUAL_PUNCH_IN"
  | "ATTENDANCE_ADJUSTED"
  // Inventory
  | "INVENTORY_QUERY_OPENED"
  | "INVENTORY_QUERY_CLOSED"
  | "INVENTORY_ITEM_CREATED"
  | "INVENTORY_ITEM_DAMAGED"
  // Rota
  | "ROTA_PUBLISHED"
  // System
  | "SHOP_HOURS_CHANGED"
  | "USER_CREATED";

export interface NotificationActor {
  _id: string;
  name: string;
}

export interface NotificationShop {
  _id: string;
  name: string;
}

export interface Notification {
  _id: string;
  recipient_id: string;
  category: NotificationCategory;
  event_type: NotificationEventType;
  severity: NotificationSeverity;
  title: string;
  message: string;
  actor_id: NotificationActor | null;
  target_user_id: NotificationActor | null;
  shop_id: NotificationShop | null;
  attendance_id: string | null;
  rota_id: string | null;
  inventory_item_id: string | null;
  inventory_query_id: string | null;
  metadata: Record<string, unknown>;
  dedupe_key: string;
  read_at: string | null;
  archived_at: string | null;
  createdAt: string;
  updatedAt: string;
}

// ─── API response shapes ──────────────────────────────────────────────────────

export interface NotificationListData {
  page: number;
  limit: number;
  total: number;
  count: number;
  total_pages: number;
  has_next: boolean;
  has_prev: boolean;
  notifications: Notification[];
}

export interface UnreadCountData {
  total: number;
  by_category: Record<NotificationCategory, number>;
}

export interface NotificationSummaryCategory {
  unread_count: number;
  recent: Notification[];
}

export interface NotificationSummaryData {
  categories: Record<NotificationCategory, NotificationSummaryCategory>;
}

// ─── Display helpers ──────────────────────────────────────────────────────────

export interface EventDisplay {
  icon: string;
  color: string;
}

export const EVENT_DISPLAY: Record<NotificationEventType, EventDisplay> = {
  LATE_PUNCH_IN:          { icon: "⏰", color: "warning" },
  MISSED_PUNCH_IN:        { icon: "🚨", color: "danger" },
  AUTO_PUNCH_OUT:         { icon: "🔄", color: "warning" },
  MISSED_PUNCH_OUT:       { icon: "⏱",  color: "warning" },
  MANUAL_PUNCH_IN:        { icon: "✋", color: "accent" },
  ATTENDANCE_ADJUSTED:    { icon: "📊", color: "accent" },
  INVENTORY_QUERY_OPENED: { icon: "🔧", color: "warning" },
  INVENTORY_QUERY_CLOSED: { icon: "✅", color: "success" },
  INVENTORY_ITEM_CREATED: { icon: "📦", color: "accent" },
  INVENTORY_ITEM_DAMAGED: { icon: "⚠️", color: "warning" },
  ROTA_PUBLISHED:         { icon: "🗓",  color: "accent" },
  SHOP_HOURS_CHANGED:     { icon: "🏪", color: "primary" },
  USER_CREATED:           { icon: "👤", color: "primary" },
};

export const SEVERITY_STYLES: Record<
  NotificationSeverity,
  { badge: string; dot: string; border: string }
> = {
  info:     { badge: "bg-slate-100 text-slate-600",        dot: "bg-slate-400",     border: "border-slate-200" },
  warning:  { badge: "bg-warning-100 text-warning-600",    dot: "bg-warning-500",   border: "border-warning-200" },
  critical: { badge: "bg-danger-100 text-danger-600",      dot: "bg-danger-500",    border: "border-danger-200" },
};

export const CATEGORY_LABELS: Record<NotificationCategory, string> = {
  attendance: "Attendance",
  inventory:  "Inventory",
  rota:       "Rota",
  system:     "System",
};

export const ALL_CATEGORIES: NotificationCategory[] = [
  "attendance",
  "inventory",
  "rota",
  "system",
];

// ─── Role → visible categories (V2 spec §2) ───────────────────────────────────
// Staff: no bell at all
// Sub-Manager: inventory only
// Manager: attendance + inventory + rota
// Admin / Root: all four

export type NotificationUserRole =
  | "Root"
  | "Admin"
  | "Manager"
  | "Sub-Manager"
  | "Staff";

export const TABS_BY_ROLE: Record<NotificationUserRole, NotificationCategory[]> =
  {
    Root:          ["attendance", "inventory", "rota", "system"],
    Admin:         ["attendance", "inventory", "rota", "system"],
    Manager:       ["attendance", "inventory", "rota"],
    "Sub-Manager": ["inventory"],
    Staff:         [],
  };
