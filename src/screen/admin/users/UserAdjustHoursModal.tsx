import { useEffect, useState } from "react";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import Dialog from "../../../components/common/Dialog";
import { attendanceApi } from "../../../config/apiCall";
import { toast } from "react-toastify";
import {
  Clock,
  TrendingUp,
  TrendingDown,
  Minus,
  CheckCircle,
  AlertTriangle,
  Loader2,
} from "lucide-react";

interface UserAdjustHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName?: string;
}

interface PreviewRow {
  date: string;
  original_hours: number;
  adjusted_hours: number;
  delta: number;
}

interface PreviewData {
  user_id: string;
  from_date: string;
  to_date: string;
  target_hours: number;
  current_total_hours: number;
  projected_total_hours: number;
  delta_hours: number;
  rows?: PreviewRow[];
  summary?: string;
  [key: string]: any;
}

export const UserAdjustHoursModal = ({
  isOpen,
  onClose,
  userId,
  userName,
}: UserAdjustHoursModalProps) => {
  const todayStr = new Date().toISOString().split("T")[0];
  const last7Days = new Date();
  last7Days.setDate(last7Days.getDate() - 7);
  const last7DaysStr = last7Days.toISOString().split("T")[0];

  // Form state
  const [fromDate, setFromDate] = useState(last7DaysStr);
  const [toDate, setToDate] = useState(todayStr);
  const [targetHours, setTargetHours] = useState<string>("");
  const [note, setNote] = useState("");

  // Summary (fetched from getUsersSummary)
  const [userSummary, setUserSummary] = useState<any>(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Preview state
  const [previewData, setPreviewData] = useState<PreviewData | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  // Apply state
  const [applying, setApplying] = useState(false);

  // Step
  const [step, setStep] = useState<"form" | "preview">("form");

  // Reset on open/close
  useEffect(() => {
    if (!isOpen) {
      setStep("form");
      setPreviewData(null);
      setTargetHours("");
      setNote("");
      setUserSummary(null);
    }
  }, [isOpen]);

  // Fetch summary whenever dates change
  useEffect(() => {
    if (!isOpen || !fromDate || !toDate) return;

    setLoadingSummary(true);
    attendanceApi
      .getUsersSummary({
        user_id: userId,
        from_date: new Date(fromDate).toISOString(),
        to_date: new Date(toDate).toISOString(),
      })
      .then((res) => {
        const users: any[] = res.data?.data?.users || [];
        const found = users.find((u: any) => u.user_id === userId) || users[0] || null;
        setUserSummary(found);
      })
      .catch(() => setUserSummary(null))
      .finally(() => setLoadingSummary(false));
  }, [fromDate, toDate, isOpen, userId]);

  const handlePreview = () => {
    if (!fromDate || !toDate || !targetHours) {
      toast.error("Please fill in all required fields.");
      return;
    }
    setLoadingPreview(true);
    attendanceApi
      .adjustHoursPreview({
        user_id: userId,
        from_date: fromDate,
        to_date: toDate,
        target_hours: Number(targetHours),
      })
      .then((res) => {
        const data = res.data?.data || res.data;
        setPreviewData(data);
        setStep("preview");
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to fetch preview.");
      })
      .finally(() => setLoadingPreview(false));
  };

  const handleApply = () => {
    setApplying(true);
    attendanceApi
      .adjustHoursApply({
        user_id: userId,
        from_date: fromDate,
        to_date: toDate,
        target_hours: Number(targetHours),
        note: note.trim() || undefined,
      })
      .then(() => {
        toast.success("Attendance hours adjusted successfully.");
        onClose();
      })
      .catch((err) => {
        toast.error(err.response?.data?.message || "Failed to apply adjustment.");
      })
      .finally(() => setApplying(false));
  };

  const deltaColor = (delta: number) => {
    if (delta > 0) return "text-emerald-600";
    if (delta < 0) return "text-red-500";
    return "text-slate-400";
  };

  const DeltaIcon = ({ delta }: { delta: number }) => {
    if (delta > 0) return <TrendingUp size={14} className="shrink-0" />;
    if (delta < 0) return <TrendingDown size={14} className="shrink-0" />;
    return <Minus size={14} className="shrink-0" />;
  };

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Adjust Attendance Hours"
      maxWidth="xl"
      footer={
        <div className="flex justify-between items-center w-full gap-2">
          {step === "preview" && (
            <Button
              variant="ghost"
              onClick={() => setStep("form")}
              disabled={applying}
            >
              ← Back
            </Button>
          )}
          <div className="flex gap-2 ml-auto">
            <Button variant="ghost" onClick={onClose} disabled={applying}>
              Cancel
            </Button>
            {step === "form" ? (
              <Button onClick={handlePreview} disabled={loadingPreview || !fromDate || !toDate || !targetHours}>
                {loadingPreview ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 size={14} className="animate-spin" /> Previewing…
                  </span>
                ) : (
                  "Preview Changes"
                )}
              </Button>
            ) : (
              <Button onClick={handleApply} disabled={applying}>
                {applying ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 size={14} className="animate-spin" /> Applying…
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5">
                    <CheckCircle size={14} /> Confirm & Apply
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      }
    >
      {step === "form" && (
        <div className="space-y-5">
          {/* User info banner */}
          {userName && (
            <div className="flex items-center gap-3 bg-primary-50 border border-primary-100 rounded-xl px-4 py-3">
              <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-black text-sm shrink-0">
                {userName.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{userName}</p>
                <p className="text-xs text-primary-500">Single-user adjustment</p>
              </div>
            </div>
          )}

          {/* Date range */}
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

          {/* Current hours summary */}
          {loadingSummary ? (
            <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
              <Loader2 size={12} className="animate-spin" /> Loading current stats…
            </div>
          ) : userSummary ? (
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
                <Clock size={16} className="text-primary-500 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Worked</p>
                  <p className="text-base font-black text-slate-800">
                    {userSummary.total_work_hours ?? userSummary.total_hours ?? 0}
                    <span className="text-xs font-medium ml-0.5">h</span>
                  </p>
                </div>
              </div>
              <div className="bg-slate-50 border border-slate-100 rounded-xl p-3 flex items-center gap-3">
                <Clock size={16} className="text-orange-400 shrink-0" />
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Shifts</p>
                  <p className="text-base font-black text-slate-800">
                    {userSummary.records_count ?? userSummary.shift_count ?? 0}
                  </p>
                </div>
              </div>
            </div>
          ) : null}

          {/* Target hours */}
          <Input
            type="number"
            label="Target Hours"
            placeholder="e.g. 40"
            value={targetHours}
            onChange={(e) => setTargetHours(e.target.value)}
            min={0}
            max={744}
          />

          {/* Note */}
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1">
              Note <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm text-slate-700 resize-none focus:outline-none focus:ring-2 focus:ring-primary-300 transition"
              rows={2}
              placeholder="Payroll adjustment, manual correction…"
              value={note}
              onChange={(e) => setNote(e.target.value)}
            />
          </div>
        </div>
      )}

      {step === "preview" && previewData && (
        <div className="space-y-4">
          {/* Summary stat cards */}
          <div className="grid grid-cols-3 gap-3">
            {[
              {
                label: "Current",
                value: previewData.current_total_hours ?? previewData.total_work_hours,
                color: "text-slate-700",
                bg: "bg-slate-50 border-slate-100",
              },
              {
                label: "Target",
                value: previewData.target_hours ?? Number(targetHours),
                color: "text-primary-700",
                bg: "bg-primary-50 border-primary-100",
              },
              {
                label: "Delta",
                value: previewData.delta_hours,
                color: deltaColor(previewData.delta_hours ?? 0),
                bg:
                  (previewData.delta_hours ?? 0) > 0
                    ? "bg-emerald-50 border-emerald-100"
                    : (previewData.delta_hours ?? 0) < 0
                      ? "bg-red-50 border-red-100"
                      : "bg-slate-50 border-slate-100",
              },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`border rounded-xl p-3 text-center ${bg}`}>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">
                  {label}
                </p>
                <p className={`text-xl font-black ${color}`}>
                  {value ?? "—"}
                  <span className="text-xs ml-0.5">h</span>
                </p>
              </div>
            ))}
          </div>

          {/* Summary message */}
          {previewData.summary && (
            <div className="flex items-start gap-2 bg-amber-50 border border-amber-100 rounded-xl px-4 py-3">
              <AlertTriangle size={15} className="text-amber-500 shrink-0 mt-0.5" />
              <p className="text-xs text-amber-700">{previewData.summary}</p>
            </div>
          )}

          {/* Per-record breakdown table */}
          {previewData.rows && previewData.rows.length > 0 ? (
            <div className="border border-slate-100 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-100">
                    <th className="text-left px-3 py-2 font-bold text-slate-500 uppercase tracking-widest text-[10px]">
                      Date
                    </th>
                    <th className="text-right px-3 py-2 font-bold text-slate-500 uppercase tracking-widest text-[10px]">
                      Original
                    </th>
                    <th className="text-right px-3 py-2 font-bold text-slate-500 uppercase tracking-widest text-[10px]">
                      Adjusted
                    </th>
                    <th className="text-right px-3 py-2 font-bold text-slate-500 uppercase tracking-widest text-[10px]">
                      Δ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {previewData.rows.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50 transition-colors">
                      <td className="px-3 py-2 text-slate-600 font-medium">
                        {new Date(row.date).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td className="px-3 py-2 text-right text-slate-400">
                        {row.original_hours}h
                      </td>
                      <td className="px-3 py-2 text-right font-bold text-slate-700">
                        {row.adjusted_hours}h
                      </td>
                      <td className={`px-3 py-2 text-right font-black flex items-center justify-end gap-1 ${deltaColor(row.delta)}`}>
                        <DeltaIcon delta={row.delta} />
                        {row.delta > 0 ? "+" : ""}
                        {row.delta}h
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            /* Flat summary if no rows returned */
            <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center">
              <p className="text-sm font-bold text-slate-700 mb-1">
                Adjustment Preview
              </p>
              <p className="text-xs text-slate-500">
                Hours will be adjusted from{" "}
                <span className="font-bold">
                  {previewData.current_total_hours ?? "—"}h
                </span>{" "}
                →{" "}
                <span className="font-bold text-primary-600">
                  {previewData.target_hours ?? Number(targetHours)}h
                </span>{" "}
                over the selected period.
              </p>
            </div>
          )}
        </div>
      )}
    </Dialog>
  );
};
