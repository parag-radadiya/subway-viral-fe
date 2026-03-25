import { useEffect, useState } from "react";
import { attendanceApi } from "../../../config/apiCall";
import { useAppSelector } from "../../../store";
import { Clock, MapPin, Loader2, Calendar, Search } from "lucide-react";
import { toast } from "react-toastify";
import Input from "../../../components/common/Input";
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
  rota_id?: any;
  auto_punch_out_at?: string;
  punch_out_source?: "Manual" | "Auto";
}

const MyAttendance = () => {
  const { user } = useAppSelector((s) => s.auth);
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (user?.id) {
      attendanceApi
        .list({ user_id: user.id })
        .then(({ data }) => {
          const fetchedRecords = data.data.records || [];
          setRecords(
            fetchedRecords.sort(
              (a: any, b: any) =>
                new Date(b.createdAt).getTime() -
                new Date(a.createdAt).getTime(),
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

  const filteredRecords = records.filter((rec) =>
    (rec.shop_id?.name || "").toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-medium">Fetching attendance history...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">My Attendance</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Your personal punch-in and punch-out history
          </p>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <Input
            placeholder="Search by shop name..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            startIcon={<Search size={16} />}
          />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-auto whitespace-nowrap">
            {filteredRecords.length} Sessions Logged
          </p>
        </div>

        <div className="p-4">
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
                header: "Shift",
                render: (record) => {
                  if (!record.rota_id)
                    return (
                      <span className="text-xs text-slate-400">No Shift</span>
                    );
                  const rota = record.rota_id;
                  const startTime = rota.shift_start
                    ? new Date(rota.shift_start).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "";
                  const endTime = rota.shift_end
                    ? new Date(rota.shift_end).toLocaleTimeString("en-US", {
                        hour: "2-digit",
                        minute: "2-digit",
                        hour12: true,
                      })
                    : "";

                  return (
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-slate-700">
                        {startTime} - {endTime}
                      </span>
                      {rota.role_id?.name && (
                        <span className="text-[9px] text-slate-400 uppercase font-black tracking-tighter">
                          {rota.role_id.name}
                        </span>
                      )}
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
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-slate-300" />
                      <span className="text-sm font-medium text-slate-600">
                        {formatTime(record.punch_in)}
                      </span>
                    </div>
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
                    <div className="flex items-center gap-2">
                      <Clock size={12} className="text-slate-300" />
                      <span className="text-sm font-medium text-slate-600">
                        {formatTime(record.punch_out)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-[10px] font-black uppercase tracking-widest text-orange-600 bg-orange-50 border border-orange-100 px-2 py-0.5 rounded-full">
                      Active
                    </span>
                  );
                },
              },
              {
                header: "Deadline",
                render: (record) => {
                  if (!record.auto_punch_out_at || record.punch_out)
                    return <span className="text-xs text-slate-400">-</span>;
                  return (
                    <div className="flex flex-col">
                      <span className="text-[10px] font-bold text-danger-600 uppercase">
                        Auto Off At
                      </span>
                      <span className="text-sm font-mono font-bold text-danger-500">
                        {new Date(record.auto_punch_out_at).toLocaleTimeString(
                          "en-US",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: true,
                          },
                        )}
                      </span>
                    </div>
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
                    <span className="text-sm font-mono font-bold text-slate-500">
                      {durationStr}
                    </span>
                  );
                },
              },
              {
                header: "Source",
                align: "right",
                render: (record) =>
                  record.punch_out_source === "Auto" ? (
                    <div className="flex flex-col items-end gap-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-red-50 text-red-600 border border-red-100">
                        Auto
                      </span>
                      <span className="text-[9px] text-slate-400 italic">
                        Auto closed by system
                      </span>
                    </div>
                  ) : record.punch_out_source === "Manual" ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-50 text-blue-600 border border-blue-100">
                      Manual
                    </span>
                  ) : null,
              },
            ]}
            data={filteredRecords}
            keyExtractor={(record) => record._id}
            emptyStateMessage="No attendance sessions found."
          />
        </div>
      </div>
    </div>
  );
};

export default MyAttendance;
