import { clsx } from "clsx";
import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Fingerprint,
  Loader2,
  MapPin,
  Navigation,
  ShieldCheck,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Button from "../common/Button";
import { attendanceApi } from "../../config/apiCall";
import { useBiometric } from "../../hooks/useBiometric";
import { useAppSelector } from "../../store";

interface AttendancePunchCardProps {
  onSuccess: () => void;
}

const AttendancePunchCard = ({ onSuccess }: AttendancePunchCardProps) => {
  const { user } = useAppSelector((s) => s.auth);
  const {
    isRegistered,
    register,
    authenticate,
    reset: bioReset,
  } = useBiometric();
  
  const [locationVerified, setLocationVerified] = useState(false);
  const [locationToken, setLocationToken] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState<"in" | "out">("in");
  const [punching, setPunching] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [activeAttendance, setActiveAttendance] = useState<any>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);

  const timerRef = useRef<any>(null);

  const resetVerification = useCallback(() => {
    setLocationVerified(false);
    setLocationToken(null);
    setTimeLeft(null);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const fetchCurrentStatus = useCallback(async () => {
    setLoadingStatus(true);
    try {
      const res = await attendanceApi.list();
      const records = res.data.data.records || [];
      const active = records.find((rec: any) => !rec.punch_out);
      setActiveAttendance(active);
      if (active) {
        setActiveTab("out");
      } else {
        setActiveTab("in");
      }
    } catch (err) {
      console.error("Error fetching attendance status:", err);
    } finally {
      setLoadingStatus(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchCurrentStatus();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchCurrentStatus]);

  const handleVerifyLocation = async () => {
    if (!user?.shop_id) {
      toast.error("No shop assigned to your profile.");
      return;
    }

    setIsVerifying(true);

    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser.");
      setIsVerifying(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const res = await attendanceApi.verifyLocation({
            shop_id: user.shop_id,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });

          if (res.data.status === 200) {
            setLocationToken(res.data.data.location_token);
            setLocationVerified(true);
            toast.success("Location verified successfully!");
            setTimeLeft(300);
            if (timerRef.current) clearInterval(timerRef.current);
            timerRef.current = setInterval(() => {
              setTimeLeft((prev) => {
                if (prev === null || prev <= 1) {
                  resetVerification();
                  return null;
                }
                return prev - 1;
              });
            }, 1000);
          } else {
            toast.error(res.data.message || "Location verification failed.");
          }
        } catch (err: any) {
          toast.error(
            err.response?.data?.message || "Location verification failed.",
          );
        } finally {
          setIsVerifying(false);
        }
      },
      (error) => {
        toast.error("Error obtaining location: " + error.message);
        setIsVerifying(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const executePunch = async () => {
    setPunching(true);
    try {
      if (activeTab === "in") {
        await attendanceApi.punchIn({
          shop_id: user?.shop_id || "",
          location_token: locationToken || "",
          biometric_verified: true,
        });
        toast.success("Punched In Successfully!");
        resetVerification();
        onSuccess();
      } else {
        if (!activeAttendance?._id) {
          setPunching(false);
          toast.error("No active attendance record found to punch out.");
          return;
        }
        await attendanceApi.punchOut(activeAttendance._id);
        toast.success("Punched Out Successfully!");
        resetVerification();
        onSuccess();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Punch action failed.");
    }
    setPunching(false);
  };

  const handleSuccess = () => {
    setTimeout(() => {
      executePunch();
    }, 800);
  };

  const handleBiometric = async () => {
    bioReset();
    let ok = false;
    if (!isRegistered) {
      ok = await register();
    } else {
      ok = await authenticate();
    }
    if (ok) handleSuccess();
  };

  if (loadingStatus) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-medium">Loading status...</p>
      </div>
    );
  }

  return (
    <div className="max-w-md mx-auto space-y-6 animate-fade-in pb-10">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold text-slate-800">Attendance</h1>
        <p className="text-sm text-slate-500">
          Verify your location and use biometrics to punch in/out
        </p>
      </div>

      {!locationVerified ? (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
          <div className="p-8 text-center space-y-6">
            <div className="w-20 h-20 bg-primary-50 rounded-full flex items-center justify-center mx-auto text-primary-500 animate-pulse">
              <MapPin size={36} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-slate-800">
                Location Verification Required
              </h3>
              <p className="text-sm text-slate-500 px-4">
                Please verify you are within the shop geofence to continue.
              </p>
            </div>
            <Button
              variant="primary"
              fullWidth
              size="lg"
              onClick={handleVerifyLocation}
              isLoading={isVerifying}
              className="rounded-2xl h-14 text-base font-bold shadow-lg shadow-primary-200"
            >
              {!isVerifying && <Navigation size={20} className="mr-2" />}
              {isVerifying ? "Verifying..." : "Verify Location"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="flex items-center justify-between bg-white px-6 py-4 rounded-2xl border border-slate-200 shadow-sm transition-all duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-success-50 rounded-xl flex items-center justify-center text-success-600">
                <ShieldCheck size={22} />
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Location Status
                </p>
                <p className="text-sm font-bold text-slate-700">Verified</p>
              </div>
            </div>
            {timeLeft !== null && (
              <div className="text-right">
                <p className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                  Expires In
                </p>
                <p
                  className={clsx(
                    "text-sm font-mono font-bold",
                    timeLeft < 60 ? "text-danger-500" : "text-primary-600",
                  )}
                >
                  {Math.floor(timeLeft / 60)}:
                  {String(timeLeft % 60).padStart(2, "0")}s
                </p>
              </div>
            )}
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden p-2">
            <div className="flex p-1 bg-slate-100 rounded-2xl">
              <button
                onClick={() => setActiveTab("in")}
                disabled={!!activeAttendance}
                className={clsx(
                  "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                  activeTab === "in"
                    ? "bg-white text-primary-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                  activeAttendance && "opacity-50 cursor-not-allowed",
                )}
              >
                <Clock size={18} />
                Punch In
              </button>
              <button
                onClick={() => setActiveTab("out")}
                disabled={!activeAttendance}
                className={clsx(
                  "flex-1 py-3 px-4 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2",
                  activeTab === "out"
                    ? "bg-white text-primary-600 shadow-sm"
                    : "text-slate-500 hover:text-slate-700",
                  !activeAttendance && "opacity-50 cursor-not-allowed",
                )}
              >
                <Clock size={18} />
                Punch Out
              </button>
            </div>

            <div className="p-6 text-center space-y-8 mt-2">
              <div className="relative mx-auto w-32 h-32">
                <div
                  className={clsx(
                    "absolute inset-0 rounded-full border-4 border-dashed animate-spin-slow",
                    "border-slate-100",
                  )}
                />
                <button
                  onClick={handleBiometric}
                  disabled={punching}
                  className={clsx(
                    "absolute inset-2 rounded-full flex items-center justify-center transition-all duration-300 shadow-inner",
                    activeTab === "in"
                      ? "bg-primary-50 text-primary-600 hover:bg-primary-100"
                      : "bg-orange-50 text-orange-600 hover:bg-orange-100",
                    punching && "scale-95 opacity-80",
                  )}
                >
                  {punching ? (
                    <Loader2 className="animate-spin" size={40} />
                  ) : (
                    <Fingerprint size={48} />
                  )}
                </button>
              </div>

              <div className="space-y-3">
                <h3 className="text-xl font-black text-slate-800">
                  {activeTab === "in" ? "Clock In" : "Clock Out"}
                </h3>
                <p className="text-sm text-slate-500 px-8 leading-relaxed">
                  {activeTab === "in"
                    ? "Securely record your shift start using biometric authentication."
                    : "End your shift and verify your hours for the day."}
                </p>
              </div>

              {activeAttendance && activeTab === "out" && (
                <div className="flex items-center gap-2 justify-center bg-success-50 text-success-700 px-4 py-3 rounded-xl border border-success-100">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-bold">
                    Currently Clocked In:{" "}
                    {format(
                      new Date(activeAttendance.punch_in),
                      "dd MMM, hh:mm a",
                    )}
                  </span>
                </div>
              )}

              <Button
                variant={activeTab === "in" ? "primary" : "secondary"}
                fullWidth
                size="lg"
                onClick={handleBiometric}
                isLoading={punching}
                className="rounded-2xl h-14 text-base font-black shadow-lg"
              >
                Verify {activeTab === "in" ? "Punch In" : "Punch Out"}
              </Button>

              <button
                onClick={resetVerification}
                className="text-xs font-bold text-slate-400 hover:text-danger-500 transition-colors"
              >
                Cancel & Re-verify Location
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 flex gap-4">
        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-slate-400 shadow-sm shrink-0">
          <AlertCircle size={20} />
        </div>
        <div className="space-y-1">
          <p className="text-xs font-bold text-slate-700">Need Help?</p>
          <p className="text-[11px] text-slate-500 leading-normal">
            If biometrics fail, ensure your device has a fingerprint or face ID
            enabled and you are using a secure connection.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AttendancePunchCard;
