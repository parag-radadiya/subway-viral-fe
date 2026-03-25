import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { shopsApi } from "../../../config/apiCall";
import {
  Store,
  Navigation,
  ArrowLeft,
  Loader2,
  Save,
  Radius,
  MapPin,
} from "lucide-react";
import { ROUTES } from "../../../utils/routes";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import { toast } from "react-toastify";

interface ShopFormData {
  name: string;
  latitude: number;
  longitude: number;
  geofence_radius_m: number;
}

const ShopForm = () => {
  const { id } = useParams<{ id: string }>();
  const isEdit = !!id;
  const navigate = useNavigate();
  const [loading, setLoading] = useState(isEdit);
  const [submitting, setSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ShopFormData>({
    defaultValues: {
      geofence_radius_m: 100,
    },
  });

  const handleGetCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setValue("latitude", position.coords.latitude, {
          shouldValidate: true,
        });
        setValue("longitude", position.coords.longitude, {
          shouldValidate: true,
        });
        setIsLocating(false);
      },
      (error) => {
        console.error("Error getting location:", error);
        alert(
          "Unable to retrieve your location. Please ensure location services are enabled.",
        );
        setIsLocating(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 },
    );
  };

  useEffect(() => {
    if (isEdit && id) {
      shopsApi
        .getById(id)
        .then((res) => {
          reset(res.data.data.shop);
        })
        .catch((err: any) => {
          toast.error(err.message || "Failed to load shop details");
          console.error(err);
        })
        .finally(() => setLoading(false));
    }
  }, [id, isEdit, reset]);

  const onSubmit = (data: ShopFormData) => {
    setSubmitting(true);
    const apiCall = isEdit
      ? shopsApi.update(id!, data as any)
      : shopsApi.create(data as any);

    apiCall
       .then(() => {
         toast.success(
           isEdit ? "Shop updated successfully" : "Shop registered successfully",
         );
         navigate(ROUTES.ADMIN.SHOPS.LIST);
       })
       .catch((err: any) => {
         toast.error(err.message || "Failed to save shop");
         console.error(err);
       })
       .finally(() => {
         setSubmitting(false);
       });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-medium">Fetching shop data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(ROUTES.ADMIN.SHOPS.LIST)}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {isEdit ? "Edit Shop Location" : "Onboard New Shop"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure branch details and geofencing parameters
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="bg-white rounded-2xl border border-slate-200 shadow-card p-8 space-y-5"
      >
        <div className="flex items-center justify-between">
          <Input
            label="Shop Name"
            placeholder="e.g. West Branch Central"
            leftIcon={<Store size={16} />}
            error={errors.name?.message}
            {...register("name", { required: "Shop name is required" })}
          />
        </div>

        <div className="flex items-center justify-between">
          <label className="text-sm font-semibold text-slate-700">
            Location Coordinates
          </label>
          <button
            type="button"
            onClick={handleGetCurrentLocation}
            disabled={isLocating}
            className="flex items-center gap-2 text-xs font-semibold text-blue-600 hover:text-blue-700 disabled:text-slate-400 transition-colors"
          >
            {isLocating ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <MapPin size={14} />
            )}
            {isLocating ? "Fetching..." : "Get current location"}
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Latitude"
            type="number"
            step="any"
            placeholder="0.000000"
            leftIcon={<Navigation size={16} />}
            error={errors.latitude?.message}
            {...register("latitude", {
              required: "Latitude is required",
              valueAsNumber: true,
            })}
          />
          <Input
            label="Longitude"
            type="number"
            step="any"
            placeholder="0.000000"
            leftIcon={<Navigation size={16} className="-rotate-90" />}
            error={errors.longitude?.message}
            {...register("longitude", {
              required: "Longitude is required",
              valueAsNumber: true,
            })}
          />
        </div>

        <Input
          label="Geofence Radius (meters)"
          type="number"
          placeholder="100"
          leftIcon={<Radius size={16} />}
          hint="Minimum distance for attendance verification"
          error={errors.geofence_radius_m?.message}
          {...register("geofence_radius_m", {
            required: "Radius is required",
            valueAsNumber: true,
            min: { value: 20, message: "Minimum 20m recommended" },
          })}
        />

        <div className="pt-4 flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            type="button"
            onClick={() => navigate(ROUTES.ADMIN.SHOPS.LIST)}
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
            {isEdit ? "Update Details" : "Register Shop"}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ShopForm;
