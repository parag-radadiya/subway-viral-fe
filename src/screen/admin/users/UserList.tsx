import {
  Edit,
  Eye,
  Loader2,
  MapPin,
  Plus,
  Search,
  Shield,
  Trash2,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import Button from "../../../components/common/Button";
import Dialog from "../../../components/common/Dialog";
import Input from "../../../components/common/Input";
import Table from "../../../components/common/Table";
import { usersApi } from "../../../config/apiCall";
import { ROUTES } from "../../../utils/routes";

type FinalUser = {
  _id: string;
  name: string;
  email: string;
  assigned_shop_ids: string[];
  role_id: { role_name: string };
  phone_code: string;
  phone_num: string;
};
const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<FinalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // Delete confirm state
  const [deleteTarget, setDeleteTarget] = useState<FinalUser | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchUsers = () => {
    setLoading(true);
    usersApi
      .list({ page: page.toString(), limit: limit.toString() })
      .then(({ data }) => {
        const resultData = data.data;
        setUsers(resultData.users || []);
        setTotal(resultData.total || 0);
        setTotalPages(resultData.total_pages || resultData.totalPages || 1);
      })
      .catch((err) => {
        console.error(err);
        toast.error(err.message || "Failed to fetch users");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, [page, limit]);

  const handleDelete = () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    usersApi
      .remove(deleteTarget._id)
      .then(() => {
        toast.success("User deleted successfully");
        setDeleteTarget(null);
        fetchUsers();
      })
      .catch((error: any) => {
        toast.error(error.message || "Failed to delete user");
      })
      .finally(() => {
        setIsDeleting(false);
      });
  };

  const filteredUsers = users.filter(
    (user) =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()),
  );

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

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-medium">Loading personnel...</p>
      </div>
    );
  }

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800">
              Personnel Directory
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Manage user accounts and role assignments
            </p>
          </div>
          <Button
            variant="primary"
            onClick={() => navigate(ROUTES.ADMIN.USERS.CREATE)}
            className="rounded-lg px-4"
          >
            <Plus size={18} className="mr-2" />
            Onboard User
          </Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
            <Input
              placeholder="Search by name or email..."
              className="max-w-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              startIcon={<Search size={16} />}
            />
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-auto whitespace-nowrap">
              {filteredUsers.length} Users Found
            </p>
          </div>

          <div className="p-4">
            <Table
              columns={[
                {
                  header: "Name & Email",
                  render: (userItem) => (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                        <User size={18} />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          {userItem.name}
                        </p>
                        <p className="text-[10px] text-slate-400 font-medium">
                          {userItem.email}
                        </p>
                      </div>
                    </div>
                  ),
                },
                {
                  header: "Phone",
                  render: (userItem) => (
                    <p className="text-sm text-slate-600">
                      {`${userItem.phone_code} ${userItem.phone_num}`.trim() ||
                        "-"}
                    </p>
                  ),
                },
                {
                  header: "Role",
                  align: "center",
                  render: (userItem) => (
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${getRoleBadgeColor(
                        userItem.role_id.role_name,
                      )}`}
                    >
                      <Shield size={10} className="mr-1" />
                      {userItem.role_id.role_name}
                    </span>
                  ),
                },
                {
                  header: "Assignments",
                  align: "center",
                  render: (userItem) => (
                    <div className="flex justify-center flex-wrap gap-1">
                      {userItem.assigned_shop_ids.length > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <MapPin size={10} className="mr-1" />
                          {userItem.assigned_shop_ids.length} Shops
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-300 italic">
                          No assignments
                        </span>
                      )}
                    </div>
                  ),
                },
                {
                  header: "Actions",
                  align: "right",
                  render: (userItem) => (
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          navigate(ROUTES.ADMIN.USERS.EDIT(userItem._id))
                        }
                        className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors inline-flex items-center"
                        title="Edit User"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() =>
                          navigate(ROUTES.ADMIN.USERS.DETAILS(userItem._id))
                        }
                        className="p-2 hover:bg-primary-50 text-primary-500 rounded-lg transition-colors inline-flex items-center"
                        title="View Details"
                      >
                        <Eye size={16} />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(userItem)}
                        className="p-2 hover:bg-danger-50 text-danger-500 rounded-lg transition-colors inline-flex items-center"
                        title="Delete User"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ),
                },
              ]}
              data={filteredUsers}
              keyExtractor={(u) => u._id}
              emptyStateMessage="No personnel found."
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
      {/* Delete Confirmation Dialog */}
      <Dialog
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        title="Confirm Deletion"
        maxWidth="sm"
        footer={
          <>
            <button
              onClick={() => setDeleteTarget(null)}
              className="flex-1 py-3 text-[10px] font-black text-slate-500 hover:text-slate-700 uppercase tracking-widest rounded-xl hover:bg-slate-200/50 transition-colors"
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-3 bg-danger-600 hover:bg-danger-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-danger-500/30 transition-all disabled:opacity-50"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="animate-spin inline" size={16} />
              ) : (
                "Delete"
              )}
            </button>
          </>
        }
      >
        <div className="text-center pb-2">
          <div className="w-16 h-16 bg-danger-50 text-danger-500 rounded-full flex items-center justify-center mx-auto mb-5">
            <Trash2 size={24} />
          </div>
          <h3 className="text-lg font-black text-slate-800 mb-2 tracking-tight">
            Delete {deleteTarget?.name}?
          </h3>
          <p className="text-sm font-medium text-slate-500 leading-relaxed">
            They will lose access but their attendance and payroll history is
            kept. This action cannot be undone.
          </p>
        </div>
      </Dialog>
    </>
  );
};

export default UserList;
