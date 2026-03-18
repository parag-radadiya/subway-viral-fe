import { useEffect, useState } from "react";
import { usersApi } from "../../../config/apiCall";
import {
  Plus,
  Search,
  Shield,
  MapPin,
  ChevronRight,
  Loader2,
  Pencil,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../utils/routes";
import Button from "../../../components/common/Button";
import { toast } from "react-toastify";

type FinalUser = {
  _id: string;
  name: string;
  email: string;
  assigned_shop_ids: string[];
  role_id: { role_name: string };
};
const UserList = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState<FinalUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    usersApi
      .list()
      .then(({ data }) => {
        console.log("🚀 - UserList - res:", data);
        setUsers(data.data.users);
      })
      .catch((err) => {
        toast.error("Failed to fetch users. Please try again.");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, []);

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
          <div className="relative flex-1 max-w-sm">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              type="text"
              placeholder="Search by name or email..."
              className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-1.5 text-xs focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-auto">
            {filteredUsers.length} Users Found
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                <th className="px-6 py-3 border-b border-slate-100 whitespace-nowrap">
                  Name & Email
                </th>
                <th className="px-6 py-3 border-b border-slate-100 text-center whitespace-nowrap">
                  Role
                </th>
                <th className="px-6 py-3 border-b border-slate-100 text-center whitespace-nowrap">
                  Assignments
                </th>
                <th className="px-6 py-3 border-b border-slate-100 text-right whitespace-nowrap">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="hover:bg-slate-50/50 transition-colors group"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {user.name}
                      </p>
                      <p className="text-[10px] text-slate-400 font-medium">
                        {user.email}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tighter ${getRoleBadgeColor(user.role_id.role_name)}`}
                    >
                      <Shield size={10} className="mr-1" />
                      {user.role_id.role_name}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center whitespace-nowrap">
                    <div className="flex justify-center flex-wrap gap-1">
                      {user.assigned_shop_ids.length > 0 ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200">
                          <MapPin size={10} className="mr-1" />
                          {user.assigned_shop_ids.length} Shops
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-300 italic">
                          No assignments
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() =>
                          navigate(ROUTES.ADMIN.USERS.EDIT(user._id))
                        }
                        className="inline-flex items-center text-primary-600 font-bold text-[10px] uppercase tracking-wider hover:text-primary-700 transition-colors p-2 rounded-lg hover:bg-primary-50"
                      >
                        <Pencil size={12} className="mr-1" />
                        Edit
                      </button>
                      <button
                        onClick={() =>
                          navigate(ROUTES.ADMIN.USERS.DETAILS(user._id))
                        }
                        className="inline-flex items-center text-slate-600 font-bold text-[10px] uppercase tracking-wider hover:text-slate-700 transition-colors p-2 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-100"
                      >
                        Details
                        <ChevronRight size={12} className="ml-1" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td
                    colSpan={4}
                    className="px-6 py-12 text-center text-slate-400"
                  >
                    <p className="text-sm">No personnel found.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default UserList;
