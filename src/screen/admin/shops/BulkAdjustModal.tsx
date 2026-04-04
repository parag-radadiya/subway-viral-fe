import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import Dialog from "../../../components/common/Dialog";
import { attendanceApi } from "../../../config/apiCall";
import { toast } from "react-toastify";
import {
  AlertTriangle,
  UserCheck,
  Clock,
  XCircle,
  ChevronRight,
} from "lucide-react";
import { ROUTES } from "../../../utils/routes";

interface Staff {
  _id: string;
  name: string;
  role?: string | { name: string };
}

interface BulkAdjustModalProps {
  isOpen: boolean;
  onClose: () => void;
  shopId: string;
  staff: Staff[];
}

export const BulkAdjustModal = ({
  isOpen,
  onClose,
  shopId,
  staff,
}: BulkAdjustModalProps) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const last7DaysStr = last7Days.toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(last7DaysStr);
  const [toDate, setToDate] = useState(todayStr);

  const [adjustments, setAdjustments] = useState<Record<string, number>>({});
  const [userSummaries, setUserSummaries] = useState<Record<string, any>>({});
  const [unchangedUserIds, setUnchangedUserIds] = useState<Set<string>>(new Set());

  const [submitting, setSubmitting] = useState(false);
  const [unchangedUsers, setUnchangedUsers] = useState<
    { user_id: string; message: string }[] | null
  >(null);
  const [coverageError, setCoverageError] = useState<any | null>(null);
  const [modalTab, setModalTab] = useState<"hours" | "error">("hours");

  const allowProcess = useMemo(() => fromDate && toDate, [fromDate, toDate]);

  // Initialise adjustments when staff list changes
  useEffect(() => {
    const initialAdj: Record<string, number> = {};
    staff.forEach((s) => {
      initialAdj[s._id] = adjustments[s._id] ?? 0;
    });
    setAdjustments(initialAdj);
  }, [staff]);

  // Fetch summary + unchanged users whenever date range changes
  useEffect(() => {
    if (!allowProcess || !isOpen) return;

    const payload = {
      shop_id: shopId,
      from_date: new Date(fromDate).toISOString(),
      to_date: new Date(toDate).toISOString(),
    };

    attendanceApi.getUsersSummary(payload).then((res) => {
      const summaries: any[] = res.data.data.users || [];
      const map: Record<string, any> = {};
      summaries.forEach((u) => { map[u.user_id] = u; });
      setUserSummaries(map);
    }).catch(() => {});

    attendanceApi
      .getUnchangedUsers(payload)
      .then((res) => {
        const users: { user_id: string }[] = res.data.data?.users || [];
        setUnchangedUserIds(new Set(users.map((u) => u.user_id)));
      })
      .catch(() => setUnchangedUserIds(new Set()));
  }, [fromDate, toDate, allowProcess, shopId, isOpen]);

  const handleAdjustmentChange = (userId: string, hours: string) => {
    setAdjustments((prev) => ({ ...prev, [userId]: Number(hours) || 0 }));
  };

  const submitAdjustments = () => {
    if (!fromDate || !toDate) {
      toast.error("Please select a date range first");
      return;
    }

    setSubmitting(true);

    const payload = {
      shop_id: shopId,
      from_date: fromDate,
      to_date: toDate,
      adjustments: staff.map((s) => ({
        user_id: s._id,
        target_hours: adjustments[s._id] || 0,
      })),
    };

    attendanceApi
      .bulkAdjustHours(payload)
      .then(() => {
        toast.success("Bulk target hours adjusted successfully");
        setUnchangedUsers(null);
        setCoverageError(null);
        onClose();
      })
      .catch((err) => {
        const errData = err.response?.data?.data;
        if (
          err.response?.status === 409 &&
          errData?.error_code === "COVERAGE_GAP_AFTER_ADJUSTMENT"
        ) {
          setCoverageError(errData);
          setUnchangedUsers(null);
          setModalTab("error");
        } else if (err.response?.status === 409 && errData?.unchanged_users) {
          setUnchangedUsers(errData.unchanged_users);
          setCoverageError(null);
          toast.warning("Some users could not be updated or were unchanged.");
        } else {
          toast.error(err.response?.data?.message || "Failed to bulk adjust hours");
        }
      })
      .finally(() => setSubmitting(false));
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Bulk Setup Target Hours"
      maxWidth="2xl"
      footer={
        <div className="flex justify-end gap-2 w-full">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button onClick={submitAdjustments} disabled={submitting}>
            {submitting ? "Saving..." : "Submit Adjustments"}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {/* Date pickers */}
        <div className="grid grid-cols-2 gap-4">
          <Input
            type="date"
            label="From Date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
          />
          <Input
            type="date"
            label="To Date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
          />
        </div>

        {/* Tabs */}
        {allowProcess && (
          <div>
            <div className="flex gap-1 bg-slate-100 p-1 rounded-lg mb-4">
              <button
                onClick={() => setModalTab("hours")}
                className={`flex-1 text-xs font-bold py-1.5 px-3 rounded-md transition-all ${
                  modalTab === "hours"
                    ? "bg-white text-slate-800 shadow-sm"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Staff Target Hours
              </button>
              <button
                onClick={() => setModalTab("error")}
                disabled={!coverageError}
                className={`flex-1 text-xs font-bold py-1.5 px-3 rounded-md transition-all ${
                  modalTab === "error" && coverageError
                    ? "bg-red-500 text-white shadow-sm"
                    : coverageError
                      ? "text-red-500 hover:text-red-600"
                      : "text-slate-300 cursor-not-allowed"
                }`}
              >
                {coverageError ? "⚠ Coverage Error" : "Coverage Error"}
              </button>
            </div>

            {/* Tab: Staff Target Hours */}
            {modalTab === "hours" && (
              <div className="space-y-2">
                <label className="text-sm font-bold text-slate-700 block mb-2">
                  Staff Target Hours
                </label>

                {unchangedUsers && unchangedUsers.length > 0 && (
                  <div className="mb-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
                    <div className="flex items-start gap-3">
                      <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={18} />
                      <div>
                        <h4 className="text-sm font-bold text-orange-800 mb-1">
                          Unchanged Users Detected
                        </h4>
                        <p className="text-xs text-orange-600 mb-3">
                          The following personnel records were not modified due to conflicts or
                          missing prior setups:{" "}
                          {unchangedUsers.map((u) => u.user_id).join(", ")}
                        </p>
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={submitAdjustments}
                          className="bg-white border-orange-200 text-orange-700 hover:bg-orange-100"
                        >
                          <UserCheck size={14} className="mr-2" /> Replace &amp; Complete Selection
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100">
                  {staff.map((s) => (
                    <div
                      key={s._id}
                      className={`p-3 flex items-center justify-between transition-colors ${
                        unchangedUserIds.has(s._id)
                          ? "bg-orange-50 hover:bg-orange-100"
                          : "hover:bg-slate-50"
                      }`}
                    >
                      <div>
                        <a
                          href={ROUTES.ADMIN.USERS.DETAILS(s._id)}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-bold text-slate-800 hover:underline hover:text-primary-600 transition-colors"
                        >
                          {s.name}
                        </a>
                        <p className="text-xs text-slate-500 mb-1">
                          {typeof s.role === "string" ? s.role : s.role?.name}
                        </p>
                        {userSummaries[s._id] && (
                          <div className="flex gap-2 mt-1">
                            <span className="text-[9px] font-bold bg-primary-50 text-primary-600 px-1.5 py-0.5 rounded">
                              Worked: {userSummaries[s._id].total_work_hours || 0}h
                            </span>
                            <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded">
                              Shifts: {userSummaries[s._id].records_count || 0}
                            </span>
                          </div>
                        )}
                        {unchangedUserIds.has(s._id) && (
                          <div className="flex items-center gap-1 mt-1">
                            <AlertTriangle size={10} className="text-orange-500" />
                            <span className="text-[9px] font-bold text-orange-600">
                              No target set for this period
                            </span>
                          </div>
                        )}
                      </div>
                      <div className="w-32">
                        <Input
                          type="number"
                          placeholder="Hours"
                          value={adjustments[s._id] || ""}
                          onChange={(e) => handleAdjustmentChange(s._id, e.target.value)}
                          min={0}
                          max={168}
                        />
                      </div>
                    </div>
                  ))}
                  {staff.length === 0 && (
                    <div className="p-8 text-center text-slate-400 text-sm">
                      No staff available for adjustment.
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Tab: Coverage Error */}
            {modalTab === "error" && coverageError && (
              <div className="bg-red-50 border border-red-200 rounded-xl overflow-hidden">
                <div className="flex items-start gap-3 p-4 border-b border-red-200">
                  <XCircle className="text-red-500 shrink-0 mt-0.5" size={18} />
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-red-800 mb-0.5">Coverage Gap Detected</h4>
                    <p className="text-xs text-red-600">{coverageError.summary}</p>
                  </div>
                  <button
                    onClick={() => { setCoverageError(null); setModalTab("hours"); }}
                    className="shrink-0 p-1 rounded-md text-red-400 hover:text-red-600 hover:bg-red-100 transition-colors"
                    title="Dismiss"
                  >
                    <XCircle size={16} />
                  </button>
                </div>

                {/* Stats row */}
                <div className="grid grid-cols-4 divide-x divide-red-200 border-b border-red-200">
                  {[
                    { label: "Required", value: coverageError.required_coverage_hours, color: "text-red-700" },
                    { label: "Covered", value: coverageError.achievable_coverage_hours_after_adjustment, color: "text-orange-600" },
                    { label: "Missing", value: coverageError.total_missing_hours, color: "text-red-700" },
                  ].map(({ label, value, color }) => (
                    <div key={label} className="px-3 py-3 text-center">
                      <p className="text-[10px] font-bold text-red-400 uppercase tracking-widest mb-1">{label}</p>
                      <p className={`text-lg font-black ${color}`}>{value}<span className="text-xs ml-0.5">h</span></p>
                    </div>
                  ))}
                  <div className="px-3 py-3 text-center">
                    <p className="text-[10px] font-bold text-amber-400 uppercase tracking-widest mb-1">Est. Gap</p>
                    <p className="text-lg font-black text-amber-600">
                      {coverageError.expected_missing_if_even_distribution_hours}
                      <span className="text-xs ml-0.5">h</span>
                    </p>
                    <p className="text-[8px] text-amber-400 leading-tight mt-0.5">if even dist.</p>
                  </div>
                </div>

                {/* Gaps list */}
                {coverageError.gaps && coverageError.gaps.length > 0 && (
                  <div className="p-4 border-b border-red-100">
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                      <Clock size={10} /> Uncovered Windows ({coverageError.gaps_count})
                    </p>
                    <div className="space-y-1 max-h-36 overflow-y-auto">
                      {coverageError.gaps.map((gap: any, i: number) => (
                        <div key={i} className="flex items-center justify-between text-[10px] bg-white border border-red-100 rounded px-2 py-1">
                          <span className="font-medium text-slate-600">
                            {new Date(gap.start).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false })} →{" "}
                            {new Date(gap.end).toLocaleString("en-GB", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hour12: false })}
                          </span>
                          <span className="font-black text-red-500 ml-2 shrink-0">
                            {Math.round(gap.minutes / 60)}h {gap.minutes % 60}m
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Solutions */}
                {coverageError.possible_solutions && (
                  <div className="p-4">
                    <p className="text-[10px] font-bold text-red-500 uppercase tracking-widest mb-2">Suggested Actions</p>
                    <ul className="space-y-1.5">
                      {coverageError.possible_solutions.map((sol: string, i: number) => (
                        <li key={i} className="flex items-start gap-1.5 text-[10px] text-red-700">
                          <ChevronRight size={10} className="mt-0.5 shrink-0 text-red-400" />
                          {sol}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => setModalTab("hours")}
                      className="mt-3 text-[10px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
                    >
                      <ChevronRight size={10} className="rotate-180" /> Back to Staff Target Hours
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </Dialog>
  );
};
