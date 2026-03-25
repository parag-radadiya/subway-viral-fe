import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  Save,
  Package,
  Calendar,
  Store,
  AlertCircle,
} from "lucide-react";
import { inventoryApi } from "../../../config/inventoryApi";
import api from "../../../config/api";
import {
  InventoryItem,
  InventoryStatus,
  ApiResponse,
} from "../../../utils/types";
import { ROUTES } from "../../../utils/routes";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";
import Card from "../../../components/common/Card";
import { toast } from "react-toastify";

const InventoryForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [shops, setShops] = useState<{ _id: string; name: string }[]>([]);
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    item_name: "",
    shop_id: "",
    purchase_date: new Date().toISOString().split("T")[0],
    expiry_date: null,
    status: InventoryStatus.GOOD,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEdit);

  useEffect(() => {
    const fetchShops = () => {
      api
        .get<ApiResponse<{ shops: any[] }>>("/shops")
        .then((response) => {
          setShops(response.data.data.shops);
        })
        .catch((err) => {
          toast.error(err.message || "Failed to load shops");
        });
    };

    const fetchItem = () => {
      if (!id) return;
      inventoryApi
        .getItemById(id)
        .then((item) => {
          setFormData({
            item_name: item.item_name,
            shop_id:
              typeof item.shop_id === "object" ? item.shop_id._id : item.shop_id,
            purchase_date: new Date(item.purchase_date)
              .toISOString()
              .split("T")[0],
            expiry_date: item.expiry_date
              ? new Date(item.expiry_date).toISOString().split("T")[0]
              : null,
            status: item.status,
          });
        })
        .catch((error: any) => {
          toast.error(error.message || "Failed to load item details");
          navigate(ROUTES.ADMIN.INVENTORY.LIST);
        })
        .finally(() => {
          setIsLoading(false);
        });
    };

    fetchShops();
    fetchItem();
  }, [id, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.item_name || !formData.shop_id || !formData.purchase_date) {
      toast.warning("Please fill in all required fields");
      return;
    }

    setIsSubmitting(true);
    const apiCall =
      isEdit && id
        ? inventoryApi.updateItem(id, formData)
        : inventoryApi.createItem(formData);

    apiCall
      .then(() => {
        toast.success(
          isEdit ? "Item updated successfully" : "Item created successfully",
        );
        navigate(ROUTES.ADMIN.INVENTORY.LIST);
      })
      .catch((error: any) => {
        toast.error(error.message || "Something went wrong");
      })
      .finally(() => {
        setIsSubmitting(false);
      });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="rounded-full w-10 h-10 p-0"
        >
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {isEdit ? "Edit Item" : "Add New Item"}
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            {isEdit
              ? "Update inventory item details."
              : "Register a new asset in the system."}
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="p-6 space-y-6 border-slate-200 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full">
              <label className="text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                <Package size={16} className="text-slate-400" />
                Item Name *
              </label>
              <Input
                placeholder="e.g. Point of Sale Terminal"
                value={formData.item_name}
                onChange={(e) =>
                  setFormData({ ...formData, item_name: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                <Store size={16} className="text-slate-400" />
                Shop Location *
              </label>
              <Select
                value={
                  typeof formData.shop_id === "string" ? formData.shop_id : ""
                }
                onChange={(e) =>
                  setFormData({ ...formData, shop_id: e.target.value })
                }
                required
              >
                <option value="">Select Shop</option>
                {shops.map((s) => (
                  <option key={s._id} value={s._id}>
                    {s.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                <AlertCircle size={16} className="text-slate-400" />
                Current Status *
              </label>
              <Select
                value={formData.status}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    status: e.target.value as InventoryStatus,
                  })
                }
                required
              >
                <option value={InventoryStatus.GOOD}>Good</option>
                <option value={InventoryStatus.DAMAGED}>Damaged</option>
                <option value={InventoryStatus.IN_REPAIR}>In Repair</option>
              </Select>
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                <Calendar size={16} className="text-slate-400" />
                Purchase Date *
              </label>
              <Input
                type="date"
                value={formData.purchase_date}
                onChange={(e) =>
                  setFormData({ ...formData, purchase_date: e.target.value })
                }
                required
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                <Calendar size={16} className="text-slate-400" />
                Expiry Date
              </label>
              <Input
                type="date"
                value={formData.expiry_date || ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    expiry_date: e.target.value || null,
                  })
                }
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
            <Button
              type="button"
              variant="secondary"
              fullWidth
              onClick={() => navigate(-1)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              fullWidth
              variant="primary"
              className="px-8 shadow-md shadow-primary-100"
              isLoading={isSubmitting}
            >
              <Save size={18} className="mr-2" />
              {isEdit ? "Update Item" : "Create Item"}
            </Button>
          </div>
        </Card>
      </form>
    </div>
  );
};

export default InventoryForm;
