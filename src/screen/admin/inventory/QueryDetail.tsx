import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
  Eye,
  FileText,
  User,
  Clock,
  DollarSign,
  Calendar,
  MessageSquare,
  Package,
  Activity,
  AlertCircle,
  Hash,
  Loader2,
} from "lucide-react";
import { inventoryApi } from "../../../config/inventoryApi";
import {
  InventoryQuery,
  QueryStatus,
  InventoryItem,
  InventoryStatus,
} from "../../../utils/types";
import { ROUTES } from "../../../utils/routes";
import Button from "../../../components/common/Button";
import Card from "../../../components/common/Card";
import Input from "../../../components/common/Input";
import { toast } from "react-toastify";

const QueryDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [query, setQuery] = useState<InventoryQuery | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Close Query State
  const [repairCost, setRepairCost] = useState<string>("");
  const [resolveNote, setResolveNote] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchQuery = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const data = await inventoryApi.getQueryById(id);
      setQuery(data);
    } catch (error: any) {
      toast.error(error.message || "Failed to load ticket details");
      navigate(ROUTES.ADMIN.INVENTORY.QUERIES);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuery();
  }, [id]);

  const handleCloseTicket = async () => {
    if (!id || !resolveNote.trim()) {
      toast.warning("Please provide a resolution note.");
      return;
    }
    try {
      setIsSubmitting(true);
      await inventoryApi.closeQuery(id, {
        repair_cost: parseFloat(repairCost) || 0,
        resolve_note: resolveNote,
      });
      toast.success(
        "Ticket resolved successfully. Item status will be updated.",
      );
      fetchQuery(); // Refresh details
    } catch (error: any) {
      toast.error(error.message || "Failed to close ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !query) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-slate-400">
        <Loader2 className="animate-spin mb-4" size={32} />
        <p className="text-sm font-medium">Loading ticket dossiers...</p>
      </div>
    );
  }

  const item = query.item_id as InventoryItem;
  const isClosed = query.status === QueryStatus.CLOSED;

  return (
    <div className="space-y-6 animate-fade-in pb-10">
      {/* Header with Back Button and Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <button
            onClick={() => navigate(-1)}
            className="flex items-center text-slate-500 hover:text-primary-600 transition-colors text-[10px] font-black uppercase tracking-wider mb-2"
          >
            <ArrowLeft size={14} className="mr-1.5" />
            Return to Directory
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Maintenance Dossier
            </h1>
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest ${
                query.status === QueryStatus.OPEN
                  ? "bg-rose-50 text-rose-600 border border-rose-100"
                  : "bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm"
              }`}
            >
              {query.status}
            </span>
          </div>
        </div>
        <div className="flex gap-2">
          {isClosed && (
            <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] bg-emerald-50/50 px-4 py-2 rounded-xl border border-emerald-100 shadow-sm uppercase tracking-widest">
              <ShieldCheck size={16} />
              <span>Case Finalized</span>
            </div>
          )}
        </div>
      </div>

      {/* Hero Header Section */}
      <div className="bg-slate-900 rounded-[2rem] overflow-hidden relative shadow-2xl shadow-slate-200">
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-primary-500/10 to-transparent"></div>
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-primary-500/10 rounded-full blur-3xl text-red-500"></div>

        <div className="relative z-10 p-8 sm:p-12 flex flex-col sm:flex-row items-center gap-8">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-3xl shadow-2xl flex items-center justify-center text-slate-900 shrink-0 transform -rotate-3 hover:rotate-0 transition-transform duration-500">
            <div className="p-6 bg-slate-50 rounded-2xl">
              <FileText
                size={48}
                className={isClosed ? "text-emerald-500" : "text-rose-500"}
              />
            </div>
          </div>

          <div className="text-center sm:text-left flex-1">
            <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tighter mb-2">
              Ticket #{query._id.slice(-6).toUpperCase()}
            </h1>
            <div className="flex flex-wrap justify-center sm:justify-start gap-4">
              <div className="flex items-center text-slate-400 gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10">
                <Hash size={14} className="text-primary-400" />
                <span className="text-xs font-bold font-mono tracking-tight uppercase">
                  Ref: {query._id}
                </span>
              </div>
              <div className="flex items-center text-slate-400 gap-1.5 bg-white/5 px-3 py-1 rounded-full border border-white/10 uppercase tracking-widest text-[10px] font-black">
                <Package size={14} className="text-amber-400" />
                {item?.item_name || "Legacy Component"}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border-t border-white/10 px-8 py-4 flex flex-wrap gap-8">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Created Date
            </span>
            <span className="text-sm font-bold text-white flex items-center gap-2">
              <Calendar size={14} className="text-primary-400" />
              {new Date(query.createdAt).toLocaleDateString(undefined, {
                dateStyle: "long",
              })}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
              Status Classification
            </span>
            <span
              className={`text-sm font-black uppercase tracking-tight flex items-center gap-2 ${
                query.status === QueryStatus.OPEN
                  ? "text-rose-400"
                  : "text-emerald-400"
              }`}
            >
              <Activity size={14} />
              {query.status} Maintenance
            </span>
          </div>
          {isClosed && (
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">
                Resolution Efficiency
              </span>
              <span className="text-sm font-bold text-white flex items-center gap-2">
                <CheckCircle2 size={14} className="text-emerald-400" />
                Resolved in{" "}
                {Math.round(
                  (new Date(query.resolved_at!).getTime() -
                    new Date(query.createdAt).getTime()) /
                    (1000 * 60 * 60 * 24),
                )}{" "}
                Days
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Left Column - Details and Resolution */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-8 border-slate-200/60 shadow-sm relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-50/50 -mr-12 -mt-12 rounded-full blur-2xl group-hover:bg-rose-100/50 transition-colors duration-500"></div>
            <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2 text-sm uppercase tracking-widest">
              <AlertCircle size={18} className="text-rose-500" />
              Defect Report
            </h3>
            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-8">
              <p className="text-slate-700 leading-relaxed italic font-medium">
                "{query.issue_note}"
              </p>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                  <User size={20} className="text-primary-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Reporter
                  </p>
                  <p className="text-sm font-bold text-slate-800 leading-none mt-1">
                    Manager User
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-slate-50/50 border border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-slate-400 shadow-sm">
                  <Clock size={20} className="text-amber-500" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                    Timestamp
                  </p>
                  <p className="text-sm font-bold text-slate-800 leading-none mt-1">
                    {new Date(query.createdAt).toLocaleTimeString()}
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Resolution Card if Closed */}
          {isClosed && (
            <Card className="p-8 border-emerald-200 bg-emerald-50/30 shadow-sm relative overflow-hidden">
              <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2 text-sm uppercase tracking-widest">
                <CheckCircle2 size={18} className="text-emerald-500" />
                Resolution Protocol
              </h3>
              <div className="bg-white p-6 rounded-2xl border border-emerald-100 mb-8 shadow-sm">
                <p className="text-slate-700 leading-relaxed font-bold">
                  "{query.resolve_note}"
                </p>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100/50 flex items-center justify-center">
                    <DollarSign size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest font-mono">
                      Cost Incurred
                    </p>
                    <p className="text-xl font-black text-emerald-700">
                      £{query.repair_cost?.toFixed(2)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                  <div className="w-12 h-12 rounded-xl bg-emerald-100/50 flex items-center justify-center">
                    <Calendar size={20} className="text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                      Closure Date
                    </p>
                    <p className="text-sm font-bold text-emerald-700 leading-none mt-1">
                      {query.resolved_at
                        ? new Date(query.resolved_at).toLocaleDateString()
                        : "-"}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* Solution Form if Open */}
          {!isClosed && (
            <Card className="p-8 border-primary-100 bg-white shadow-2xl shadow-primary-50">
              <div className="flex items-center justify-between mb-8">
                <h3 className="font-black text-slate-800 flex items-center gap-3 text-sm uppercase tracking-widest">
                  <MessageSquare size={18} className="text-primary-500" />
                  Finalize Case
                </h3>
                <div className="bg-primary-50 px-3 py-1 rounded-full border border-primary-100 text-[10px] font-black text-primary-600 uppercase tracking-widest">
                  Protocol 1.2a
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2 ml-1">
                    <DollarSign size={14} className="text-slate-400" />
                    Repair Cost (GBP)
                  </label>
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={repairCost}
                    onChange={(e) => setRepairCost(e.target.value)}
                    className="max-w-[200px] h-12 rounded-xl border-slate-200 bg-slate-50/50 font-mono text-lg font-bold"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">
                    Resolution Details *
                  </label>
                  <textarea
                    className="w-full h-32 px-5 py-4 rounded-2xl border border-slate-200 focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all outline-none resize-none text-slate-700 placeholder:text-slate-300 font-medium"
                    placeholder="Explain how the asset was restored to operation..."
                    value={resolveNote}
                    onChange={(e) => setResolveNote(e.target.value)}
                  />
                </div>
                <div className="pt-2">
                  <Button
                    variant="primary"
                    className="w-full h-14 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-xl shadow-primary-200 transform active:scale-[0.98] transition-all"
                    onClick={handleCloseTicket}
                    isLoading={isSubmitting}
                    disabled={!resolveNote.trim()}
                  >
                    <CheckCircle2 size={20} className="mr-2" />
                    Confirm Resolution
                  </Button>
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column - Secondary Info */}
        <div className="space-y-6">
          {/* Item Preview Card */}
          <Card className="p-8 border-slate-200/60 shadow-sm relative overflow-hidden group hover:border-primary-200 transition-colors">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary-50 -mr-16 -mt-16 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <h4 className="font-black text-slate-800 mb-6 flex items-center gap-2 text-xs uppercase tracking-widest">
              <Package size={16} className="text-primary-500" />
              Target Asset
            </h4>
            <div className="flex items-center gap-4 mb-8">
              <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-lg transform group-hover:rotate-6 transition-transform">
                <Package size={28} />
              </div>
              <div>
                <h5 className="font-black text-slate-900 text-lg leading-tight group-hover:text-primary-600 transition-colors uppercase tracking-tight">
                  {item?.item_name || "N/A"}
                </h5>
                <p className="text-xs font-mono text-slate-400 font-bold tracking-tighter mt-1">
                  {item?._id}
                </p>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-50">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-black uppercase tracking-widest">
                  Facility
                </span>
                <span className="font-bold text-slate-800 uppercase tracking-tight">
                  {query.shop_id?.name || "Unknown Branch"}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-400 font-black uppercase tracking-widest">
                  Last Inspected
                </span>
                <span className="font-bold text-slate-800 uppercase tracking-tight">
                  {item?.purchase_date
                    ? new Date(item.purchase_date).toLocaleDateString()
                    : "N/A"}
                </span>
              </div>
              <Button
                variant="ghost"
                className="w-full mt-4 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary-600 bg-primary-50/50 hover:bg-primary-50 border border-primary-100 group-hover:shadow-md transition-all"
                onClick={() =>
                  navigate(ROUTES.ADMIN.INVENTORY.DETAILS(item?._id))
                }
              >
                <Eye size={16} className="mr-2" />
                Deep Asset Specs
              </Button>
            </div>
          </Card>

          {/* Asset Guidance Card */}
          <Card className="p-8 border-slate-200 shadow-sm bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary-100/50 rounded-full -mr-12 -mt-12 blur-xl"></div>
            <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 italic text-sm">
              <ShieldCheck size={18} className="text-primary-500" />
              Operational Policy
            </h4>
            <p className="text-[10px] text-slate-500 leading-relaxed font-black uppercase tracking-widest opacity-60">
              FINALIZING A MAINTENANCE CASE WILL AUTOMATICALLY RE-EVALUATE THE
              GLOBAL ASSET STATUS. IF NO OTHER CONFLICTS ARE PRESENT, THE SYSTEM
              WILL CLASS THE ITEM AS "OPERATIONAL".
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default QueryDetail;
