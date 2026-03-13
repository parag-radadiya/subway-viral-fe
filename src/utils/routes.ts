// Centralized route path definitions grouped by access level
export const ROUTES = {
  // Public routes
  LOGIN: "/login",
  FORCE_PASSWORD: "/change-password",

  // Authenticated routes
  DASHBOARD: "/dashboard",
  INVENTORY: "/inventory",
  SALES: "/sales",
  REPORTS: "/reports",
  SETTINGS: "/settings",

  // Admin-only routes (visibility controlled by permissions)
  USERS: "/users",
  ROLES: "/roles",
  SHOPS: "/shops",
} as const;

export type RouteValue = (typeof ROUTES)[keyof typeof ROUTES];
