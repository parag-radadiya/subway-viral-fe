import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm } from "react-hook-form";
import { usersApi, rolesApi, shopsApi } from "../../../config/apiCall";
import { Store } from "lucide-react";
import {
  User as UserIcon,
  Mail,
  Shield,
  MapPin,
  ArrowLeft,
  Save,
  Loader2,
  Key,
  Phone,
} from "lucide-react";
import { ROUTES } from "../../../utils/routes";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import { toast } from "react-toastify";

interface UserFormData {
  name: string;
  email: string;
  password?: string;
  confirm_password?: string;
  phone_code: string;
  phone_num: string;
  role_id: string;
  active_shop_id: string;
  assigned_shop_ids: string[];
}

const UserForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [roles, setRoles] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<UserFormData>({
    defaultValues: {
      phone_code: "+91",
      assigned_shop_ids: [],
    },
  });

  useEffect(() => {
    const fetchData = () => {
      Promise.all([rolesApi.list(), shopsApi.list()])
        .then(([rolesRes, shopsRes]) => {
          setRoles(rolesRes.data.data.roles);
          setShops(shopsRes.data.data.shops);

          if (isEdit && id) {
            return usersApi.getById(id);
          }
          return null;
        })
        .then((userRes) => {
          if (userRes) {
            const userData = userRes.data.data.user;
            reset({
              name: userData.name,
              email: userData.email,
              phone_code: userData.phone_code,
              phone_num: userData.phone_num,
              role_id: userData.role_id._id,
              active_shop_id: userData.shop_id._id,
              assigned_shop_ids: userData.assigned_shop_ids,
            });
          }
        })
        .catch((err) => {
          console.error(err);
          toast.error(err.message || "Failed to load form data");
        })
        .finally(() => {
          setLoading(false);
        });
    };

    fetchData();
  }, [id, isEdit, reset]);

  const onSubmit = (data: UserFormData) => {
    setSubmitting(true);

    // In edit mode, if password is empty, remove it to avoid updating it to empty string
    if (isEdit && !data.password) {
      delete data.password;
    }

    delete data.confirm_password; // Remove before sending to API

    const apiCall = isEdit
      ? usersApi.update(id!, data as any)
      : usersApi.create(data as any);

    apiCall
      .then(() => {
        toast.success(
          isEdit ? "User updated successfully" : "User onboarded successfully",
        );
        navigate(ROUTES.ADMIN.USERS.LIST);
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.message || "Failed to save user");
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-medium">Preparing personnel forms...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(ROUTES.ADMIN.USERS.LIST)}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {isEdit ? "Update Personnel Profile" : "Onboard New Personnel"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {isEdit
              ? "Modify existing user details and access levels"
              : "Register a new user and define their platform access"}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl border border-slate-200 shadow-card p-8 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-4">
          <Input
            label="Full Name"
            placeholder="e.g. John Doe"
            leftIcon={<UserIcon size={16} />}
            error={errors.name?.message}
            {...register("name", { required: "Name is required" })}
          />

          <Input
            label="Email Address"
            type="email"
            placeholder="j.doe@org.com"
            leftIcon={<Mail size={16} />}
            error={errors.email?.message}
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })}
          />

          <Input
            label={
              isEdit ? "New Password (Leave blank to keep current)" : "Password"
            }
            type="password"
            placeholder="••••••••"
            leftIcon={<Key size={16} />}
            error={errors.password?.message}
            {...register("password", {
              required: !isEdit && "Password is required",
            })}
          />

          <Input
            label="Confirm Password"
            type="password"
            placeholder="••••••••"
            leftIcon={<Key size={16} />}
            error={errors.confirm_password?.message}
            {...register("confirm_password", {
              required: !isEdit && "Please confirm your password",
              validate: (val) => {
                if (!val && isEdit && !watch("password")) return true;
                if (watch("password") !== val) return "Passwords do not match";
                return true;
              },
            })}
          />

          <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Phone Code"
              placeholder="+91"
              leftIcon={<Phone size={16} />}
              error={errors.phone_code?.message}
              {...register("phone_code", { required: "Code required" })}
            />
            <div className="md:col-span-2">
              <Input
                label="Phone Number"
                placeholder="9876543210"
                error={errors.phone_num?.message}
                {...register("phone_num", { required: "Phone is required" })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-primary-700 flex items-center gap-2">
              <Shield size={14} /> Assigned Role
            </label>
            <select
              className="w-full h-11 rounded-lg border border-slate-200 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-200 focus:border-accent-400 transition-all appearance-none"
              {...register("role_id", { required: "Role is required" })}
            >
              <option value="">Select a security role...</option>
              {roles.map((role) => (
                <option key={role._id} value={role._id}>
                  {role.role_name}
                </option>
              ))}
            </select>
            {errors.role_id && (
              <p className="text-[10px] text-danger-500 font-medium">
                ⚠ {errors.role_id.message}
              </p>
            )}
          </div>

          <div className="space-y-1.5">
            <label className="text-sm font-medium text-primary-700 flex items-center gap-2">
              <Store size={14} /> Active Shop
            </label>
            <select
              className="w-full h-11 rounded-lg border border-slate-200 px-4 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-accent-200 focus:border-accent-400 transition-all appearance-none"
              {...register("active_shop_id", {
                required: "Active shop is required",
              })}
            >
              <option value="">Select primary shop...</option>
              {shops.map((shop) => (
                <option key={shop._id} value={shop._id}>
                  {shop.name}
                </option>
              ))}
            </select>
            {errors.active_shop_id && (
              <p className="text-[10px] text-danger-500 font-medium">
                ⚠ {errors.active_shop_id.message}
              </p>
            )}
          </div>

          <div className="md:col-span-2 space-y-1.5">
            <label className="text-sm font-medium text-primary-700 flex items-center gap-2">
              <MapPin size={14} /> Shop Assignments
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 p-4 bg-slate-50 rounded-xl border border-slate-100 max-h-40 overflow-y-auto">
              {shops.map((shop) => (
                <label
                  key={shop._id}
                  className="flex items-center gap-3 p-2 rounded-lg hover:bg-white transition-colors border border-transparent hover:border-slate-100 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    value={shop._id}
                    className="w-4 h-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
                    {...register("assigned_shop_ids")}
                  />
                  <span className="text-xs font-semibold text-slate-600 truncate">
                    {shop.name}
                  </span>
                </label>
              ))}
            </div>
            <p className="text-[10px] text-slate-400">
              Select one or more shops for this user to manage.
            </p>
          </div>
        </div>

        <div className="pt-4 flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            type="button"
            onClick={() => navigate(ROUTES.ADMIN.USERS.LIST)}
            disabled={submitting}
          >
            Cancel
          </Button>
          <Button
            variant="primary"
            fullWidth
            type="submit"
            isLoading={submitting}
          >
            <Save size={18} className="mr-2" />
            {isEdit ? "Save Changes" : "Complete Onboarding"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default UserForm;
