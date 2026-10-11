import { Route } from "react-router-dom";
import { ROUTES } from "../../utils/routes";
import { ManagerDashboard } from "../DummyDashboards";

// Import Manager screens
import UserList from "./users/UserList";
import UserForm from "./users/UserForm";
import UserDetail from "./users/UserDetail";

import ManagerRotaList from "./rotas/RotaList";
import ManagerRotaDetail from "./rotas/RotaDetail";
import ManagerRotaForm from "./rotas/RotaForm";
import RotaDashboard from "./rotas/RotaDashboard";
import ManagerAttendanceList from "./attendance/AttendanceList";
import ManagerPunchInPage from "./attendance/PunchInPage";
import InventoryList from "./inventory/InventoryList";
import InventoryForm from "./inventory/InventoryForm";
import InventoryDetail from "./inventory/InventoryDetail";
import QueryList from "./inventory/QueryList";
import QueryDetail from "./inventory/QueryDetail";
import AuditLogList from "./inventory/AuditLogList";

const ManagerRoutes = (
  <>
    <Route path={ROUTES.MANAGER.DASHBOARD} element={<ManagerDashboard />} />

    {/* Users */}
    <Route path={ROUTES.MANAGER.USERS.LIST} element={<UserList />} />
    <Route path={ROUTES.MANAGER.USERS.CREATE} element={<UserForm />} />
    <Route path={ROUTES.MANAGER.USERS.EDIT(":id")} element={<UserForm />} />
    <Route path={ROUTES.MANAGER.USERS.DETAILS(":id")} element={<UserDetail />} />

    {/* Rotas */}
    <Route path={ROUTES.MANAGER.ROTAS.LIST} element={<ManagerRotaList />} />
    <Route path={ROUTES.MANAGER.ROTAS.CREATE} element={<ManagerRotaForm />} />
    <Route
      path={ROUTES.MANAGER.ROTAS.EDIT(":id")}
      element={<ManagerRotaForm />}
    />
    <Route
      path={ROUTES.MANAGER.ROTAS.DETAILS(":id")}
      element={<ManagerRotaDetail />}
    />
    <Route path={ROUTES.MANAGER.ROTAS.DASHBOARD} element={<RotaDashboard />} />

    {/* Attendance */}
    <Route
      path={ROUTES.MANAGER.ATTENDANCE}
      element={<ManagerAttendanceList />}
    />
    <Route
      path={ROUTES.MANAGER.PUNCH_IN_OUT}
      element={<ManagerPunchInPage />}
    />

    {/* Inventory */}
    <Route path={ROUTES.MANAGER.INVENTORY.LIST} element={<InventoryList />} />
    <Route path={ROUTES.MANAGER.INVENTORY.CREATE} element={<InventoryForm />} />
    <Route
      path={ROUTES.MANAGER.INVENTORY.EDIT(":id")}
      element={<InventoryForm />}
    />
    <Route
      path={ROUTES.MANAGER.INVENTORY.DETAILS(":id")}
      element={<InventoryDetail />}
    />
    <Route path={ROUTES.MANAGER.INVENTORY.QUERIES} element={<QueryList />} />
    <Route
      path={ROUTES.MANAGER.INVENTORY.QUERY_DETAILS(":id")}
      element={<QueryDetail />}
    />
    <Route
      path={ROUTES.MANAGER.INVENTORY.AUDIT_LOGS}
      element={<AuditLogList />}
    />
  </>
);

export default ManagerRoutes;
