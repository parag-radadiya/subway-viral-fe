import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store, useAppSelector, useAppDispatch } from "./store";
import { ROUTES } from "./utils/routes";
import { UserRole, type User } from "./utils/types";
import { ProtectedRoute, PublicRoute } from "./components/common/RouteGuards";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useEffect, useState } from "react";
import { usersApi } from "./config/apiCall";
import { setUser } from "./store/slices/authSlice";

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
  console.log("🚀 - RoleRedirector - role:", role);

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

// ─── App-level spinner ────────────────────────────────────────────────────────
const AppSpinner = () => (
  <div
    style={{
      position: "fixed",
      inset: 0,
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      background: "#f8fafc",
      zIndex: 9999,
      gap: "16px",
    }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        border: "4px solid #e2e8f0",
        borderTopColor: "#1e3a5f",
        borderRadius: "50%",
        animation: "spin 0.8s linear infinite",
      }}
    />
    <p style={{ color: "#64748b", fontSize: 14, fontWeight: 500 }}>
      Loading your session…
    </p>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ─── Initializer — fetches fresh user profile on every session start ──────────
const AppInitializer = ({ children }: { children: React.ReactNode }) => {
  const dispatch = useAppDispatch();
  const { isAuthenticated, user } = useAppSelector((s) => s.auth);
  const [ready, setReady] = useState(!isAuthenticated); // skip fetch when not logged in

  useEffect(() => {
    if (!isAuthenticated || !user?.id) {
      setReady(true);
      return;
    }

    usersApi
      .getUser()
      .then((res) => {
        const fresh: User = res?.data?.data?.user;
        dispatch(setUser(fresh));
        localStorage.setItem("auth_user", JSON.stringify(fresh));
      })
      .catch(() => {
        // non-fatal — continue with cached user data
      })
      .finally(() => {
        setReady(true);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return <AppSpinner />;

  return <>{children}</>;
};

const ProtectedRouter = () => {
  const role = useAppSelector((s) => s.auth.user?.role?.role_name || "");

  return (
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
        {role === "Admin" && (
          <Route
            element={
              <AdminLayout>
                <Outlet />
              </AdminLayout>
            }
          >
            {AdminRoutes}
          </Route>
        )}

        {/* Manager Flow */}
        {role === "Manager" && (
          <Route
            element={
              <ManagerLayout>
                <Outlet />
              </ManagerLayout>
            }
          >
            {ManagerRoutes}
          </Route>
        )}

        {/* Sub-Manager Flow */}
        {role === "Sub-Manager" && (
          <Route
            element={
              <SubManagerLayout>
                <Outlet />
              </SubManagerLayout>
            }
          >
            {SubManagerRoutes}
          </Route>
        )}

        {/* Staff Flow */}
        {role === "Staff" && (
          <Route
            element={
              <StaffLayout>
                <Outlet />
              </StaffLayout>
            }
          >
            {StaffRoutes}
          </Route>
        )}
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
  );
};

const App = () => {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AppInitializer>
          <ProtectedRouter />
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
        </AppInitializer>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
