import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAppSelector } from "../../store";
import type { RootState } from "../../store";
import { ROUTES } from "../../utils/routes";

interface ProtectedRouteProps {
  children: ReactNode;
}

/**
 * Redirects unauthenticated users to /login.
 * Authenticated users are passed through to the child component.
 */
export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAppSelector((s: RootState) => s.auth.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to={ROUTES.LOGIN} replace />;
};

/**
 * Redirects authenticated users away from public pages (e.g. Login) to Dashboard.
 */
export const PublicRoute = ({ children }: ProtectedRouteProps) => {
  const isAuthenticated = useAppSelector((s: RootState) => s.auth.isAuthenticated);
  return !isAuthenticated ? <>{children}</> : <Navigate to={ROUTES.DASHBOARD} replace />;
};
