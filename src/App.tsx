import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import { ROUTES } from "./utils/routes";
import { ProtectedRoute, PublicRoute } from "./components/common/RouteGuards";

// Layout
import MainLayout from "./components/layout/MainLayout";

// Pages
import LoginPage from "./screen/auth/LoginPage";
import Dashboard from "./screen/dashboard/Dashboard";
import Inventory from "./screen/inventory/Inventory";
import Sales from "./screen/sales/Sales";
import Reports from "./screen/reports/Reports";
import Settings from "./screen/settings/Settings";

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

          {/* Protected routes (require authentication) */}
          <Route
            element={
              <ProtectedRoute>
                <MainLayout />
              </ProtectedRoute>
            }
          >
            <Route path={ROUTES.DASHBOARD} element={<Dashboard />} />
            <Route path={ROUTES.INVENTORY} element={<Inventory />} />
            <Route path={ROUTES.SALES} element={<Sales />} />
            <Route path={ROUTES.REPORTS} element={<Reports />} />
            <Route path={ROUTES.SETTINGS} element={<Settings />} />
          </Route>

          {/* Default redirect */}
          <Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

          {/* 404 fallback */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-slate-50">
                <div className="text-center">
                  <p className="text-7xl font-black text-primary-200">404</p>
                  <p className="text-lg font-semibold text-primary-800 mt-2">Page not found</p>
                  <p className="text-slate-400 text-sm mt-1">
                    The page you are looking for doesn&apos;t exist.
                  </p>
                  <a
                    href={ROUTES.DASHBOARD}
                    className="mt-4 inline-flex btn-primary text-sm px-5 py-2.5 rounded-lg"
                  >
                    Back to Dashboard
                  </a>
                </div>
              </div>
            }
          />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
};

export default App;
