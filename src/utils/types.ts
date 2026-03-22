// Shared TypeScript interfaces and types for the entire application
// Following the pattern: shared types here, local types colocated with component

// ─── Auth ────────────────────────────────────────────────────────────────────

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface Permissions {
  can_manage_rotas: boolean;
  can_manage_inventory: boolean;
  can_manual_punch: boolean;
  can_create_users: boolean;
  can_manage_shops: boolean;
  can_manage_roles: boolean;
  can_view_all_staff: boolean;
}

export interface Role {
  _id: string;
  name: UserRole | string;
  permissions: Permissions;
}

export enum UserRole {
  ADMIN = "Admin",
  MANAGER = "Manager",
  SUB_MANAGER = "Sub-Manager",
  STAFF = "Staff",
  ROOT = "Root",
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  shop_id: string;
}

export interface Role {
  _id: string;
  role_name: string;
  permissions: Permissions;
  __v: number;
  createdAt: string;
  updatedAt: string;
}

export interface Permissions {
  can_create_users: boolean;
  can_view_all_staff: boolean;
  can_manage_rotas: boolean;
  can_manual_punch: boolean;
  can_manage_inventory: boolean;
  can_manage_shops: boolean;
  can_manage_roles: boolean;
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export enum InventoryStatus {
  GOOD = "Good",
  DAMAGED = "Damaged",
  IN_REPAIR = "In Repair",
}

export enum QueryStatus {
  OPEN = "Open",
  CLOSED = "Closed",
}

export interface InventoryItem {
  _id: string;
  shop_id: { _id: string; name: string };
  item_name: string;
  purchase_date: string;
  expiry_date: string | null;
  status: InventoryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryQuery {
  _id: string;
  item_id: string | InventoryItem;
  shop_id: { _id: string; name: string };
  opened_by: string | User;
  closed_by: string | User | null;
  issue_note: string;
  resolve_note: string | null;
  repair_cost: number | null;
  status: QueryStatus;
  resolved_at: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryAuditLog {
  _id: string;
  shop_id: string;
  item_id: string | InventoryItem;
  query_id: string | InventoryQuery | null;
  action:
    | "ITEM_CREATED"
    | "ITEM_UPDATED"
    | "ITEM_DELETED"
    | "QUERY_OPENED"
    | "QUERY_CLOSED";
  performed_by: string | User;
  details: any;
  createdAt: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// ─── Rotas ───────────────────────────────────────────────────────────────────

export interface Rota {
  _id: string;
  user_id: string | User;
  shop_id: string | { _id: string; name: string };
  shift_date: string;
  start_time: string;
  end_time?: string;
  is_published?: boolean;
}

// ─── API ─────────────────────────────────────────────────────────────────────

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface LoginResponse {
  token: string;
  must_change_password: boolean;
  user: User;
}

// ─── UI ──────────────────────────────────────────────────────────────────────

// (Unused UI types removed)

// ─── Common ──────────────────────────────────────────────────────────────────

export type SidebarState = "expanded" | "collapsed";

export type StatCardVariant =
  | "default"
  | "success"
  | "warning"
  | "danger"
  | "info";
