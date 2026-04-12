import { Route } from "react-router-dom";
import { ROUTES } from "../../utils/routes";

// Import Admin screens
import AttendanceList from "./attendance/AttendanceList";
import AuditLogList from "./inventory/AuditLogList";
import InventoryDetail from "./inventory/InventoryDetail";
import InventoryForm from "./inventory/InventoryForm";
import InventoryList from "./inventory/InventoryList";
import QueryDetail from "./inventory/QueryDetail";
import QueryList from "./inventory/QueryList";
import RotaDetail from "./rotas/RotaDetail";
import RotaForm from "./rotas/RotaForm";
import RotaList from "./rotas/RotaList";
import ShopDetail from "./shops/ShopDetail";
import ShopForm from "./shops/ShopForm";
import ShopList from "./shops/ShopList";
import UserDetail from "./users/UserDetail";
import UserForm from "./users/UserForm";
import UserList from "./users/UserList";

// Import Financials screens
import FinancialsList from "./financials/FinancialsList";
import FinancialsUpload from "./financials/FinancialsUpload";

// Import Analytics screens
import AnalyticsDashboard from "./dashboard/AnalyticsDashboard";

const AdminRoutes = (
  <>
    <Route path={ROUTES.ADMIN.DASHBOARD} element={<AnalyticsDashboard />} />

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

    {/* Financials */}
    <Route path={ROUTES.ADMIN.FINANCIALS.LIST} element={<FinancialsList />} />
    <Route
      path={ROUTES.ADMIN.FINANCIALS.UPLOAD}
      element={<FinancialsUpload />}
    />
  </>
);

export default AdminRoutes;
