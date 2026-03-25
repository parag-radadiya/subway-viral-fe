import api from "./api";
import type { LoginCredentials } from "../utils/types";

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post("/auth/login", credentials),

  getMe: () => api.get("/users/me"),

  changePassword: (data: {
    currentPassword: string;
    newPassword: string;
    device_id: string;
  }) => api.put("/users/me/password", data),
};

// ─── Users API ────────────────────────────────────────────────────────────────

export const usersApi = {
  list: (query?: Record<string, string>) =>
    api.get(`/users?${new URLSearchParams(query)}`),

  getById: (id: string) => api.get(`/users/${id}`),

  create: (data: Record<string, unknown>) => api.post("/users", data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/users/${id}`, data),

  deactivate: (id: string) => api.delete(`/users/${id}`),

  assignedShopsStaffSummary: () =>
    api.get("/users/assigned-shops/staff-summary"),
};

// ─── Inventory API ────────────────────────────────────────────────────────────

export const inventoryApi = {
  items: {
    list: (query?: Record<string, string>) =>
      api.get(`/inventory/items?${new URLSearchParams(query)}`),
    getById: (id: string) => api.get(`/inventory/items/${id}`),
    create: (data: Record<string, unknown>) =>
      api.post("/inventory/items", data),
    update: (id: string, data: Record<string, unknown>) =>
      api.put(`/inventory/items/${id}`, data),
    remove: (id: string) => api.delete(`/inventory/items/${id}`),
  },
  queries: {
    list: () => api.get("/inventory/queries"),
    getById: (id: string) => api.get(`/inventory/queries/${id}`),
    create: (data: Record<string, unknown>) =>
      api.post("/inventory/queries", data),
    close: (id: string) => api.put(`/inventory/queries/${id}/close`, {}),
  },
};

// ─── Attendance API ───────────────────────────────────────────────────────────

export const attendanceApi = {
  list: (query?: Record<string, string>) =>
    api.get(`/attendance?${new URLSearchParams(query)}`),

  verifyLocation: (data: {
    shop_id: string;
    latitude: number;
    longitude: number;
  }) => api.post("/attendance/verify-location", data),

  punchIn: (data: {
    shop_id: string;
    location_token: string;
    biometric_verified: boolean;
    rota_id?: string;
  }) => api.post("/attendance/punch-in", data),

  punchOut: (id: string) => api.put(`/attendance/${id}/punch-out`, {}),

  manualPunchIn: (data: Record<string, unknown>) =>
    api.post("/attendance/manual-punch-in", data),

  eligibleRotas: (shop_id: string, user_id?: string) => {
    const params = new URLSearchParams({ shop_id });
    if (user_id) params.append("user_id", user_id);
    return api.get(`/attendance/eligible-rotas?${params.toString()}`);
  },
};

// ─── Rotas API ────────────────────────────────────────────────────────────────

export const rotasApi = {
  list: (query?: Record<string, string>) => {
    const q = query && Object.keys(query).length > 0 
      ? new URLSearchParams(query).toString() 
      : "week_start=2026-03-16";
    return api.get(`/rotas?${q}`);
  },
  week: (query: Record<string, string>) => api.get(`/rotas/week?${new URLSearchParams(query).toString()}`),
  dashboard: () => api.get("/rotas/dashboard?week_start=2026-03-16"),
  getById: (id: string) => api.get(`/rotas/${id}`),
  create: (data: Record<string, unknown>) => api.post("/rotas", data),
  bulkCreate: (data: Record<string, unknown>) => api.post("/rotas/bulk", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/rotas/${id}`, data),
  remove: (id: string) => api.delete(`/rotas/${id}`),
};

// ─── Shops API ────────────────────────────────────────────────────────────────

export const shopsApi = {
  list: () => api.get("/shops"),
  getById: (id: string) => api.get(`/shops/${id}`),
  create: (data: Record<string, unknown>) => api.post("/shops", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/shops/${id}`, data),
  remove: (id: string) => api.delete(`/shops/${id}`),
};

// ─── Roles API ────────────────────────────────────────────────────────────────

export const rolesApi = {
  list: () => api.get("/roles"),
  getById: (id: string) => api.get(`/roles/${id}`),
  create: (data: Record<string, unknown>) => api.post("/roles", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/roles/${id}`, data),
  remove: (id: string) => api.delete(`/roles/${id}`),
};
