import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { rotasApi, shopsApi, usersApi } from "../../../config/apiCall";
import { toast } from "react-toastify";
import Tabs from "../../../components/common/Tabs";
import { ArrowLeft, Loader2 } from "lucide-react";
import { ROUTES } from "../../../utils/routes";
import SingleRotaForm from "../../../components/admin/rotas/SingleRotaForm";
import BulkWeeklyRotaForm from "../../../components/admin/rotas/BulkWeeklyRotaForm";

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

  const [assignmentMode, setAssignmentMode] = useState<"single" | "bulk">(
    "single",
  );

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

  const handleSubmit = (e: React.FormEvent) => {
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
    const apiCall = editItemId
      ? rotasApi.update(editItemId, {
          shift_start: shiftStart,
          shift_end: shiftEnd,
          note: formData.note,
        })
      : rotasApi.create(payload);

    apiCall
      .then(() => {
        toast.success(
          editItemId ? "Shift updated successfully" : "Shift created successfully",
        );
        navigate(ROUTES.ADMIN.ROTAS.LIST);
      })
      .catch((err) => {
        toast.error(err.message || "Failed to save shift");
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
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
            {editItemId ? "Edit Shift Details" : "Assign Shifts"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {editItemId
              ? "Modify existing rota assignment"
              : "Create individual or bulk roster assignments"}
          </p>
        </div>
        {!editItemId && (
          <div className="ml-auto">
            <Tabs
              options={[
                { label: "Single Assignment", value: "single" },
                { label: "Bulk Weekly Allocation", value: "bulk" },
              ]}
              activeTab={assignmentMode}
              onChange={(val) => setAssignmentMode(val as "single" | "bulk")}
            />
          </div>
        )}
      </div>

      {assignmentMode === "single" ? (
        <SingleRotaForm
          formData={formData}
          setFormData={setFormData}
          shops={shops}
          users={users}
          loading={loading}
          editItemId={editItemId}
          onSubmit={handleSubmit}
          onCancel={() => navigate(ROUTES.ADMIN.ROTAS.LIST)}
        />
      ) : (
        <BulkWeeklyRotaForm
          shopId={formData.shop_id}
          setShopId={(id) => setFormData((prev) => ({ ...prev, shop_id: id }))}
          shops={shops}
          users={users}
          onSuccess={() => navigate(ROUTES.ADMIN.ROTAS.LIST)}
        />
      )}
    </div>
  );
}
