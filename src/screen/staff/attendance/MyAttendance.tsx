import { useEffect, useState } from "react";
import { attendanceApi } from "../../../config/apiCall";
import { useAppSelector } from "../../../store";
import { Clock, MapPin, Loader2, Calendar } from "lucide-react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../utils/routes";
import Button from "../../../components/common/Button";
import Table from "../../../components/common/Table";

interface AttendanceRecord {
  _id: string;
  shop_id: any;
  user_id: string;
  punch_in: string;
  punch_out: string | null;
  createdAt: string;
  status: string;
  biometric_verified_in: boolean;
  biometric_verified_out: boolean;
}

const MyAttendance = () => {
  const { user } = useAppSelector((s) => s.auth);
  const navigate = useNavigate();
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      attendanceApi
        .list({ user_id: user.id })
        .then(({ data }) => {
          const fetchedRecords = data.data.records || [];
          setRecords(
            fetchedRecords.sort(
              (a: any, b: any) =>
                new Date(b.punch_in_time).getTime() -
                new Date(a.punch_in_time).getTime(),
            ),
          );
        })
        .catch((err) => {
          console.error("Error fetching attendance:", err);
          toast.error("Failed to load your attendance records.");
        })
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-medium">Fetching attendance records...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-500">
            <Clock size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Attendance</h1>
            <p className="text-sm text-slate-500 mt-0.5">
              View your punch-in and punch-out history
            </p>
          </div>
        </div>
        <Button
          variant="primary"
          onClick={() => navigate(ROUTES.STAFF.MANAGE_ATTENDANCE)}
          className="rounded-lg px-6 py-2.5 shadow-sm text-sm font-bold"
        >
          Punch In / Out
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <Table
          columns={[
            {
              header: "Date",
              render: (record) => {
                const formatDate = (dateStr: string) => {
                  return new Date(dateStr).toLocaleDateString("en-GB", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  });
                };
                return (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                      <Calendar size={16} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      {formatDate(record.createdAt)}
                    </span>
                  </div>
                );
              },
            },
            {
              header: "Shop",
              render: (record) => {
                const shopName = record.shop_id?.name || "Unknown Shop";
                return (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin size={14} className="text-slate-400" />
                    <span className="text-sm font-medium text-slate-700">
                      {shopName}
                    </span>
                  </div>
                );
              },
            },
            {
              header: "Punch In",
              render: (record) => {
                const formatTime = (dateStr: string) => {
                  return new Date(dateStr).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });
                };
                return (
                  <span className="text-sm font-medium text-slate-600">
                    {formatTime(record.punch_in)}
                  </span>
                );
              },
            },
            {
              header: "Punch Out",
              render: (record) => {
                const isPunchedOut = !!record.punch_out;
                const formatTime = (dateStr: string) => {
                  return new Date(dateStr).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                    hour12: true,
                  });
                };
                return isPunchedOut && record.punch_out ? (
                  <span className="text-sm font-medium text-slate-600">
                    {formatTime(record.punch_out)}
                  </span>
                ) : (
                  <span className="text-xs font-bold text-orange-500 bg-orange-50 px-2 py-1 rounded-md">
                    Active
                  </span>
                );
              },
            },
            {
              header: "Duration",
              align: "center",
              render: (record) => {
                let durationStr = "-";
                if (record.punch_out) {
                  const start = new Date(record.punch_in).getTime();
                  const end = new Date(record.punch_out).getTime();
                  const diffMins = Math.floor((end - start) / (1000 * 60));
                  const hours = Math.floor(diffMins / 60);
                  const mins = diffMins % 60;
                  durationStr = `${hours}h ${mins}m`;
                }
                return (
                  <span className="text-sm font-medium text-slate-600">
                    {durationStr}
                  </span>
                );
              },
            },
            {
              header: "Status",
              align: "center",
              render: (record) => (
                record.status === "Present" ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-success-100 text-success-700">
                    Present
                  </span>
                ) : record.status === "Late" ? (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-warning-100 text-warning-700">
                    Late
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700">
                    {record.status || "Completed"}
                  </span>
                )
              ),
            },
          ]}
          data={records}
          keyExtractor={(record) => record._id}
          emptyStateMessage="No attendance records found."
        />
      </div>
    </div>
  );
};

export default MyAttendance;
