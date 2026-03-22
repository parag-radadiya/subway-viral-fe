import type { ReactNode } from "react";
import RoleLayout from "./RoleLayout";
import { LayoutDashboard, UserCheck, Calendar, Navigation } from "lucide-react";
import { ROUTES } from "../../utils/routes";

const StaffLayout = ({ children }: { children: ReactNode }) => {
  const navItems = [
    { label: "Dashboard", path: ROUTES.STAFF.DASHBOARD, icon: LayoutDashboard },
    {
      label: "Punch In/Out",
      path: ROUTES.STAFF.MANAGE_ATTENDANCE,
      icon: Navigation,
    },
    { label: "Attendance", path: ROUTES.STAFF.ATTENDANCE, icon: UserCheck },
    { label: "My Rota", path: ROUTES.STAFF.MY_ROTA, icon: Calendar },
  ];

  return (
    <RoleLayout roleTitle="Staff Member" navItems={navItems}>
      {children}
    </RoleLayout>
  );
};

export default StaffLayout;
