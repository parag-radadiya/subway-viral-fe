import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { Mail, Lock, Store, AlertCircle } from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../store";
import { setCredentials, setLoading, setError } from "../../store/slices/authSlice";
import { authApi } from "../../config/apiCall";
import type { LoginCredentials, LoginResponse } from "../../utils/types";
import { ROUTES } from "../../utils/routes";
import { ENV } from "../../utils/constants";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";

const LoginPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useAppSelector((s) => s.auth);

  // ─── react-hook-form ────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginCredentials>({
    defaultValues: { email: "", password: "" },
    mode: "onTouched",
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.DASHBOARD, { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Reset error on unmount
  useEffect(() => {
    return () => {
      dispatch(setError(null));
    };
  }, [dispatch]);

  // ─── Submit handler ──────────────────────────────────────────────────────────
  const onSubmit = (data: LoginCredentials) => {
    dispatch(setLoading(true));
    dispatch(setError(null));

    authApi
      .login(data)
      .then((res) => {
        const payload = res.data.data as LoginResponse;
        dispatch(setCredentials({ token: payload.token, user: payload.user }));
        navigate(ROUTES.DASHBOARD, { replace: true });
      })
      .catch((err: { response?: { data?: { message?: string } } }) => {
        const message =
          err.response?.data?.message ?? "Login failed. Please try again.";
        dispatch(setError(message));
      })
      .finally(() => {
        dispatch(setLoading(false));
      });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Decorative background blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden" aria-hidden="true">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md z-10 animate-fade-in-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-900 text-white mb-4 shadow-lg">
            <Store size={26} />
          </div>
          <h1 className="text-2xl font-bold text-primary-900">{ENV.APP_NAME}</h1>
          <p className="text-sm text-slate-500 mt-1">Sign in to your account to continue</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-8">
          <h2 className="text-xl font-bold text-primary-800 mb-6">Welcome back</h2>

          {/* API-level error */}
          {error && (
            <div className="flex items-start gap-3 p-3.5 rounded-lg bg-danger-50 border border-danger-100 text-danger-600 text-sm mb-5 animate-fade-in">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-4">
            {/* Email */}
            <Input
              id="email"
              label="Email address"
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              leftIcon={<Mail size={15} />}
              error={errors.email?.message}
              {...register("email", {
                required: "Email is required",
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: "Enter a valid email address",
                },
              })}
            />

            {/* Password */}
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="••••••••"
              autoComplete="current-password"
              leftIcon={<Lock size={15} />}
              error={errors.password?.message}
              {...register("password", {
                required: "Password is required",
                minLength: {
                  value: 6,
                  message: "Password must be at least 6 characters",
                },
              })}
            />

            <div className="pt-2">
              <Button type="submit" fullWidth isLoading={isLoading} variant="primary">
                Sign in
              </Button>
            </div>
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            By signing in, you agree to the terms of service.
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          {ENV.APP_NAME} &copy; {new Date().getFullYear()} &mdash; v{ENV.APP_VERSION}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
