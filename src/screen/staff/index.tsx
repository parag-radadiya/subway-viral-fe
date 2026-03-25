import { Route } from "react-router-dom";
import { ROUTES } from "../../utils/routes";
import { StaffDashboard } from "../DummyDashboards";

// Import Staff screens
import PunchInOut from "./attendance/PunchInOut";
import MyAttendance from "./attendance/MyAttendance";
import MyRota from "./rotas/MyRota";

const StaffRoutes = (
  <>
    <Route path={ROUTES.STAFF.DASHBOARD} element={<StaffDashboard />} />
    <Route path={ROUTES.STAFF.MANAGE_ATTENDANCE} element={<PunchInOut />} />
    <Route path={ROUTES.STAFF.ATTENDANCE} element={<MyAttendance />} />
    <Route path={ROUTES.STAFF.MY_ROTA} element={<MyRota />} />
  </>
);

export default StaffRoutes;
