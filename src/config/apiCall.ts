import api from "./api";
import type {
  LoginCredentials,
  ApiResponse,
  InventoryItem,
  InventoryQuery,
  InventoryAuditLog,
} from "../utils/types";

// ─── Auth API ─────────────────────────────────────────────────────────────────

export const authApi = {
  login: (credentials: LoginCredentials) =>
    api.post("/auth/login", credentials),

  refreshToken: (data: { refresh_token: string }) =>
    api.post("/auth/refresh-token", data),

  logout: (data: { refresh_token: string }) => api.post("/auth/logout", data),

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
  // ─── Items ─────────────────────────────────────────────────────────────────
  
  getItems: async (params?: {
    shop_id?: string;
    status?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: string;
  }) => {
    const response = await api.get<ApiResponse<{ items: InventoryItem[]; total: number }>>(
      "/inventory/items",
      { params }
    );
    return response.data.data;
  },

  getItemById: async (id: string) => {
    const response = await api.get<ApiResponse<{ item: InventoryItem }>>(
      `/inventory/items/${id}`
    );
    return response.data.data.item;
  },

  createItem: async (data: Partial<InventoryItem>) => {
    const response = await api.post<ApiResponse<{ item: InventoryItem }>>(
      "/inventory/items",
      data
    );
    return response.data.data.item;
  },

  updateItem: async (id: string, data: Partial<InventoryItem>) => {
    const response = await api.put<ApiResponse<{ item: InventoryItem }>>(
      `/inventory/items/${id}`,
      data
    );
    return response.data.data.item;
  },

  deleteItem: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(`/inventory/items/${id}`);
    return response.data;
  },

  // ─── Queries ───────────────────────────────────────────────────────────────

  getQueries: async (params?: {
    shop_id?: string;
    item_id?: string;
    status?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: string;
  }) => {
    const response = await api.get<ApiResponse<{ queries: InventoryQuery[]; total: number }>>(
      "/inventory/queries",
      { params }
    );
    return response.data.data;
  },

  getQueryById: async (id: string) => {
    const response = await api.get<ApiResponse<{ query: InventoryQuery }>>(
      `/inventory/queries/${id}`
    );
    return response.data.data.query;
  },

  openQuery: async (data: { item_id: string; issue_note: string }) => {
    const response = await api.post<ApiResponse<{ query: InventoryQuery }>>(
      "/inventory/queries",
      data
    );
    return response.data.data.query;
  },

  closeQuery: async (
    id: string,
    data: { repair_cost: number; resolve_note: string }
  ) => {
    const response = await api.put<ApiResponse<{ query: InventoryQuery }>>(
      `/inventory/queries/${id}/close`,
      data
    );
    return response.data.data.query;
  },

  // ─── Audit Logs ────────────────────────────────────────────────────────────

  getAuditLogs: async (params?: {
    shop_id?: string;
    item_id?: string;
    query_id?: string;
    action?: string;
    page?: number;
    limit?: number;
    sort_by?: string;
    sort_order?: string;
  }) => {
    const response = await api.get<ApiResponse<{ logs: InventoryAuditLog[]; total: number }>>(
      "/inventory/audit-logs",
      { params }
    );
    return response.data.data;
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
