import { Route } from "react-router-dom";
import { ROUTES } from "../../utils/routes";
import { RootDashboard } from "../DummyDashboards";
import Configuration from "./Configuration";

const RootRoutes = (
  <>
    <Route path={ROUTES.ROOT.DASHBOARD} element={<RootDashboard />} />
    <Route path={ROUTES.ROOT.CONFIGURATION} element={<Configuration />} />
  </>
);

export default RootRoutes;
