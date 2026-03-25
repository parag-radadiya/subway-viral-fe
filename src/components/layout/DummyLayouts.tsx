import type { ReactNode } from "react";
import RoleLayout from "./RoleLayout";
import {
  LayoutDashboard,
  Calendar,
  BarChart3,
  UserCheck,
  Package,
  Navigation,
} from "lucide-react";
import { ROUTES } from "../../utils/routes";

export const RootLayout = ({ children }: { children: ReactNode }) => (
  <RoleLayout
    roleTitle="Super Root"
    navItems={[
      {
        label: "Dashboard",
        path: ROUTES.ROOT.DASHBOARD,
        icon: LayoutDashboard,
      },
      { label: "Rotas", path: ROUTES.ADMIN.ROTAS.LIST, icon: Calendar },
    ]}
  >
    {children}
  </RoleLayout>
);

export const ManagerLayout = ({ children }: { children: ReactNode }) => (
  <RoleLayout
    roleTitle="Manager"
    navItems={[
      {
        label: "Dashboard",
        path: ROUTES.MANAGER.DASHBOARD,
        icon: LayoutDashboard,
      },
      {
        label: "Punch In/Out",
        path: ROUTES.MANAGER.PUNCH_IN_OUT,
        icon: Navigation,
      },
      {
        label: "Attendance",
        path: ROUTES.MANAGER.ATTENDANCE,
        icon: UserCheck,
      },

      {
        label: "Inventory",
        path: ROUTES.MANAGER.INVENTORY.LIST,
        icon: Package,
      },
      {
        label: "Rota Stats",
        path: ROUTES.MANAGER.ROTAS.DASHBOARD,
        icon: BarChart3,
      },

      {
        label: "Rotas",
        path: ROUTES.MANAGER.ROTAS.LIST,
        icon: Calendar,
      },
    ]}
  >
    {children}
  </RoleLayout>
);

export const SubManagerLayout = ({ children }: { children: ReactNode }) => (
  <RoleLayout
    roleTitle="Sub-Manager"
    navItems={[
      {
        label: "Dashboard",
        path: ROUTES.SUB_MANAGER.DASHBOARD,
        icon: LayoutDashboard,
      },
      {
        label: "Punch In/Out",
        path: ROUTES.SUB_MANAGER.PUNCH_IN_OUT,
        icon: Navigation,
      },
      {
        label: "Attendance",
        path: ROUTES.SUB_MANAGER.ATTENDANCE,
        icon: UserCheck,
      },
      {
        label: "Inventory",
        path: ROUTES.SUB_MANAGER.INVENTORY.LIST,
        icon: Package,
      },
      {
        label: "Rotas",
        path: ROUTES.SUB_MANAGER.ROTAS.LIST,
        icon: Calendar,
      },
    ]}
  >
    {children}
  </RoleLayout>
);
