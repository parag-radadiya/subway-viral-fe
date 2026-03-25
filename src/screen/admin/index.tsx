import { Route } from "react-router-dom";
import { ROUTES } from "../../utils/routes";
import { AdminDashboard } from "../DummyDashboards";

// Import Admin screens
import ShopList from "./shops/ShopList";
import ShopDetail from "./shops/ShopDetail";
import ShopForm from "./shops/ShopForm";
import UserList from "./users/UserList";
import UserDetail from "./users/UserDetail";
import UserForm from "./users/UserForm";
import RotaList from "./rotas/RotaList";
import RotaDetail from "./rotas/RotaDetail";
import RotaForm from "./rotas/RotaForm";
import AttendanceList from "./attendance/AttendanceList";
import InventoryList from "./inventory/InventoryList";
import InventoryForm from "./inventory/InventoryForm";
import InventoryDetail from "./inventory/InventoryDetail";
import QueryList from "./inventory/QueryList";
import QueryDetail from "./inventory/QueryDetail";
import AuditLogList from "./inventory/AuditLogList";

const AdminRoutes = (
  <>
    <Route path={ROUTES.ADMIN.DASHBOARD} element={<AdminDashboard />} />

    {/* Shops */}
    <Route path={ROUTES.ADMIN.SHOPS.LIST} element={<ShopList />} />
    <Route path={ROUTES.ADMIN.SHOPS.CREATE} element={<ShopForm />} />
    <Route path={ROUTES.ADMIN.SHOPS.EDIT(":id")} element={<ShopForm />} />
    <Route path={ROUTES.ADMIN.SHOPS.DETAILS(":id")} element={<ShopDetail />} />

    {/* Users */}
    <Route path={ROUTES.ADMIN.USERS.LIST} element={<UserList />} />
    <Route path={ROUTES.ADMIN.USERS.CREATE} element={<UserForm />} />
    <Route path={ROUTES.ADMIN.USERS.EDIT(":id")} element={<UserForm />} />
    <Route path={ROUTES.ADMIN.USERS.DETAILS(":id")} element={<UserDetail />} />

    {/* Rotas */}
    <Route path={ROUTES.ADMIN.ROTAS.LIST} element={<RotaList />} />
    <Route path={ROUTES.ADMIN.ROTAS.CREATE} element={<RotaForm />} />
    <Route path={ROUTES.ADMIN.ROTAS.EDIT(":id")} element={<RotaForm />} />
    <Route path={ROUTES.ADMIN.ROTAS.DETAILS(":id")} element={<RotaDetail />} />

    {/* Attendance */}
    <Route path={ROUTES.ADMIN.ATTENDANCE} element={<AttendanceList />} />

    {/* Inventory */}
    <Route path={ROUTES.ADMIN.INVENTORY.LIST} element={<InventoryList />} />
    <Route path={ROUTES.ADMIN.INVENTORY.CREATE} element={<InventoryForm />} />
    <Route
      path={ROUTES.ADMIN.INVENTORY.EDIT(":id")}
      element={<InventoryForm />}
    />
    <Route
      path={ROUTES.ADMIN.INVENTORY.DETAILS(":id")}
      element={<InventoryDetail />}
    />
    <Route path={ROUTES.ADMIN.INVENTORY.QUERIES} element={<QueryList />} />
    <Route
      path={ROUTES.ADMIN.INVENTORY.QUERY_DETAILS(":id")}
      element={<QueryDetail />}
    />
    <Route
      path={ROUTES.ADMIN.INVENTORY.AUDIT_LOGS}
      element={<AuditLogList />}
    />
  </>
);

export default AdminRoutes;
