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
  name: string;
  permissions: Permissions;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  role_id: Role;
  assigned_shop_ids: string[];
  must_change_password: boolean;
  avatar?: string;
}

export interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
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

export type StatCardVariant = "default" | "success" | "warning" | "danger" | "info";

export interface StatCardData {
  title: string;
  value: string | number;
  change?: string;
  changeType?: "up" | "down" | "neutral";
  variant?: StatCardVariant;
  icon?: React.ElementType;
}

export interface NavItem {
  label: string;
  path: string;
  icon: React.ElementType;
  permission?: keyof Permissions;
}

// ─── Common ──────────────────────────────────────────────────────────────────

export type SidebarState = "expanded" | "collapsed";
