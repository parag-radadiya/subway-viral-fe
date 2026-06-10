import { useEffect, useState } from "react";
import { attendanceApi, shopsApi, usersApi } from "../../config/apiCall";
import { MapPin, Loader2, Clock } from "lucide-react";
import { toast } from "react-toastify";
import Table from "../common/Table";
import Select from "../common/Select";
import Button from "../common/Button";
import WorkedHoursScreen from "./WorkedHoursScreen";
import { format } from "date-fns";

interface AttendanceRecord {
  _id: string;
  shop_id: any;
  user_id: any;
  punch_in: string;
  punch_out: string | null;
  createdAt: string;
  status: string;
}

interface AttendanceListContainerProps {
  title?: string;
  subtitle?: string;
}

const AttendanceListContainer = ({
  title = "Attendance Management",
  subtitle = "Monitor and audit all personnel punch records across locations",
}: AttendanceListContainerProps) => {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [shops, setShops] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showWorkedHours, setShowWorkedHours] = useState(false);

  // Filter state
  const [activeFilters, setActiveFilters] = useState({
    shop_id: "all",
    user_id: "all",
  });

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchInitialData = () => {
      Promise.all([shopsApi.list(), usersApi.list()])
        .then(([shopsRes, usersRes]) => {
          setShops(shopsRes.data.data.shops || []);
          setUsers(usersRes.data.data?.users || usersRes.data?.users || []);
        })
        .catch((err) => {
          console.error("Error fetching filters data:", err);
          toast.error(err.message || "Failed to load filter data.");
        });
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    const fetchAttendance = () => {
      setLoading(true);
      const query: Record<string, string> = {
        page: page.toString(),
        limit: limit.toString(),
      };
      if (activeFilters.shop_id !== "all")
        query.shop_id = activeFilters.shop_id;
      if (activeFilters.user_id !== "all")
        query.user_id = activeFilters.user_id;

      attendanceApi
        .list(query)
        .then(({ data }) => {
          const resultData = data.data;
          const fetchedRecords = resultData.records || resultData.data || [];
          setRecords(
            fetchedRecords.sort(
              (a: any, b: any) =>
                new Date(b.punch_in).getTime() - new Date(a.punch_in).getTime(),
            ),
          );
          setTotal(resultData.total || 0);
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
    fetchAttendance();
  }, [activeFilters, page, limit]);

  const hasActiveFilters =
    activeFilters.shop_id !== "all" || activeFilters.user_id !== "all";

  const clearFilters = () => {
    setActiveFilters({ shop_id: "all", user_id: "all" });
  };

  const formatTime = (dateStr: string) => {
    return format(new Date(dateStr), "HH:mm");
  };

  const formatDate = (dateStr: string) => {
    return format(dateStr, "dd MMM yyyy");
  };

  if (showWorkedHours) {
    return <WorkedHoursScreen onBack={() => setShowWorkedHours(false)} />;
  }

  if (loading && records.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="animate-spin mb-4 text-primary-500" size={32} />
        <p className="text-sm font-black uppercase tracking-widest">
          Synchronizing Attendance...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            {title}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>
        </div>
        <Button
          variant="secondary"
          size="sm"
          leftIcon={<Clock size={14} />}
          onClick={() => setShowWorkedHours(true)}
        >
          View Worked Hours
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-3">
            <Select
              value={activeFilters.shop_id}
              onChange={(e) =>
                setActiveFilters({ ...activeFilters, shop_id: e.target.value })
              }
            >
              <option value="all">All Shops</option>
              {shops.map((shop) => (
                <option key={shop._id} value={shop._id}>
                  {shop.name}
                </option>
              ))}
            </Select>

            <Select
              value={activeFilters.user_id}
              onChange={(e) =>
                setActiveFilters({ ...activeFilters, user_id: e.target.value })
              }
            >
              <option value="all">All Employees</option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </Select>

            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="text-[10px] font-black text-danger-500 hover:text-danger-600 uppercase tracking-widest px-2 transition-colors"
                title="Clear all filters"
              >
                Clear
              </button>
            )}
          </div>

          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-auto">
            {records.length} Recorded Shifts
          </p>
        </div>

        <div className="p-4">
          <Table
            columns={[
              {
                header: "Personnel",
                render: (record) => (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center font-black text-[10px]">
                      {(record.user_id?.name || "U").slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {record.user_id?.name || "Unknown"}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {record.user_id?.email}
                      </p>
                    </div>
                  </div>
                ),
              },
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
            emptyStateMessage="No attendance records found."
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
        </div>
      </div>
    </div>
  );
};

export default AttendanceListContainer;
