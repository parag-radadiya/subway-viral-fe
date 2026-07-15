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

  getUser: () => api.get(`/auth/me`),

  getById: (id: string) => api.get(`/users/${id}`),

  create: (data: Record<string, unknown>) => api.post("/users", data),

  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/users/${id}`, data),

  deactivate: (id: string) => api.delete(`/users/${id}`),

  assignedShopsStaffSummary: () =>
    api.get("/users/assigned-shops/staff-summary"),

  getStaffByShop: (shop_id: string, params?: Record<string, string>) => {
    const q = params ? `?${new URLSearchParams(params).toString()}` : "";
    return api.get(`/users/by-shop/${shop_id}/staff${q}`);
  },
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
    const response = await api.get<
      ApiResponse<{ items: InventoryItem[]; total: number }>
    >("/inventory/items", { params });
    return response.data.data;
  },

  getItemById: async (id: string) => {
    const response = await api.get<ApiResponse<{ item: InventoryItem }>>(
      `/inventory/items/${id}`,
    );
    return response.data.data.item;
  },

  createItem: async (data: Partial<InventoryItem>) => {
    const response = await api.post<ApiResponse<{ item: InventoryItem }>>(
      "/inventory/items",
      data,
    );
    return response.data.data.item;
  },

  updateItem: async (id: string, data: Partial<InventoryItem>) => {
    const response = await api.put<ApiResponse<{ item: InventoryItem }>>(
      `/inventory/items/${id}`,
      data,
    );
    return response.data.data.item;
  },

  deleteItem: async (id: string) => {
    const response = await api.delete<ApiResponse<null>>(
      `/inventory/items/${id}`,
    );
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
    const response = await api.get<
      ApiResponse<{ queries: InventoryQuery[]; total: number }>
    >("/inventory/queries", { params });
    return response.data.data;
  },

  getQueryById: async (id: string) => {
    const response = await api.get<ApiResponse<{ query: InventoryQuery }>>(
      `/inventory/queries/${id}`,
    );
    return response.data.data.query;
  },

  openQuery: async (data: { item_id: string; issue_note: string }) => {
    const response = await api.post<ApiResponse<{ query: InventoryQuery }>>(
      "/inventory/queries",
      data,
    );
    return response.data.data.query;
  },

  closeQuery: async (
    id: string,
    data: { repair_cost: number; resolve_note: string },
  ) => {
    const response = await api.put<ApiResponse<{ query: InventoryQuery }>>(
      `/inventory/queries/${id}/close`,
      data,
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
    const response = await api.get<
      ApiResponse<{ logs: InventoryAuditLog[]; total: number }>
    >("/inventory/audit-logs", { params });
    return response.data.data;
  },
};

// ─── Attendance API ───────────────────────────────────────────────────────────

export const attendanceApi = {
  list: (query?: Record<string, string>) =>
    api.get(`/attendance?${new URLSearchParams(query)}`),
  getUsersSummary: (query?: Record<string, string>) =>
    api.get(`/attendance/summary-by-user?${new URLSearchParams(query)}`),

  /** GET /attendance/staff-shifts — PR #14 */
  getStaffShifts: (params: {
    shop_id: string;
    from_date: string;
    to_date: string;
    user_id?: string;
    page?: number;
    limit?: number;
    sort_by?: "total_work_hours" | "name";
    sort_dir?: "asc" | "desc";
    shift_order?: "asc" | "desc";
  }) => api.get("/attendance/staff-shifts", { params }),

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

  bulkAdjustHours: (data: {
    shop_id: string;
    from_date: string;
    to_date: string;
    adjustments: { user_id: string; target_hours: number }[];
  }) => api.post("/attendance/adjust-hours/bulk-by-shop", data),

  getUnchangedUsers: (params: {
    shop_id: string;
    from_date: string;
    to_date: string;
  }) =>
    api.get(
      `/attendance/adjust-hours/unchanged-users?${new URLSearchParams(params).toString()}`,
    ),

  adjustHoursPreview: (data: {
    user_id: string;
    shop_id?: string;
    from_date: string;
    to_date: string;
    target_hours: number;
  }) => api.post("/attendance/adjust-hours/preview", data),

  adjustHoursApply: (data: {
    user_id: string;
    shop_id?: string;
    from_date: string;
    to_date: string;
    target_hours: number;
    note?: string;
  }) => api.post("/attendance/adjust-hours/apply", data),

  /** POST /attendance/:id/break-start — start a lunch/other break */
  breakStart: (id: string, break_type: "Lunch" | "Other" = "Lunch") =>
    api.post(`/attendance/${id}/break-start`, { break_type }),

  /** PUT /attendance/:id/break-end — end the currently open break */
  breakEnd: (id: string) => api.put(`/attendance/${id}/break-end`, {}),

  /** GET /attendance/weekly-payroll-report */
  weeklyPayrollReport: (params: {
    shop_id?: string;
    format?: string;
    week_start: string; // YYYY-MM-DD
    from_date?: string; // YYYY-MM-DD
    to_date?: string; // YYYY-MM-DD
  }) => api.get("/attendance/weekly-payroll-report", { params }),
};

// ─── Rotas API ────────────────────────────────────────────────────────────────

export const rotasApi = {
  list: (query?: Record<string, string>) => {
    const q =
      query && Object.keys(query).length > 0
        ? new URLSearchParams(query).toString()
        : "week_start=2026-03-16";
    return api.get(`/rotas?${q}`);
  },
  week: (query: Record<string, string>) =>
    api.get(`/rotas/week?${new URLSearchParams(query).toString()}`),
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
  list: (query?: Record<string, string>) =>
    api.get(`/shops?${new URLSearchParams(query).toString()}`),
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

// ─── Financials API ───────────────────────────────────────────────────────────

export const financialsApi = {
  submitWeeklyReport: (data: Record<string, unknown>) =>
    api.post("/store-reports/admin-weekly", data),

  submitWeekly: (data: Record<string, unknown>) =>
    api.post("/store-reports/weekly", data),

  submitMonthlySale: (data: Record<string, unknown>) =>
    api.post("/store-reports/monthly-sale", data),

  getMonthlySale: (query?: string) =>
    api.get(`/store-reports/monthly-sale?${query || ""}`),

  getWeekly: (query?: string) =>
    api.get(`/store-reports/weekly?${query || ""}`),

  list: (query?: string) => api.get(`/store-reports/table?${query || ""}`),
  getById: (id: string) => api.get(`/financials/${id}`),
};

// ─── Analytics v2 API ─────────────────────────────────────────────────────────

export interface AnalyticsBaseParams {
  from_date?: string;
  to_date?: string;
  shop_ids?: string;
  report_type?: "weekly_financial" | "monthly_store_kpi";
  view?: "reconciled" | "excel_raw" | "admin_weekly";
}

export const analyticsApi = {
  /** Endpoint 1 — KPI Matrix */
  kpiMatrix: (
    params: AnalyticsBaseParams & {
      compare_from?: string;
      compare_to?: string;
    },
  ) => api.get("/store-reports/analytics/v2/kpi-matrix", { params }),

  /** Endpoint 2 — Shop Compare */
  shopCompare: (params: AnalyticsBaseParams & { metrics?: string }) =>
    api.get("/store-reports/analytics/v2/shop-compare", { params }),

  /** Endpoint 3 — Period Compare */
  periodCompare: (params: {
    current_from: string;
    current_to: string;
    compare_from: string;
    compare_to: string;
    shop_ids?: string;
    metrics?: string;
    report_type?: string;
    view?: string;
  }) => api.get("/store-reports/analytics/v2/period-compare", { params }),

  /** Endpoint 4 — Trend */
  trend: (
    params: AnalyticsBaseParams & {
      metrics?: string;
      granularity?: "week" | "month";
      group_by?: "total" | "shop";
    },
  ) => api.get("/store-reports/analytics/v2/trend", { params }),
};

// ─── Notifications API ────────────────────────────────────────────────────────

export const notificationsApi = {
  /** GET /notifications — paginated list with optional filters */
  list: (params?: {
    category?: string;
    severity?: string;
    read?: boolean;
    shop_id?: string;
    page?: number;
    limit?: number;
  }) => api.get("/notifications", { params }),

  /** GET /notifications/unread-count — total + per-category counts */
  unreadCount: () => api.get("/notifications/unread-count"),

  /** GET /notifications/summary — unread count + 3 recent per category */
  summary: () => api.get("/notifications/summary"),

  /** GET /notifications/categories — enum constants */
  categories: () => api.get("/notifications/categories"),

  /** PATCH /notifications/:id/read — mark single notification read */
  markRead: (id: string) => api.patch(`/notifications/${id}/read`),

  /** POST /notifications/mark-all-read — mark all (or by category) read */
  markAllRead: (category?: string) =>
    api.post("/notifications/mark-all-read", category ? { category } : {}),

  /** DELETE /notifications/:id — soft-delete / archive */
  archive: (id: string) => api.delete(`/notifications/${id}`),
};
