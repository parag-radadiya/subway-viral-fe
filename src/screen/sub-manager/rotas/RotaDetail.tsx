import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { rotasApi } from "../../../config/apiCall";
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  User,
  FileText,
  Loader2,
  Edit,
  Trash2,
  AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import Button from "../../../components/common/Button";
import Dialog from "../../../components/common/Dialog";
import { ROUTES } from "../../../utils/routes";

export default function RotaDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [rota, setRota] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    rotasApi
      .getById(id)
      .then((res) => {
        setRota(res.data.data?.rota || res.data.rota);
      })
      .catch((err) => {
        toast.error("Failed to load shift details");
        console.error(err);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = () => {
    if (!id) return;
    setIsDeleting(true);
    rotasApi
      .remove(id)
      .then(() => {
        toast.success("Shift deleted successfully");
        navigate(ROUTES.SUB_MANAGER.ROTAS.LIST);
      })
      .catch((err) => {
        toast.error(err.message || "Failed to delete shift");
        console.error(err);
      })
      .finally(() => {
        setIsDeleting(false);
        setIsDeleteModalOpen(false);
      });
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-medium">Loading shift details...</p>
      </div>
    );
  }

  if (!rota) {
    return (
      <div className="text-center p-12">
        <AlertCircle size={48} className="mx-auto text-slate-200 mb-4" />
        <p className="text-slate-500">Shift not found.</p>
        <Button
          variant="ghost"
          className="mt-4"
          onClick={() => navigate(ROUTES.SUB_MANAGER.ROTAS.LIST)}
        >
          <ArrowLeft size={16} className="mr-2" /> Back to List
        </Button>
      </div>
    );
  }

  const shiftDate = new Date(rota.shift_date);

  return (
    <div className="space-y-6 animate-fade-in pb-20">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(ROUTES.SUB_MANAGER.ROTAS.LIST)}
          className="flex items-center text-slate-500 hover:text-primary-600 transition-colors text-xs font-bold uppercase tracking-wider"
        >
          <ArrowLeft size={16} className="mr-1.5" />
          Back to Directory
        </button>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate(ROUTES.SUB_MANAGER.ROTAS.EDIT(rota._id))}
          >
            <Edit size={16} className="mr-2" /> Edit Shift
          </Button>
          <Button
            variant="danger"
            size="sm"
            onClick={() => setIsDeleteModalOpen(true)}
          >
            <Trash2 size={16} className="mr-2" /> Delete
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-card border border-slate-200 overflow-hidden">
        <div className="bg-slate-900 h-32 relative">
          <div className="absolute -bottom-8 left-8 p-4 bg-primary-600 rounded-2xl shadow-lg border-4 border-white text-white">
            <User size={32} />
          </div>
        </div>
        <div className="pt-12 p-8 pb-6">
          <h1 className="text-2xl font-bold text-slate-900">
            {typeof rota.user_id === "string"
              ? rota.user_id
              : rota.user_id?.name}
          </h1>
          <p className="text-sm text-slate-500 flex items-center gap-1.5 mt-1">
            <FileText size={14} /> Global Shift ID: {rota._id}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 p-8 pt-0 border-b border-slate-100">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
              Shift Date
            </p>
            <div className="flex items-end gap-2 text-slate-800">
              <Calendar size={20} className="text-primary-500 mb-1" />
              <span className="text-xl font-black">
                {shiftDate.toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                })}
              </span>
              <span className="text-xs font-bold mb-1 ml-[-4px]">
                {shiftDate.getFullYear()}
              </span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
              Timing
            </p>
            <div className="flex items-end gap-2 text-slate-800">
              <Clock size={20} className="text-accent-500 mb-1" />
              <span className="text-xl font-mono font-bold tracking-tighter">
                {rota.start_time} - {rota.end_time || "TBA"}
              </span>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
            <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest mb-1">
              Location
            </p>
            <div className="flex items-end gap-2 text-slate-800">
              <MapPin size={20} className="text-amber-500 mb-1" />
              <span className="text-sm font-bold truncate">
                {typeof rota.shop_id === "string"
                  ? rota.shop_id
                  : rota.shop_id?.name}
              </span>
            </div>
          </div>
        </div>

        <div className="p-8 bg-slate-50/30 flex justify-between items-center text-[10px] text-slate-400 font-medium">
          <p>Status: {rota.is_published ? "Published" : "Draft"}</p>
          <p>Last Modified: Just now</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-700">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
            Shift Instructions
          </h3>
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {rota.note ||
              "No specific instructions or notes have been attached to this shift assignment."}
          </p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
          <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4 flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-500" />
            Employee Contact
          </h3>
          <p className="text-sm leading-relaxed">
            {typeof rota.user_id !== "string" && rota.user_id?.email ? (
              <>
                Email: <span className="font-bold">{rota.user_id.email}</span>
              </>
            ) : (
              "Employee contact details are not available for this assignment."
            )}
          </p>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Deletion"
        maxWidth="sm"
        footer={
          <>
            <button
              onClick={() => setIsDeleteModalOpen(false)}
              className="flex-1 py-3 text-[10px] font-black text-slate-500 hover:text-slate-700 uppercase tracking-widest rounded-xl hover:bg-slate-200/50 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDelete}
              className="flex-1 py-3 bg-danger-600 hover:bg-danger-700 text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-danger-500/30 transition-all"
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
            Are you sure?
          </h3>
          <p className="text-sm font-medium text-slate-500">
            Do you really want to delete this shift? This action cannot be
            undone and will permanently remove it from the schedule.
          </p>
        </div>
      </Dialog>
    </div>
  );
}
