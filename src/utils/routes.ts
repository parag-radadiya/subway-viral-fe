// Centralized route path definitions grouped by access level
export const ROUTES = {
  // Public routes
  LOGIN: "/login",
  FORCE_PASSWORD: "/change-password",

  // Role-based root paths
  ROOT: {
    DASHBOARD: "/root/dashboard",
  },
  ADMIN: {
    DASHBOARD: "/admin/dashboard",
    SHOPS: {
      LIST: "/admin/shops",
      CREATE: "/admin/shops/create",
      EDIT: (id: string) => `/admin/shops/${id}/edit`,
      DETAILS: (id: string) => `/admin/shops/${id}`,
    },
    USERS: {
      LIST: "/admin/users",
      CREATE: "/admin/users/create",
      EDIT: (id: string) => `/admin/users/${id}/edit`,
      DETAILS: (id: string) => `/admin/users/${id}`,
    },
    ROTAS: {
      LIST: "/admin/rotas",
      CREATE: "/admin/rotas/create",
      EDIT: (id: string) => `/admin/rotas/${id}/edit`,
      DETAILS: (id: string) => `/admin/rotas/${id}`,
      DASHBOARD: "/admin/rotas/dashboard",
    },
    ATTENDANCE: "/admin/attendance",
    INVENTORY: {
      LIST: "/admin/inventory",
      CREATE: "/admin/inventory/create",
      EDIT: (id: string) => `/admin/inventory/${id}/edit`,
      DETAILS: (id: string) => `/admin/inventory/${id}`,
      QUERIES: "/admin/inventory/queries",
      QUERY_DETAILS: (id: string) => `/admin/inventory/queries/${id}`,
      AUDIT_LOGS: "/admin/inventory/audit-logs",
    },
  },
  MANAGER: {
    DASHBOARD: "/manager/dashboard",
    ROTAS: {
      LIST: "/manager/rotas",
      CREATE: "/manager/rotas/create",
      EDIT: (id: string) => `/manager/rotas/${id}/edit`,
      DETAILS: (id: string) => `/manager/rotas/${id}`,
      PLANNER: "/manager/rotas/planner",
      DASHBOARD: "/manager/rotas/dashboard",
    },
    ATTENDANCE: "/manager/attendance",
    INVENTORY: {
      LIST: "/manager/inventory",
      CREATE: "/manager/inventory/create",
      EDIT: (id: string) => `/manager/inventory/${id}/edit`,
      DETAILS: (id: string) => `/manager/inventory/${id}`,
      QUERIES: "/manager/inventory/queries",
      QUERY_DETAILS: (id: string) => `/manager/inventory/queries/${id}`,
      AUDIT_LOGS: "/manager/inventory/audit-logs",
    },
  },
  SUB_MANAGER: {
    DASHBOARD: "/sub-manager/dashboard",
    ROTAS: {
      LIST: "/sub-manager/rotas",
      CREATE: "/sub-manager/rotas/create",
      EDIT: (id: string) => `/sub-manager/rotas/${id}/edit`,
      DETAILS: (id: string) => `/sub-manager/rotas/${id}`,
    },
    ATTENDANCE: "/sub-manager/attendance",
    INVENTORY: {
      LIST: "/sub-manager/inventory",
      CREATE: "/sub-manager/inventory/create",
      EDIT: (id: string) => `/sub-manager/inventory/${id}/edit`,
      DETAILS: (id: string) => `/sub-manager/inventory/${id}`,
      QUERIES: "/sub-manager/inventory/queries",
      QUERY_DETAILS: (id: string) => `/sub-manager/inventory/queries/${id}`,
      AUDIT_LOGS: "/sub-manager/inventory/audit-logs",
    },
  },
  STAFF: {
    DASHBOARD: "/staff/dashboard",
    ATTENDANCE: "/staff/attendance",
    MANAGE_ATTENDANCE: "/staff/manage-attendance",
    MY_ROTA: "/staff/my-rota",
  },
} as const;

export type RouteValue = (typeof ROUTES)[keyof typeof ROUTES];
