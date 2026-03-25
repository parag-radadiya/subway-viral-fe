import { Route } from "react-router-dom";
import { ROUTES } from "../../utils/routes";
import { RootDashboard } from "../DummyDashboards";

const RootRoutes = (
  <>
    <Route path={ROUTES.ROOT.DASHBOARD} element={<RootDashboard />} />
  </>
);

export default RootRoutes;
