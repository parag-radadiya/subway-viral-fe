import { useEffect, useState } from "react";
import { shopsApi } from "../../../config/apiCall";
import { Store, Plus, Search, MapPin, Loader2, Eye } from "lucide-react";
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
}

const ShopList = () => {
  const navigate = useNavigate();
  const [shops, setShops] = useState<Shop[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    shopsApi
      .list()
      .then((res) => {
        setShops(res.data.data.shops);
      })
      .catch(() => {
        toast.error("Failed to fetch shops. Please try again.");
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredShops = shops.filter((shop) =>
    shop.name.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-medium">Loading shops...</p>
      </div>
    );
  }

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
            onChange={(e) => setSearchTerm(e.target.value)}
            startIcon={<Search size={16} />}
          />
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-auto whitespace-nowrap">
            {filteredShops.length} Total Locations
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
                header: "Actions",
                align: "right",
                render: (shop) => (
                  <button
                    onClick={() =>
                      navigate(ROUTES.ADMIN.SHOPS.DETAILS(shop._id))
                    }
                    className="p-2 hover:bg-primary-50 text-primary-500 rounded-lg transition-colors inline-flex items-center"
                    title="View Details"
                  >
                    <Eye size={16} />
                  </button>
                ),
              },
            ]}
            data={filteredShops}
            keyExtractor={(shop) => shop._id}
            emptyStateMessage="No shops found matching your search."
          />
        </div>
      </div>
    </div>
  );
};

export default ShopList;
