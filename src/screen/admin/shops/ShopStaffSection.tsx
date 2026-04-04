import { useEffect, useState } from "react";
import Button from "../../../components/common/Button";
import Table from "../../../components/common/Table";
import { usersApi } from "../../../config/apiCall";
import { toast } from "react-toastify";
import { Users, Calendar, Shield } from "lucide-react";
import { BulkAdjustModal } from "./BulkAdjustModal";

interface Staff {
  _id: string;
  name: string;
  email: string;
  role?: string | { name: string };
  phone_code?: string;
  phone_num?: string;
  is_active?: boolean;
}

export const ShopStaffSection = ({ shopId }: { shopId: string }) => {
  const [staff, setStaff] = useState<Staff[]>([]);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isBulkModalOpen, setIsBulkModalOpen] = useState(false);

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
      })
      .catch(() => toast.error("Failed to load staff assigned to this shop"));
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden mt-6">
      {/* Header */}
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
        <Button onClick={() => setIsBulkModalOpen(true)}>
          <Calendar size={16} className="mr-2" />
          Bulk Adjust
        </Button>
      </div>

      {/* Staff table */}
      <div className="p-4">
        <Table<Staff>
          columns={[
            {
              header: "Name & Email",
              render: (u) => (
                <div>
                  <p className="text-sm font-semibold text-slate-700">
                    {u.name}
                  </p>
                  <p className="text-[10px] text-slate-400 font-medium">
                    {u.email}
                  </p>
                </div>
              ),
            },
            {
              header: "Phone",
              accessor: "phone_num",
              render: (u) => (
                <p className="text-sm text-slate-600">
                  {`${u.phone_code ?? ""} ${u.phone_num ?? ""}`.trim() || "-"}
                </p>
              ),
            },
            {
              header: "Role",
              align: "center",
              render: (u) => {
                const roleName =
                  typeof u.role === "string" ? u.role : u.role?.name || "Staff";
                return (
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${getRoleBadgeColor(roleName)}`}
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
              render: (u) => (
                <span
                  className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${
                    u.is_active !== false
                      ? "bg-green-100 text-green-700"
                      : "bg-slate-100 text-slate-500"
                  }`}
                >
                  {u.is_active !== false ? "Active" : "Inactive"}
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

      {/* Bulk Adjust Modal (self-contained) */}
      <BulkAdjustModal
        isOpen={isBulkModalOpen}
        onClose={() => setIsBulkModalOpen(false)}
        shopId={shopId}
        staff={staff}
      />
    </div>
  );
};
