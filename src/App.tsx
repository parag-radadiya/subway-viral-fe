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

// Pages
import LoginPage from "./screen/auth/LoginPage";
import RootRoutes from "./screen/root";
import AdminRoutes from "./screen/admin";
import ManagerRoutes from "./screen/manager";
import SubManagerRoutes from "./screen/sub-manager";
import StaffRoutes from "./screen/staff";

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
              {RootRoutes}
            </Route>

            {/* Admin Flow */}
            <Route
              element={
                <AdminLayout>
                  <Outlet />
                </AdminLayout>
              }
            >
              {AdminRoutes}
            </Route>

            {/* Manager Flow */}
            <Route
              element={
                <ManagerLayout>
                  <Outlet />
                </ManagerLayout>
              }
            >
              {ManagerRoutes}
            </Route>

            {/* Sub-Manager Flow */}
            <Route
              element={
                <SubManagerLayout>
                  <Outlet />
                </SubManagerLayout>
              }
            >
              {SubManagerRoutes}
            </Route>

            {/* Staff Flow */}
            <Route
              element={
                <StaffLayout>
                  <Outlet />
                </StaffLayout>
              }
            >
              {StaffRoutes}
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
