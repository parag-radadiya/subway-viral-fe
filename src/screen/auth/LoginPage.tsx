import { useState } from "react";
import { useForm } from "react-hook-form";
import { Mail, Lock, Store } from "lucide-react";
import { toast } from "react-toastify";
import { useAppDispatch, useAppSelector } from "../../store";
import {
  setCredentials,
  setLoading,
  setAuthenticated,
} from "../../store/slices/authSlice";
import { authApi } from "../../config/apiCall";
import { UserRole, type LoginCredentials } from "../../utils/types";
import { ENV } from "../../utils/constants";
import Button from "../../components/common/Button";
import Input from "../../components/common/Input";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../utils/routes";

type FinalLoginCredentials =
  | (LoginCredentials & {
      role: string;
    })
  | null;
const LoginPage = () => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading } = useAppSelector(({ auth }) => auth);
  console.log("🚀 - LoginPage - isLoading:", isLoading);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [tempCredentials, setTempCredentials] =
    useState<FinalLoginCredentials>(null);

  // ─── react-hook-form ────────────────────────────────────────────────────────
  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<any>({
    defaultValues: {
      email: "",
      password: "",
      newPassword: "",
      confirmPassword: "",
    },
    mode: "onTouched",
  });

  const newPassword = watch("newPassword");

  // ─── Submit handler ──────────────────────────────────────────────────────────
  const onSubmit = (data: any) => {
    dispatch(setLoading(true));

    if (!isChangingPassword) {
      authApi
        .login({ email: data.email, password: data.password })
        .then((res) => {
          const response = res.data.data;
          const role = response.user.role.role_name;

          if (response.must_change_password) {
            setTempCredentials({
              email: data.email,
              password: data.password,
              role,
            });

            setIsChangingPassword(true);
            reset({ newPassword: "", confirmPassword: "" });
          } else {
            dispatch(setAuthenticated(true));

            dispatch(
              setCredentials({ token: response.token, user: response.user }),
            );
            navigate("/");
          }
        })
        .catch((err: Error) => {
          toast.error(err.message);
        })
        .finally(() => {
          dispatch(setLoading(false));
        });
    } else {
      authApi
        .changePassword({
          currentPassword: tempCredentials?.password || "",
          newPassword: data.newPassword,
        })
        .then(({ data }) => {
          dispatch(setAuthenticated(true));

          const role = tempCredentials?.role;
          if (role === UserRole.ADMIN) {
            navigate(ROUTES.ADMIN.DASHBOARD);
          } else if (role === UserRole.MANAGER) {
            navigate(ROUTES.MANAGER.DASHBOARD);
          } else if (role === UserRole.SUB_MANAGER) {
            navigate(ROUTES.SUB_MANAGER.DASHBOARD);
          } else if (role === UserRole.STAFF) {
            navigate(ROUTES.STAFF.DASHBOARD);
          }

          dispatch(setCredentials({ token: data.token, user: data.user }));
        })
        .catch((err: Error) => {
          toast.error(err.message);
        })
        .finally(() => {
          dispatch(setLoading(false));
        });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      {/* Decorative background blobs */}
      <div
        className="fixed inset-0 pointer-events-none overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-accent-100/50 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-primary-100/40 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md z-10 animate-fade-in-up">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-primary-900 text-white mb-4 shadow-lg">
            <Store size={26} />
          </div>
          <h1 className="text-2xl font-bold text-primary-900">
            {ENV.APP_NAME}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            {isChangingPassword
              ? "Update your password"
              : "Sign in to your account to continue"}
          </p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-card border border-slate-100 p-8">
          <h2 className="text-xl font-bold text-primary-800 mb-6">
            {isChangingPassword ? "Security Update" : "Welcome back"}
          </h2>

          <form
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-4"
          >
            {!isChangingPassword ? (
              <>
                {/* Email */}
                <Input
                  id="email"
                  label="Email address"
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  leftIcon={<Mail size={15} />}
                  error={errors.email?.message as string}
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
                  error={errors.password?.message as string}
                  {...register("password", {
                    required: "Password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />
              </>
            ) : (
              <>
                <p className="text-xs text-slate-500 mb-4 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  Your account requires a mandatory password change before you
                  can continue.
                </p>
                {/* New Password */}
                <Input
                  id="newPassword"
                  label="New Password"
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<Lock size={15} />}
                  error={errors.newPassword?.message as string}
                  {...register("newPassword", {
                    required: "New password is required",
                    minLength: {
                      value: 6,
                      message: "Password must be at least 6 characters",
                    },
                  })}
                />

                {/* Confirm Password */}
                <Input
                  id="confirmPassword"
                  label="Confirm New Password"
                  type="password"
                  placeholder="••••••••"
                  leftIcon={<Lock size={15} />}
                  error={errors.confirmPassword?.message as string}
                  {...register("confirmPassword", {
                    required: "Please confirm your password",
                    validate: (value: string) =>
                      value === newPassword || "Passwords do not match",
                  })}
                />
              </>
            )}

            <div className="pt-2">
              <Button
                type="submit"
                fullWidth
                isLoading={isLoading}
                variant="primary"
              >
                {isChangingPassword ? "Update Password" : "Sign in"}
              </Button>
            </div>

            {isChangingPassword && (
              <button
                type="button"
                onClick={() => {
                  setIsChangingPassword(false);
                  reset();
                }}
                className="w-full text-center text-xs text-slate-400 hover:text-slate-600 transition-colors mt-2"
              >
                Go back to login
              </button>
            )}
          </form>

          <p className="text-center text-xs text-slate-400 mt-6">
            By signing in, you agree to the terms of service.
          </p>
        </div>

        <p className="text-center text-xs text-slate-400 mt-6">
          {ENV.APP_NAME} &copy; {new Date().getFullYear()} &mdash; v
          {ENV.APP_VERSION}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
