import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { rotasApi, shopsApi, usersApi } from "../../../config/apiCall";
import { toast } from "react-toastify";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";
import Button from "../../../components/common/Button";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { ROUTES } from "../../../utils/routes";

export default function RotaForm() {
  const { id: editItemId } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [shops, setShops] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [initLoading, setInitLoading] = useState(false);
  const [formData, setFormData] = useState({
    user_id: "",
    shop_id: "",
    shiftDate: "",
    startTime: "09:00",
    endTime: "17:00",
    note: "",
  });

  useEffect(() => {
    setInitLoading(true);

    const promises: Promise<any>[] = [shopsApi.list(), usersApi.list()];

    if (editItemId) {
      promises.push(rotasApi.getById(editItemId));
    }

    Promise.all(promises)
      .then(([shopsRes, usersRes, rotaRes]) => {
        setShops(shopsRes.data.data.shops || []);
        setUsers(usersRes.data.data?.users || usersRes.data?.users || []);

        if (editItemId && rotaRes) {
          const rota = rotaRes.data.data?.rota || rotaRes.data.rota;
          const shiftDateObj = new Date(rota.shift_date || rota.shift_start);
          const dateStr = shiftDateObj.toISOString().split("T")[0];
          setFormData({
            user_id:
              typeof rota.user_id === "string"
                ? rota.user_id
                : rota.user_id?._id || "",
            shop_id:
              typeof rota.shop_id === "string"
                ? rota.shop_id
                : rota.shop_id?._id || "",
            shiftDate: dateStr,
            startTime: rota.start_time || "09:00",
            endTime: rota.end_time || "17:00",
            note: rota.note || "",
          });
        }
      })
      .catch((err) => {
        toast.error("Failed to load necessary data");
        console.error(err);
      })
      .finally(() => setInitLoading(false));
  }, [editItemId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !formData.user_id ||
      !formData.shop_id ||
      !formData.shiftDate ||
      !formData.startTime ||
      !formData.endTime
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    const shiftStart = new Date(
      `${formData.shiftDate}T${formData.startTime}:00`,
    ).toISOString();
    const shiftEnd = new Date(
      `${formData.shiftDate}T${formData.endTime}:00`,
    ).toISOString();

    const payload = {
      user_id: formData.user_id,
      shop_id: formData.shop_id,
      shift_start: shiftStart,
      shift_end: shiftEnd,
      note: formData.note,
    };

    setLoading(true);
    try {
      if (editItemId) {
        const updatePayload = {
          shift_start: shiftStart,
          shift_end: shiftEnd,
          note: formData.note,
        };
        await rotasApi.update(editItemId, updatePayload);
        toast.success("Shift updated successfully");
      } else {
        await rotasApi.create(payload);
        toast.success("Shift created successfully");
      }
      navigate(ROUTES.ADMIN.ROTAS.LIST);
    } catch (err) {
      toast.error(
        editItemId ? "Failed to update shift" : "Failed to create shift",
      );
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (initLoading) {
    return (
      <div className="p-12 text-center text-slate-400">
        <Loader2 className="animate-spin inline mr-2" /> Loading form...
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(ROUTES.ADMIN.ROTAS.LIST)}
          className="p-2 rounded-full hover:bg-slate-100 text-slate-500 transition-colors"
        >
          <ArrowLeft size={20} />
        </button>
        <div>
          <h1 className="text-xl font-bold text-slate-800">
            {editItemId ? "Edit Shift Details" : "Assign New Shift"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {editItemId
              ? "Modify existing rota assignment"
              : "Assign a new shift to an employee"}
          </p>
        </div>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl border border-slate-200 shadow-card p-8 space-y-5"
      >
        {!editItemId && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Select
              label="Shop *"
              value={formData.shop_id}
              onChange={(e) =>
                setFormData({ ...formData, shop_id: e.target.value })
              }
            >
              <option value="" disabled>
                Select Shop
              </option>
              {shops.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name}
                </option>
              ))}
            </Select>

            <Select
              label="Employee *"
              value={formData.user_id}
              onChange={(e) =>
                setFormData({ ...formData, user_id: e.target.value })
              }
            >
              <option value="" disabled>
                Select Employee
              </option>
              {users.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.name}
                </option>
              ))}
            </Select>
          </div>
        )}

        {editItemId && (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-500 mb-6">
            Editing time for an existing shift assignment. To change shop or
            employee, please delete and recreate.
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Input
            type="date"
            label="Shift Date *"
            value={formData.shiftDate}
            onChange={(e) =>
              setFormData({ ...formData, shiftDate: e.target.value })
            }
          />
          <Input
            type="time"
            label="Start Time *"
            value={formData.startTime}
            onChange={(e) =>
              setFormData({ ...formData, startTime: e.target.value })
            }
          />
          <Input
            type="time"
            label="End Time *"
            value={formData.endTime}
            onChange={(e) =>
              setFormData({ ...formData, endTime: e.target.value })
            }
          />
        </div>

        <div>
          <label className="text-sm font-medium text-primary-700 block mb-1.5">
            Note (Optional)
          </label>
          <textarea
            className="w-full rounded-lg border border-slate-200 px-4 py-3 text-sm text-primary-800 focus:outline-none focus:ring-2 focus:ring-accent-200 focus:border-accent-400"
            rows={3}
            placeholder="Add any instructions or notes about this shift..."
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
          />
        </div>

        <div className="pt-4 flex gap-3">
          <Button
            variant="secondary"
            fullWidth
            type="button"
            onClick={() => navigate(ROUTES.ADMIN.ROTAS.LIST)}
          >
            Cancel
          </Button>
          <Button variant="primary" fullWidth type="submit" disabled={loading}>
            <Save size={18} className="mr-2" />
            {editItemId ? "Update Shift" : "Create Shift"}
          </Button>
        </div>
      </form>
    </div>
  );
}
