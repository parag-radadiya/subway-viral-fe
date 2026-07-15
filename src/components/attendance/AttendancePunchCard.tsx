import { clsx } from "clsx";
import { format } from "date-fns";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Clock,
  Coffee,
  Fingerprint,
  Loader2,
  MapPin,
  Navigation,
  ShieldCheck,
  UtensilsCrossed,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import Button from "../common/Button";
import { attendanceApi } from "../../config/apiCall";
import { useBiometric } from "../../hooks/useBiometric";
import { useAppSelector } from "../../store";

interface BreakEntry {
  _id: string;
  break_start: string;
  break_end: string | null;
  break_type: "Lunch" | "Other";
  duration_minutes: number | null;
  is_manual: boolean;
  manual_by: string | null;
}

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
  console.log("🚀 - AttendancePunchCard - activeAttendance:", activeAttendance);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [eligibleRotas, setEligibleRotas] = useState<any[]>([]);
  const [selectedRotaId, setSelectedRotaId] = useState<string | null>(null);
  const [isFetchingRotas, setIsFetchingRotas] = useState(false);

  // Lunch break state
  const [isBreaking, setIsBreaking] = useState(false);
  const [breakElapsed, setBreakElapsed] = useState(0); // seconds since break_start

  const timerRef = useRef<any>(null);
  const breakTimerRef = useRef<any>(null);

  // Derived break fields from activeAttendance
  const isOnBreak: boolean = activeAttendance?.is_on_break ?? false;
  const breaks: BreakEntry[] = activeAttendance?.breaks ?? [];
  const totalBreakMinutes: number = activeAttendance?.total_break_minutes ?? 0;

  // Tick a live elapsed counter when on break
  useEffect(() => {
    if (breakTimerRef.current) clearInterval(breakTimerRef.current);
    if (isOnBreak) {
      const openBreak = breaks.find((b) => !b.break_end);
      if (openBreak) {
        const startMs = new Date(openBreak.break_start).getTime();
        const tick = () =>
          setBreakElapsed(Math.floor((Date.now() - startMs) / 1000));
        tick();
        breakTimerRef.current = setInterval(tick, 1000);
      }
    } else {
      setBreakElapsed(0);
    }
    return () => {
      if (breakTimerRef.current) clearInterval(breakTimerRef.current);
    };
  }, [isOnBreak, breaks]);

  const resetVerification = useCallback(() => {
    setLocationVerified(false);
    setLocationToken(null);
    setTimeLeft(null);
    if (timerRef.current) clearInterval(timerRef.current);
  }, []);

  const fetchEligibleRotas = useCallback(() => {
    if (!user?.shop_id) return;
    setIsFetchingRotas(true);
    attendanceApi
      .eligibleRotas(user.shop_id)
      .then((res) => {
        const rotas = res.data.data.rotas || [];
        const count = res.data.data.count || 0;
        setEligibleRotas(rotas);
        if (count === 1) {
          setSelectedRotaId(rotas[0]._id);
        } else {
          setSelectedRotaId(null);
        }
      })
      .catch((err) => {
        console.error("Error fetching eligible rotas:", err);
        toast.error(err.message || "Failed to fetch eligible shifts.");
      })
      .finally(() => {
        setIsFetchingRotas(false);
      });
  }, [user?.shop_id]);

  const fetchCurrentStatus = useCallback(() => {
    setLoadingStatus(true);
    attendanceApi
      .list()
      .then((res) => {
        const records = res.data.data.records || [];
        const active = records.find((rec: any) => !rec.punch_out);
        setActiveAttendance(active);
        if (active) {
          setActiveTab("out");
        } else {
          setActiveTab("in");
          fetchEligibleRotas();
        }
      })
      .catch((err) => {
        console.error("Error fetching attendance status:", err);
      })
      .finally(() => {
        setLoadingStatus(false);
      });
  }, [user?.id, fetchEligibleRotas]);

  useEffect(() => {
    fetchCurrentStatus();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (breakTimerRef.current) clearInterval(breakTimerRef.current);
    };
  }, [fetchCurrentStatus]);

  const handleVerifyLocation = () => {
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
      (position) => {
        attendanceApi
          .verifyLocation({
            shop_id: user.shop_id,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          })
          .then((res) => {
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
          })
          .catch((err: any) => {
            toast.error(err.message || "Location verification failed.");
          })
          .finally(() => {
            setIsVerifying(false);
          });
      },
      (error) => {
        toast.error("Error obtaining location: " + error.message);
        setIsVerifying(false);
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 },
    );
  };

  const executePunch = () => {
    setPunching(true);
    const punchCall =
      activeTab === "in"
        ? attendanceApi.punchIn({
            shop_id: user?.shop_id || "",
            location_token: locationToken || "",
            biometric_verified: true,
            rota_id: selectedRotaId || undefined,
          })
        : activeAttendance?._id
          ? attendanceApi.punchOut(activeAttendance._id)
          : null;

    if (!punchCall) {
      setPunching(false);
      if (activeTab === "out") {
        toast.error("No active attendance record found to punch out.");
      }
      return;
    }

    punchCall
      .then(() => {
        toast.success(
          activeTab === "in"
            ? "Punched In Successfully!"
            : "Punched Out Successfully!",
        );
        resetVerification();
        onSuccess();
      })
      .catch((err: any) => {
        toast.error(err.message || "Punch action failed.");
      })
      .finally(() => {
        setPunching(false);
      });
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

  // ── Lunch break handlers ──────────────────────────────────────────────────

  const handleStartBreak = () => {
    if (!activeAttendance?._id) return;
    setIsBreaking(true);
    attendanceApi
      .breakStart(activeAttendance._id, "Lunch")
      .then((res) => {
        const updated = res.data.attendance;
        setActiveAttendance(updated);
        fetchCurrentStatus();
        toast.success("Lunch break started!");
      })
      .catch((err: any) => {
        toast.error(err.message || "Could not start break.");
      })
      .finally(() => setIsBreaking(false));
  };

  const handleEndBreak = () => {
    if (!activeAttendance?._id) return;
    setIsBreaking(true);
    attendanceApi
      .breakEnd(activeAttendance._id)
      .then((res) => {
        const updated = res.data.attendance;
        fetchCurrentStatus();
        setActiveAttendance(updated);
        toast.success("Break ended. Back to work!");
      })
      .catch((err: any) => {
        toast.error(err.message || "Could not end break.");
      })
      .finally(() => setIsBreaking(false));
  };

  // ── Helpers ───────────────────────────────────────────────────────────────

  const fmtSeconds = (s: number) => {
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return [h, m, sec].map((v) => String(v).padStart(2, "0")).join(":");
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
          {activeTab === "in" && (
            <div className="space-y-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                  <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Select Your Shift
                  </p>
                  {isFetchingRotas && (
                    <Loader2
                      className="animate-spin text-primary-500"
                      size={14}
                    />
                  )}
                </div>

                {eligibleRotas.length === 0 && !isFetchingRotas ? (
                  <div className="bg-danger-50 border border-danger-100 p-4 rounded-2xl flex items-start gap-3 text-left">
                    <AlertCircle
                      className="text-danger-500 shrink-0 mt-0.5"
                      size={18}
                    />
                    <div className="space-y-1">
                      <p className="text-sm font-bold text-danger-600">
                        No Eligible Shift Found
                      </p>
                      <p className="text-xs text-danger-600 leading-relaxed">
                        You don't have any scheduled shifts at this time. Please
                        contact your manager if you believe this is an error.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="grid gap-2">
                    {eligibleRotas.map((rota) => (
                      <button
                        key={rota._id}
                        onClick={() => setSelectedRotaId(rota._id)}
                        className={clsx(
                          "flex items-center gap-3 p-3 rounded-2xl border transition-all text-left",
                          selectedRotaId === rota._id
                            ? "bg-primary-50 border-primary-200 ring-2 ring-primary-100"
                            : "bg-slate-50 border-slate-100 hover:border-slate-200",
                        )}
                      >
                        <div
                          className={clsx(
                            "w-5 h-5 rounded-full border flex items-center justify-center shrink-0",
                            selectedRotaId === rota._id
                              ? "bg-primary-500 border-primary-500 text-white"
                              : "bg-white border-slate-200",
                          )}
                        >
                          {selectedRotaId === rota._id && (
                            <Check size={12} strokeWidth={4} />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-0.5">
                            <p className="text-sm font-bold text-slate-800">
                              {format(new Date(rota.shift_start), "hh:mm a")} -{" "}
                              {format(new Date(rota.shift_end), "hh:mm a")}
                            </p>
                            {rota.role_id?.name && (
                              <span className="text-[10px] font-black uppercase tracking-widest bg-white px-1.5 py-0.5 rounded-md border border-slate-100 text-slate-500">
                                {rota.role_id.name}
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-slate-500 truncate">
                            {format(new Date(rota.shift_date), "EEEE, dd MMMM")}
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {(selectedRotaId || eligibleRotas.length > 0) && (
                <div className="space-y-6 pt-4 border-t border-slate-100">
                  {!locationVerified ? (
                    <div className="space-y-6">
                      <div className="flex flex-col items-center gap-4 py-4 px-6 bg-slate-50 rounded-2xl border border-slate-100 italic">
                        <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center text-primary-500 animate-pulse">
                          <MapPin size={24} />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-bold text-slate-700">
                            Location Verification Required
                          </p>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            Verify you are within the shop geofence to unlock
                            punching.
                          </p>
                        </div>
                        <Button
                          variant="primary"
                          fullWidth
                          size="lg"
                          onClick={handleVerifyLocation}
                          isLoading={isVerifying}
                          className="rounded-2xl h-12 text-sm font-bold shadow-lg shadow-primary-200"
                        >
                          {!isVerifying && (
                            <Navigation size={18} className="mr-2" />
                          )}
                          {isVerifying ? "Verifying..." : "Verify Location"}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-8 animate-fade-in">
                      <div className="flex items-center justify-between bg-success-50/50 px-4 py-3 rounded-xl border border-success-100/50">
                        <div className="flex items-center gap-2 text-success-700">
                          <ShieldCheck size={18} />
                          <span className="text-xs font-bold uppercase tracking-wider">
                            Location Verified
                          </span>
                        </div>
                        {timeLeft !== null && (
                          <div className="flex items-center gap-1.5">
                            <span className="text-[10px] font-bold text-slate-400">
                              EXPIRING IN
                            </span>
                            <span
                              className={clsx(
                                "text-xs font-mono font-bold px-2 py-0.5 rounded bg-white shadow-sm border border-slate-100",
                                timeLeft < 60
                                  ? "text-danger-500"
                                  : "text-primary-600",
                              )}
                            >
                              {Math.floor(timeLeft / 60)}:
                              {String(timeLeft % 60).padStart(2, "0")}s
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="relative mx-auto w-32 h-32">
                        <div className="absolute inset-0 rounded-full border-4 border-dashed border-slate-100 animate-spin-slow" />
                        <button
                          onClick={handleBiometric}
                          disabled={punching}
                          className="absolute inset-2 rounded-full flex items-center justify-center transition-all duration-300 shadow-inner bg-primary-50 text-primary-600 hover:bg-primary-100 punching:scale-95 punching:opacity-80"
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
                          Clock In
                        </h3>
                        <p className="text-sm text-slate-500 px-8 leading-relaxed">
                          Securely record your shift start using biometric
                          authentication.
                        </p>
                      </div>

                      <Button
                        variant="primary"
                        fullWidth
                        size="lg"
                        onClick={handleBiometric}
                        isLoading={punching}
                        disabled={!selectedRotaId}
                        className="rounded-2xl h-14 text-base font-black shadow-lg"
                      >
                        Verify Punch In
                      </Button>

                      <button
                        onClick={resetVerification}
                        className="text-xs font-bold text-slate-400 hover:text-danger-500 transition-colors"
                      >
                        Re-verify Location
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "out" && (
            <div className="space-y-8 animate-fade-in">
              <div className="space-y-4">
                {/* Clocked-in status */}
                <div className="flex items-center gap-2 justify-center bg-success-50 text-success-700 px-4 py-3 rounded-xl border border-success-100">
                  <CheckCircle2 size={16} />
                  <span className="text-xs font-bold">
                    Currently Clocked In:{" "}
                    {activeAttendance?.punch_in &&
                      format(
                        new Date(activeAttendance.punch_in),
                        "dd MMM, hh:mm a",
                      )}
                  </span>
                </div>

                {/* Linked shift */}
                {activeAttendance?.rota_id && (
                  <div className="flex flex-col items-center gap-1 p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                      Linked Shift
                    </p>
                    <p className="text-sm font-bold text-slate-700">
                      {format(
                        new Date(activeAttendance.rota_id.shift_start),
                        "hh:mm a",
                      )}{" "}
                      -{" "}
                      {format(
                        new Date(activeAttendance.rota_id.shift_end),
                        "hh:mm a",
                      )}
                    </p>
                  </div>
                )}

                {/* ── Lunch break section ── */}
                {isOnBreak ? (
                  /* Currently on break */
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-4 animate-fade-in">
                    <div className="flex items-center justify-center gap-2 text-amber-700">
                      <Coffee size={18} className="shrink-0" />
                      <span className="text-sm font-bold">On Lunch Break</span>
                    </div>
                    <div className="text-3xl font-mono font-black text-amber-600 text-center">
                      {fmtSeconds(breakElapsed)}
                    </div>
                    <p className="text-[11px] text-amber-600 text-center">
                      Punch-out is disabled while on break
                    </p>
                    <Button
                      variant="primary"
                      fullWidth
                      size="lg"
                      onClick={handleEndBreak}
                      isLoading={isBreaking}
                      className="rounded-2xl h-12 text-sm font-black bg-amber-500 hover:bg-amber-600 border-amber-500 shadow-lg shadow-amber-100"
                    >
                      {!isBreaking && (
                        <UtensilsCrossed size={18} className="mr-2" />
                      )}
                      End Break
                    </Button>
                  </div>
                ) : (
                  /* Not on break — show break history summary + start button */
                  <div className="space-y-3">
                    {totalBreakMinutes > 0 && (
                      <div className="flex items-center justify-between px-4 py-2.5 bg-slate-50 rounded-xl border border-slate-100">
                        <div className="flex items-center gap-2 text-slate-500">
                          <Coffee size={14} />
                          <span className="text-xs font-bold">Total break</span>
                        </div>
                        <span className="text-xs font-mono font-black text-slate-700">
                          {totalBreakMinutes}m
                        </span>
                      </div>
                    )}

                    <button
                      onClick={handleStartBreak}
                      disabled={isBreaking}
                      className={clsx(
                        "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-dashed transition-all text-sm font-bold",
                        isBreaking
                          ? "opacity-50 cursor-not-allowed text-slate-400 border-slate-200"
                          : "text-amber-600 border-amber-300 hover:bg-amber-50 hover:border-amber-400",
                      )}
                    >
                      {isBreaking ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Coffee size={16} />
                      )}
                      Start Lunch Break
                    </button>
                  </div>
                )}
              </div>

              {!locationVerified ? (
                <div className="flex flex-col items-center gap-4 py-8 px-6 bg-slate-50 rounded-2xl border border-slate-100">
                  <div className="w-14 h-14 bg-primary-50 rounded-full flex items-center justify-center text-primary-500 animate-pulse">
                    <MapPin size={28} />
                  </div>
                  <div className="space-y-1">
                    <p className="text-base font-bold text-slate-700">
                      Location Verification Required
                    </p>
                    <p className="text-xs text-slate-500 leading-relaxed px-4">
                      Please verify your location to punch out for the day.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    fullWidth
                    size="lg"
                    onClick={handleVerifyLocation}
                    isLoading={isVerifying}
                    disabled={isOnBreak}
                    className="rounded-2xl h-14 text-base font-bold shadow-lg shadow-primary-200"
                  >
                    {!isVerifying && <Navigation size={20} className="mr-2" />}
                    {isVerifying ? "Verifying..." : "Verify Location"}
                  </Button>
                </div>
              ) : (
                <div className="space-y-8">
                  <div className="flex items-center justify-between bg-success-50 px-4 py-3 rounded-xl border border-success-100">
                    <div className="flex items-center gap-2 text-success-700">
                      <ShieldCheck size={18} />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Location Verified
                      </span>
                    </div>
                    {timeLeft !== null && (
                      <span
                        className={clsx(
                          "text-xs font-mono font-bold px-2 py-0.5 rounded bg-white shadow-sm border border-slate-100",
                          timeLeft < 60
                            ? "text-danger-500"
                            : "text-primary-600",
                        )}
                      >
                        {Math.floor(timeLeft / 60)}:
                        {String(timeLeft % 60).padStart(2, "0")}s
                      </span>
                    )}
                  </div>

                  <div className="relative mx-auto w-32 h-32">
                    <div className="absolute inset-0 rounded-full border-4 border-dashed border-slate-100 animate-spin-slow" />
                    <button
                      onClick={handleBiometric}
                      disabled={punching || isOnBreak}
                      className={clsx(
                        "absolute inset-2 rounded-full flex items-center justify-center transition-all duration-300 shadow-inner",
                        isOnBreak
                          ? "bg-slate-100 text-slate-300 cursor-not-allowed"
                          : "bg-orange-50 text-orange-600 hover:bg-orange-100",
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
                      Clock Out
                    </h3>
                    <p className="text-sm text-slate-500 px-8 leading-relaxed">
                      {isOnBreak
                        ? "End your lunch break before clocking out."
                        : "End your shift and verify your hours for the day."}
                    </p>
                  </div>

                  <Button
                    variant="secondary"
                    fullWidth
                    size="lg"
                    onClick={handleBiometric}
                    isLoading={punching}
                    disabled={isOnBreak}
                    className={clsx(
                      "rounded-2xl h-14 text-base font-black shadow-lg",
                      isOnBreak && "opacity-50 cursor-not-allowed",
                    )}
                  >
                    {isOnBreak ? "End Break First" : "Verify Punch Out"}
                  </Button>

                  <button
                    onClick={resetVerification}
                    className="text-xs font-bold text-slate-400 hover:text-danger-500 transition-colors"
                  >
                    Re-verify Location
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

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
