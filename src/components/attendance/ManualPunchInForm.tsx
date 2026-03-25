import { useState, useEffect, useCallback } from "react";
import { attendanceApi, usersApi, shopsApi } from "../../config/apiCall";
import { toast } from "react-toastify";
import Button from "../common/Button";
import Select from "../common/Select";
import { format } from "date-fns";
import { Check, Clock, Loader2, AlertCircle } from "lucide-react";
import clsx from "clsx";

interface ManualPunchInFormProps {
  onSuccess: () => void;
}

const ManualPunchInForm = ({ onSuccess }: ManualPunchInFormProps) => {
  const [users, setUsers] = useState<any[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [selectedShopId, setSelectedShopId] = useState("");
  const [eligibleRotas, setEligibleRotas] = useState<any[]>([]);
  const [selectedRotaId, setSelectedRotaId] = useState<string | null>(null);
  const [loadingData, setLoadingData] = useState(true);
  const [loadingRotas, setLoadingRotas] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoadingData(true);
      try {
        const [usersRes, shopsRes] = await Promise.all([
          usersApi.list(),
          shopsApi.list(),
        ]);
        setUsers(usersRes.data.data?.users || usersRes.data?.users || []);
        setShops(shopsRes.data.data.shops || []);
      } catch (err: any) {
        console.error("Error fetching form data:", err);
        toast.error(err.message || "Failed to load staff or shop lists.");
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, []);

  const fetchEligibleRotas = useCallback(async (userId: string, shopId: string) => {
    if (!userId || !shopId) {
      setEligibleRotas([]);
      setSelectedRotaId(null);
      return;
    }

    setLoadingRotas(true);
    try {
      const res = await attendanceApi.eligibleRotas(shopId, userId);
      const rotas = res.data.data.rotas || [];
      const count = res.data.data.count || 0;
      setEligibleRotas(rotas);
      if (count === 1) {
        setSelectedRotaId(rotas[0]._id);
      } else {
        setSelectedRotaId(null);
      }
    } catch (err: any) {
      console.error("Error fetching eligible rotas:", err);
      toast.error(err.message || "Failed to fetch eligible shifts.");
    } finally {
      setLoadingRotas(false);
    }
  }, []);

  useEffect(() => {
    if (selectedUserId && selectedShopId) {
      fetchEligibleRotas(selectedUserId, selectedShopId);
    } else {
      setEligibleRotas([]);
      setSelectedRotaId(null);
    }
  }, [selectedUserId, selectedShopId, fetchEligibleRotas]);

  const handleSubmit = async () => {
    if (!selectedUserId || !selectedShopId) {
      toast.error("Please select both a staff member and a shop.");
      return;
    }

    setSubmitting(true);
    try {
      await attendanceApi.manualPunchIn({
        user_id: selectedUserId,
        shop_id: selectedShopId,
        rota_id: selectedRotaId || undefined,
      });
      toast.success("Staff member punched in successfully!");
      onSuccess();
    } catch (err: any) {
      console.error("Error performing manual punch-in:", err);
      toast.error(err.message || "Manual punch-in failed.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-medium">Loading form data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
              Select Staff Member
            </label>
            <Select
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full"
            >
              <option value="">Choose an employee...</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name} ({u.email})
                </option>
              ))}
            </Select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">
              Select Location
            </label>
            <Select
              value={selectedShopId}
              onChange={(e) => setSelectedShopId(e.target.value)}
              className="w-full"
            >
              <option value="">Choose a shop...</option>
              {shops.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </Select>
          </div>
        </div>

        {(selectedUserId && selectedShopId) && (
          <div className="pt-4 border-t border-slate-100 space-y-4">
            <div className="flex items-center justify-between px-1">
              <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Eligible Shift (Linkage)
              </p>
              {loadingRotas && (
                <Loader2 className="animate-spin text-primary-500" size={14} />
              )}
            </div>

            {eligibleRotas.length === 0 && !loadingRotas ? (
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-2xl flex items-start gap-3 text-left">
                <AlertCircle className="text-amber-500 shrink-0 mt-0.5" size={18} />
                <div className="space-y-1">
                  <p className="text-sm font-bold text-amber-600">
                    No Scheduled Shift
                  </p>
                  <p className="text-xs text-amber-600 leading-relaxed">
                    This staff member has no scheduled shifts at this location center right now. 
                    You can still proceed with a manual punch-in, but it won't be linked to a rota.
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
                        : "bg-slate-50 border-slate-100 hover:border-slate-200"
                    )}
                  >
                    <div
                      className={clsx(
                        "w-5 h-5 rounded-full border flex items-center justify-center shrink-0",
                        selectedRotaId === rota._id
                          ? "bg-primary-500 border-primary-500 text-white"
                          : "bg-white border-slate-200"
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
                      <p className="text-[11px] text-slate-500">
                        {format(new Date(rota.shift_date), "EEEE, dd MMMM")}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="pt-4">
        <Button
          variant="primary"
          fullWidth
          size="lg"
          onClick={handleSubmit}
          isLoading={submitting}
          disabled={!selectedUserId || !selectedShopId}
          className="rounded-2xl h-14 text-base font-black shadow-lg"
        >
          {!submitting && <Clock size={18} className="mr-2" />}
          Perform Manual Punch-In
        </Button>
      </div>

      <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex gap-3">
        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center text-slate-400 shadow-sm shrink-0">
          <AlertCircle size={16} />
        </div>
        <p className="text-[11px] text-slate-500 leading-normal">
          Manual punch-ins bypass geofencing and biometric verification. They are logged as "Manual" and should only be used for administrative adjustments.
        </p>
      </div>
    </div>
  );
};

export default ManualPunchInForm;
