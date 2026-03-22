import type { ReactNode } from "react";
import RoleLayout from "./RoleLayout";
import { LayoutDashboard, Calendar, BarChart3, UserCheck } from "lucide-react";
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
        label: "Rota Stats",
        path: ROUTES.MANAGER.ROTAS.DASHBOARD,
        icon: BarChart3,
      },
      {
        label: "Rota Planner",
        path: ROUTES.MANAGER.ROTAS.PLANNER,
        icon: Calendar,
      },
      {
        label: "Attendance",
        path: ROUTES.MANAGER.ATTENDANCE,
        icon: UserCheck,
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
        label: "Rotas",
        path: ROUTES.SUB_MANAGER.ROTAS.LIST,
        icon: Calendar,
      },
      {
        label: "Attendance",
        path: ROUTES.SUB_MANAGER.ATTENDANCE,
        icon: UserCheck,
      },
    ]}
  >
    {children}
  </RoleLayout>
);
