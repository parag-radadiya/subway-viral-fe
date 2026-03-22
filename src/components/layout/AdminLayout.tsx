import type { ReactNode } from "react";
import RoleLayout from "./RoleLayout";
import {
  LayoutDashboard,
  Store,
  Users,
  Calendar,
  Clock,
  Package,
} from "lucide-react";
import { ROUTES } from "../../utils/routes";

const AdminLayout = ({ children }: { children: ReactNode }) => {
  const navItems = [
    { label: "Dashboard", path: ROUTES.ADMIN.DASHBOARD, icon: LayoutDashboard },
    { label: "Shops", path: ROUTES.ADMIN.SHOPS.LIST, icon: Store },
    { label: "Users", path: ROUTES.ADMIN.USERS.LIST, icon: Users },
    { label: "Rotas", path: ROUTES.ADMIN.ROTAS.LIST, icon: Calendar },
    { label: "Attendance", path: ROUTES.ADMIN.ATTENDANCE, icon: Clock },
    { label: "Inventory", path: ROUTES.ADMIN.INVENTORY.LIST, icon: Package },
  ];

  return (
    <RoleLayout roleTitle="Administrator" navItems={navItems}>
      {children}
    </RoleLayout>
  );
};

export default AdminLayout;
