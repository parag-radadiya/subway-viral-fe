import { useEffect, useState } from "react";
import { attendanceApi } from "../../../config/apiCall";
import { MapPin, Loader2, Clock, SlidersHorizontal } from "lucide-react";
import { toast } from "react-toastify";
import Table from "../../../components/common/Table";
import Button from "../../../components/common/Button";
import { UserAdjustHoursModal } from "./UserAdjustHoursModal";

interface AttendanceRecord {
  _id: string;
  shop_id: { _id: string; name: string };
  user_id: any;
  punch_in: string;
  punch_out: string | null;
  createdAt: string;
  status: string;
}

export const UserAttendanceSection = ({
  userId,
  userName,
}: {
  userId: string;
  userName?: string;
}) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [adjustModalOpen, setAdjustModalOpen] = useState(false);

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchAttendance();
  }, [userId, page, limit]);

  const fetchAttendance = () => {
    setLoading(true);
    attendanceApi
      .list({
        user_id: userId,
        page: page.toString(),
        limit: limit.toString(),
      })
      .then(({ data }) => {
        const resultData = data.data;
        const fetchedRecords = resultData.records || resultData.data || [];
        setRecords(
          fetchedRecords.sort(
            (a: any, b: any) =>
              new Date(b.punch_in).getTime() - new Date(a.punch_in).getTime(),
          ),
        );
        setTotal(resultData.total || fetchedRecords.length || 0);
        setTotalPages(resultData.total_pages || resultData.totalPages || 1);
      })
      .catch((err) => {
        console.error("Error fetching attendance:", err);
        toast.error(err.message || "Failed to load attendance records.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-6">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600">
            <Clock size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Attendance Log
            </h2>
            <p className="text-xs text-slate-500">
              Recent punch records and shifts
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="secondary"
          onClick={() => setAdjustModalOpen(true)}
        >
          <SlidersHorizontal size={14} className="mr-1.5" />
          Adjust Hours
        </Button>
      </div>

      <div className="p-4">
        {loading && records.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-slate-400">
            <Loader2 className="animate-spin mb-4 text-primary-500" size={32} />
            <p className="text-sm font-bold uppercase tracking-widest">
              Fetching records...
            </p>
          </div>
        ) : (
          <Table<AttendanceRecord>
            columns={[
              {
                header: "Location",
                render: (record) => (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin size={14} className="text-slate-400" />
                    <span className="text-xs font-medium text-slate-700">
                      {record.shop_id?.name || "Unknown Shop"}
                    </span>
                  </div>
                ),
              },
              {
                header: "Punch In",
                render: (record) => (
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-slate-700">
                      {formatTime(record.punch_in)}
                    </span>
                    <span className="text-[10px] text-slate-400">
                      {formatDate(record.punch_in)}
                    </span>
                  </div>
                ),
              },
              {
                header: "Punch Out",
                render: (record) =>
                  record.punch_out ? (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">
                        {formatTime(record.punch_out)}
                      </span>
                      <span className="text-[10px] text-slate-400">
                        {formatDate(record.punch_out)}
                      </span>
                    </div>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-50 text-orange-500 border border-orange-100">
                      Active Shift
                    </span>
                  ),
              },
              {
                header: "Duration",
                align: "center",
                render: (record) => {
                  if (!record.punch_out)
                    return <span className="text-slate-300">--</span>;
                  const start = new Date(record.punch_in).getTime();
                  const end = new Date(record.punch_out).getTime();
                  const diffMins = Math.floor((end - start) / (1000 * 60));
                  const hours = Math.floor(diffMins / 60);
                  const mins = diffMins % 60;
                  return (
                    <span className="text-xs font-semibold text-slate-600">
                      {hours}h {mins}m
                    </span>
                  );
                },
              },
              {
                header: "Status",
                align: "center",
                render: (record) => {
                  const status =
                    record.status ||
                    (record.punch_out ? "Completed" : "In Progress");
                  const isSuccess =
                    status === "Present" || status === "Completed";
                  return (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isSuccess
                          ? "bg-success-100 text-success-700"
                          : "bg-warning-100 text-warning-700"
                      }`}
                    >
                      {status}
                    </span>
                  );
                },
              },
            ]}
            data={records}
            keyExtractor={(record) => record._id}
            emptyStateMessage="No attendance records found for this user."
            pagination={{
              page,
              limit,
              total,
              totalPages,
              onPageChange: setPage,
              onLimitChange: (newLimit) => {
                setLimit(newLimit);
                setPage(1);
              },
            }}
          />
        )}
      </div>

      <UserAdjustHoursModal
        isOpen={adjustModalOpen}
        onClose={() => setAdjustModalOpen(false)}
        userId={userId}
        userName={userName}
      />
    </div>
  );
};
