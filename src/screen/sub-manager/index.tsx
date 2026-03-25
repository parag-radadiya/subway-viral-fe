import { Route } from "react-router-dom";
import { ROUTES } from "../../utils/routes";
import { SubManagerDashboard } from "../DummyDashboards";

// Import Sub-Manager screens
import SubManagerRotaList from "./rotas/RotaList";
import SubManagerRotaDetail from "./rotas/RotaDetail";
import SubManagerRotaForm from "./rotas/RotaForm";
import SubManagerAttendanceList from "./attendance/AttendanceList";
import SubManagerPunchInPage from "./attendance/PunchInPage";
import InventoryList from "../admin/inventory/InventoryList";
import InventoryForm from "../admin/inventory/InventoryForm";
import InventoryDetail from "../admin/inventory/InventoryDetail";
import QueryList from "../admin/inventory/QueryList";
import QueryDetail from "../admin/inventory/QueryDetail";
import AuditLogList from "../admin/inventory/AuditLogList";

const SubManagerRoutes = (
  <>
    <Route path={ROUTES.SUB_MANAGER.DASHBOARD} element={<SubManagerDashboard />} />
    
    {/* Rotas */}
    <Route path={ROUTES.SUB_MANAGER.ROTAS.LIST} element={<SubManagerRotaList />} />
    <Route path={ROUTES.SUB_MANAGER.ROTAS.CREATE} element={<SubManagerRotaForm />} />
    <Route path={ROUTES.SUB_MANAGER.ROTAS.EDIT(":id")} element={<SubManagerRotaForm />} />
    <Route path={ROUTES.SUB_MANAGER.ROTAS.DETAILS(":id")} element={<SubManagerRotaDetail />} />

    {/* Attendance */}
    <Route path={ROUTES.SUB_MANAGER.ATTENDANCE} element={<SubManagerAttendanceList />} />
    <Route path={ROUTES.SUB_MANAGER.PUNCH_IN_OUT} element={<SubManagerPunchInPage />} />

    {/* Inventory */}
    <Route path={ROUTES.SUB_MANAGER.INVENTORY.LIST} element={<InventoryList />} />
    <Route path={ROUTES.SUB_MANAGER.INVENTORY.CREATE} element={<InventoryForm />} />
    <Route path={ROUTES.SUB_MANAGER.INVENTORY.EDIT(":id")} element={<InventoryForm />} />
    <Route path={ROUTES.SUB_MANAGER.INVENTORY.DETAILS(":id")} element={<InventoryDetail />} />
    <Route path={ROUTES.SUB_MANAGER.INVENTORY.QUERIES} element={<QueryList />} />
    <Route path={ROUTES.SUB_MANAGER.INVENTORY.QUERY_DETAILS(":id")} element={<QueryDetail />} />
    <Route path={ROUTES.SUB_MANAGER.INVENTORY.AUDIT_LOGS} element={<AuditLogList />} />
  </>
);

export default SubManagerRoutes;
