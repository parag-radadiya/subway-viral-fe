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
  },
  STAFF: {
    DASHBOARD: "/staff/dashboard",
    ATTENDANCE: "/staff/attendance",
    MANAGE_ATTENDANCE: "/staff/manage-attendance",
    MY_ROTA: "/staff/my-rota",
  },
} as const;

export type RouteValue = (typeof ROUTES)[keyof typeof ROUTES];
