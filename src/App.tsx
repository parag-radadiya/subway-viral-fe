import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store, useAppSelector } from "./store";
import { ROUTES } from "./utils/routes";
import { UserRole } from "./utils/types";
import { ProtectedRoute, PublicRoute } from "./components/common/RouteGuards";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Layouts
import AdminLayout from "./components/layout/AdminLayout";
import StaffLayout from "./components/layout/StaffLayout";
import {
  RootLayout,
  ManagerLayout,
  SubManagerLayout,
} from "./components/layout/DummyLayouts";

import ShopList from "./screen/admin/shops/ShopList";
import ShopDetail from "./screen/admin/shops/ShopDetail";
import ShopForm from "./screen/admin/shops/ShopForm";
import UserList from "./screen/admin/users/UserList";
import UserDetail from "./screen/admin/users/UserDetail";
import UserForm from "./screen/admin/users/UserForm";
import PunchInOut from "./screen/staff/attendance/PunchInOut";

// Rota Screens
import RotaManagement from "./screen/admin/rotas/RotaManagement";
import WeeklyPlanner from "./screen/manager/rotas/WeeklyPlanner";
import RotaDashboard from "./screen/manager/rotas/RotaDashboard";
import RotaView from "./screen/sub-manager/rotas/RotaView";
import MyRota from "./screen/staff/rotas/MyRota";

// Pages
import LoginPage from "./screen/auth/LoginPage";
import {
  RootDashboard,
  AdminDashboard,
  ManagerDashboard,
  SubManagerDashboard,
  StaffDashboard,
} from "./screen/DummyDashboards";

// Role-based Redirector
const RoleRedirector = () => {
  const { user, isAuthenticated } = useAppSelector((s) => s.auth);
  console.log("🚀 - RoleRedirector - user:", user, isAuthenticated);

  if (!isAuthenticated || !user) return <Navigate to={ROUTES.LOGIN} replace />;

  const role = user.role.role_name;

  if (role === UserRole.ROOT)
    return <Navigate to={ROUTES.ROOT.DASHBOARD} replace />;
  if (role === UserRole.ADMIN)
    return <Navigate to={ROUTES.ADMIN.DASHBOARD} replace />;
  if (role === UserRole.MANAGER)
    return <Navigate to={ROUTES.MANAGER.DASHBOARD} replace />;
  if (role === UserRole.SUB_MANAGER)
    return <Navigate to={ROUTES.SUB_MANAGER.DASHBOARD} replace />;
  if (role === UserRole.STAFF)
    return <Navigate to={ROUTES.STAFF.DASHBOARD} replace />;

  return <Navigate to={ROUTES.LOGIN} replace />;
};

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Routes>
          {/* Public routes */}
          <Route
            path={ROUTES.LOGIN}
            element={
              <PublicRoute>
                <LoginPage />
              </PublicRoute>
            }
          />

          {/* Protected routes */}
          <Route
            element={
              <ProtectedRoute>
                <Outlet />
              </ProtectedRoute>
            }
          >
            {/* Root Flow */}
            <Route
              element={
                <RootLayout>
                  <Outlet />
                </RootLayout>
              }
            >
              <Route path={ROUTES.ROOT.DASHBOARD} element={<RootDashboard />} />
            </Route>

            {/* Admin Flow */}
            <Route
              element={
                <AdminLayout>
                  <Outlet />
                </AdminLayout>
              }
            >
              <Route
                path={ROUTES.ADMIN.DASHBOARD}
                element={<AdminDashboard />}
              />
              <Route path={ROUTES.ADMIN.SHOPS.LIST} element={<ShopList />} />
              <Route path={ROUTES.ADMIN.SHOPS.CREATE} element={<ShopForm />} />
              <Route
                path={ROUTES.ADMIN.SHOPS.EDIT(":id")}
                element={<ShopForm />}
              />
              <Route
                path={ROUTES.ADMIN.SHOPS.DETAILS(":id")}
                element={<ShopDetail />}
              />
              <Route path={ROUTES.ADMIN.USERS.LIST} element={<UserList />} />
              <Route path={ROUTES.ADMIN.USERS.CREATE} element={<UserForm />} />
              <Route
                path={ROUTES.ADMIN.USERS.EDIT(":id")}
                element={<UserForm />}
              />
              <Route
                path={ROUTES.ADMIN.USERS.DETAILS(":id")}
                element={<UserDetail />}
              />
              <Route
                path={ROUTES.ADMIN.ROTAS.LIST}
                element={<RotaManagement />}
              />
            </Route>

            {/* Manager Flow */}
            <Route
              element={
                <ManagerLayout>
                  <Outlet />
                </ManagerLayout>
              }
            >
              <Route
                path={ROUTES.MANAGER.DASHBOARD}
                element={<ManagerDashboard />}
              />
              <Route
                path={ROUTES.MANAGER.ROTAS.PLANNER}
                element={<WeeklyPlanner />}
              />
              <Route
                path={ROUTES.MANAGER.ROTAS.DASHBOARD}
                element={<RotaDashboard />}
              />
            </Route>

            {/* Sub-Manager Flow */}
            <Route
              element={
                <SubManagerLayout>
                  <Outlet />
                </SubManagerLayout>
              }
            >
              <Route
                path={ROUTES.SUB_MANAGER.DASHBOARD}
                element={<SubManagerDashboard />}
              />
              <Route
                path={ROUTES.SUB_MANAGER.ROTAS.LIST}
                element={<RotaView />}
              />
            </Route>

            {/* Staff Flow */}
            <Route
              element={
                <StaffLayout>
                  <Outlet />
                </StaffLayout>
              }
            >
              <Route
                path={ROUTES.STAFF.DASHBOARD}
                element={<StaffDashboard />}
              />
              <Route path={ROUTES.STAFF.ATTENDANCE} element={<PunchInOut />} />
              <Route path={ROUTES.STAFF.MY_ROTA} element={<MyRota />} />
            </Route>
          </Route>

          {/* Default redirect based on role */}
          <Route path="/" element={<RoleRedirector />} />

          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
                <div className="text-center">
                  <p className="text-7xl font-black text-primary-200">404</p>
                  <p className="text-lg font-semibold text-primary-800 mt-2">
                    Page not found
                  </p>
                  <p className="text-slate-400 text-sm mt-1">
                    The page you are looking for doesn&apos;t exist.
                  </p>
                  <button
                    onClick={() => window.history.back()}
                    className="mt-4 inline-flex btn-primary text-sm px-5 py-2.5 rounded-lg"
                  >
                    Go Back
                  </button>
                </div>
              </div>
            }
          />
        </Routes>
        <ToastContainer
          position="top-right"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </BrowserRouter>
    </Provider>
  );
};

export default App;
