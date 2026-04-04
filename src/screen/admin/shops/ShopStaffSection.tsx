import { useEffect, useState } from "react";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import Dialog from "../../../components/common/Dialog";
import Table from "../../../components/common/Table";
import { usersApi, attendanceApi } from "../../../config/apiCall";
import { toast } from "react-toastify";
import {
  Users,
  Calendar,
  AlertTriangle,
  UserCheck,
  Shield,
} from "lucide-react";

interface Staff {
  _id: string;
  name: string;
  email: string;
  role?: string | { name: string };
  target_hours?: number;
  phone_code?: string;
  phone_num?: string;
  is_active?: boolean;
}

export const ShopStaffSection = ({ shopId }: { shopId: string }) => {
  const [staff, setStaff] = useState<Staff[]>([]);

  // Pagination states
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [adjustments, setAdjustments] = useState<Record<string, number>>({});

  const [submitting, setSubmitting] = useState(false);
  const [unchangedUsers, setUnchangedUsers] = useState<
    { user_id: string; message: string }[] | null
  >(null);

  const getRoleBadgeColor = (role: string) => {
    switch (role.toLowerCase()) {
      case "root":
        return "bg-purple-100 text-purple-700";
      case "admin":
        return "bg-danger-100 text-danger-700";
      case "manager":
        return "bg-primary-100 text-primary-700";
      case "sub-manager":
        return "bg-accent-100 text-accent-700";
      default:
        return "bg-slate-100 text-slate-700";
    }
  };

  useEffect(() => {
    fetchStaff();
  }, [shopId, page, limit]);

  const fetchStaff = () => {
    usersApi
      .getStaffByShop(shopId, {
        page: page.toString(),
        limit: limit.toString(),
      })
      .then((res) => {
        const data = res.data.data;
        setStaff(data.users || []);
        setTotal(data.total || 0);
        setTotalPages(data.total_pages || data.totalPages || 1);

        // Initialize default target hours to 40 or what they have
        const initialAdj: Record<string, number> = {};
        (data.users || []).forEach((u: Staff) => {
          initialAdj[u._id] = 40;
        });
        setAdjustments(initialAdj);
      })
      .catch(() => {
        toast.error("Failed to load staff assigned to this shop");
      });
  };

  const handleAdjustmentChange = (userId: string, hours: string) => {
    setAdjustments((prev) => ({
      ...prev,
      [userId]: Number(hours) || 0,
    }));
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
        setIsBulkModalOpen(false);
        setUnchangedUsers(null);
      })
      .catch((err) => {
        if (
          err.response?.status === 409 &&
          err.response?.data?.data?.unchanged_users
        ) {
          setUnchangedUsers(err.response.data.data.unchanged_users);
          toast.warning("Some users could not be updated or were unchanged.");
        } else {
          toast.error(
            err.response?.data?.message || "Failed to bulk adjust hours",
          );
        }
      })
      .finally(() => setSubmitting(false));
  };

  const handleDetailedAdd = () => {
    // Retry with complete selection - "allow one-click add"
    // Usually means skipping or forcing them.
    // We'll retry without unchanged check (or just send same payload as it normally overrides if passed correctly).
    // It's possible the backend API needs a `force: true` or we just submit.
    submitAdjustments();
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-6">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent-100 flex items-center justify-center text-accent-600">
            <Users size={18} />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800">
              Assigned Staff
            </h2>
            <p className="text-xs text-slate-500">
              Manage personnel and assignments
            </p>
          </div>
        </div>
        <Button size="sm" onClick={() => setIsBulkModalOpen(true)}>
          <Calendar size={16} className="mr-2" />
          Bulk Adjust
        </Button>
      </div>

      <div className="p-4">
        <Table<Staff>
          columns={[
            {
              header: "Name & Email",
              render: (userItem) => (
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {userItem.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {userItem.email}
                  </p>
                </div>
              ),
            },
            {
              header: "Phone",
              accessor: "phone_num",
              render: (userItem) => (
                <p className="text-sm text-slate-600">
                  {`${userItem.phone_code} ${userItem.phone_num}`.trim() || "-"}
                </p>
              ),
            },
            {
              header: "Role",
              align: "center",
              render: (userItem) => {
                const roleName =
                  typeof userItem.role === "string"
                    ? userItem.role
                    : userItem.role?.name || "Staff";
                return (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${getRoleBadgeColor(
                      roleName,
                    )}`}
                  >
                    <Shield size={10} className="mr-1" />
                    {roleName}
                  </span>
                );
              },
            },
            {
              header: "Status",
              align: "center",
              render: (userItem) => (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                    userItem.is_active !== false
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {userItem.is_active !== false ? "Active" : "Inactive"}
                </span>
              ),
            },
          ]}
          data={staff}
          keyExtractor={(item) => item._id}
          emptyStateMessage="No staff members assigned to this shop yet."
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

      <Dialog
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        title="Bulk Setup Target Hours"
        maxWidth="2xl"
        footer={
          <div className="flex justify-end gap-2 w-full">
            <Button variant="ghost" onClick={() => setIsBulkModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={submitAdjustments} disabled={submitting}>
              {submitting ? "Saving..." : "Submit Adjustments"}
            </Button>
          </div>
        }
      >
        <div className="space-y-6">
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

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-700 block mb-2">
              Staff Target Hours
            </label>
            {unchangedUsers && unchangedUsers.length > 0 && (
              <div className="mb-4 bg-orange-50 border border-orange-200 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertTriangle
                    className="text-orange-500 shrink-0 mt-0.5"
                    size={18}
                  />
                  <div>
                    <h4 className="text-sm font-bold text-orange-800 mb-1">
                      Unchanged Users Detected
                    </h4>
                    <p className="text-xs text-orange-600 mb-3">
                      The following personnel records were not modified due to
                      conflicts or missing prior setups:
                      {unchangedUsers.map((u) => u.user_id).join(", ")}
                    </p>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleDetailedAdd}
                      className="bg-white border-orange-200 text-orange-700 hover:bg-orange-100"
                    >
                      <UserCheck size={14} className="mr-2" /> Replace &
                      Complete Selection
                    </Button>
                  </div>
                </div>
              </div>
            )}
            <div className="max-h-60 overflow-y-auto border border-slate-100 rounded-xl divide-y divide-slate-100">
              {staff.map((s) => (
                <div
                  key={s._id}
                  className="p-3 flex items-center justify-between hover:bg-slate-50 transition-colors"
                >
                  <div>
                    <p className="text-sm font-bold text-slate-800">{s.name}</p>
                    <p className="text-xs text-slate-500">
                      {typeof s.role === "string" ? s.role : s.role?.name}
                    </p>
                  </div>
                  <div className="w-32">
                    <Input
                      type="number"
                      placeholder="Hours"
                      value={adjustments[s._id] || ""}
                      onChange={(e) =>
                        handleAdjustmentChange(s._id, e.target.value)
                      }
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
        </div>
      </Dialog>
    </div>
  );
};
