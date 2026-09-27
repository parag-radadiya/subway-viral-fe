import { useEffect, useRef, useState } from "react";
import { shopsApi } from "../../../config/apiCall";
import {
  Store,
  Plus,
  Search,
  MapPin,
  Eye,
  Clock,
  Edit,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { ROUTES } from "../../../utils/routes";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import Table from "../../../components/common/Table";
import { toast } from "react-toastify";

interface Shop {
  _id: string;
  name: string;
  latitude: number;
  longitude: number;
  geofence_radius_m: number;
  opening_time?: string;
  closing_time?: string;
  is_active?: boolean;
  is_all_shops?: boolean;
}

const ShopList = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setDebouncedSearch(value);
      setPage(1);
    }, 300);
  };

  useEffect(() => {
    setLoading(true);
    const query: Record<string, string> = {
      page: `${page}`,
      limit: `${limit}`,
    };
    if (debouncedSearch.trim()) query.search = debouncedSearch.trim();

    shopsApi
      .list(query)
      .then((res: any) => {
        const data = res.data.data;
        const allShops: Shop[] = data.shops || data.data || [];
        setShops(allShops.filter((s) => !s.is_all_shops));
        setTotal(data.total || data.shops?.length || 0);
        setTotalPages(data.total_pages || data.totalPages || 1);
      })
      .catch((err: any) => {
        toast.error(err.message || "Failed to fetch shops");
      })
      .finally(() => setLoading(false));
  }, [page, limit, debouncedSearch]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800">Shops Management</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage all retail locations and geofences
          </p>
        </div>

        <Button
          variant="primary"
          onClick={() => navigate(ROUTES.ADMIN.SHOPS.CREATE)}
          className="rounded-lg px-4"
        >
          <Plus size={18} className="mr-2" />
          Add New Shop
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-center gap-3">
          <Input
            placeholder="Search shops by name..."
            className="max-w-sm"
            value={searchTerm}
            onChange={(e) => handleSearchChange(e.target.value)}
            startIcon={<Search size={16} />}
          />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-auto whitespace-nowrap">
            {total} Total Locations
          </p>
        </div>
        <div className="p-4">
          <Table
            columns={[
              {
                header: "Shop Name",
                render: (shop) => (
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                      <Store size={18} />
                    </div>
                    <span className="text-sm font-semibold text-slate-700">
                      {shop.name}
                    </span>
                  </div>
                ),
              },
              {
                header: "Location (Lat/Lng)",
                render: (shop) => (
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <MapPin size={14} className="text-slate-400" />
                    <span className="text-xs font-mono">
                      {shop.latitude.toFixed(4)}, {shop.longitude.toFixed(4)}
                    </span>
                  </div>
                ),
              },
              {
                header: "Geofence",
                align: "center",
                render: (shop) => (
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-secondary-100 text-secondary-700">
                    {shop.geofence_radius_m}m Radius
                  </span>
                ),
              },
              {
                header: "Operating Hours",
                align: "center",
                render: (shop) =>
                  shop.opening_time && shop.closing_time ? (
                    <div className="flex items-center justify-center gap-1.5 text-slate-600">
                      <Clock size={12} className="text-slate-400" />
                      <span className="text-xs font-mono font-semibold">
                        {shop.opening_time} – {shop.closing_time}
                      </span>
                    </div>
                  ) : (
                    <span className="text-xs text-slate-300">—</span>
                  ),
              },
              {
                header: "Status",
                align: "center",
                render: (shop) =>
                  shop.is_active === false ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-600">
                      Closed
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-700">
                      Active
                    </span>
                  ),
              },
              {
                header: "Actions",
                align: "right",
                render: (shop) => (
                  <div className="flex items-center justify-end gap-1">
                    <button
                      onClick={() =>
                        navigate(ROUTES.ADMIN.SHOPS.EDIT(shop._id))
                      }
                      className="p-2 hover:bg-slate-100 text-slate-500 rounded-lg transition-colors inline-flex items-center"
                      title="Edit Shop"
                    >
                      <Edit size={16} />
                    </button>
                    <button
                      onClick={() =>
                        navigate(ROUTES.ADMIN.SHOPS.DETAILS(shop._id))
                      }
                      className="p-2 hover:bg-primary-50 text-primary-500 rounded-lg transition-colors inline-flex items-center"
                      title="View Details"
                    >
                      <Eye size={16} />
                    </button>
                  </div>
                ),
              },
            ]}
            data={shops}
            keyExtractor={(shop) => shop._id}
            loading={loading}
            emptyStateMessage="No shops found matching your search."
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

export default ShopList;
