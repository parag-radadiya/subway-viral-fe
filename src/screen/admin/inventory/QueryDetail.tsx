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
  Package
} from "lucide-react";
import { inventoryApi } from "../../../config/inventoryApi";
import { 
  InventoryQuery, 
  QueryStatus,
  InventoryItem
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
        resolve_note: resolveNote
      });
      toast.success("Ticket resolved successfully. Item status will be updated.");
      fetchQuery(); // Refresh details
    } catch (error: any) {
      toast.error(error.message || "Failed to close ticket");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading || !query) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  const item = query.item_id as InventoryItem;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between gap-4">
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
            <div className="flex items-center gap-3">
               <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Ticket #{query._id.slice(-6).toUpperCase()}</h1>
               <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                 query.status === QueryStatus.OPEN ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
               }`}>
                 {query.status}
               </span>
            </div>
            <p className="text-slate-500 text-sm mt-1">Issue reported for <strong>{item?.item_name || 'Removed Item'}</strong></p>
          </div>
        </div>
        
        {query.status === QueryStatus.CLOSED && (
           <div className="flex items-center gap-2 text-emerald-600 font-bold bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
              <ShieldCheck size={20} />
              <span>RESOLVED</span>
           </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Section */}
          <Card className="p-6 border-slate-200 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 w-32 h-32 bg-rose-50/50 -mr-16 -mt-16 rounded-full blur-2xl"></div>
             <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FileText size={18} className="text-rose-500" />
                Issue Description
             </h3>
             <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 mb-6">
                <p className="text-slate-700 leading-relaxed italic">"{query.issue_note}"</p>
             </div>
             
             <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                   <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400">
                      <User size={18} />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Reported By</p>
                      <p className="text-sm font-semibold text-slate-700">Manager User</p>
                   </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50/50 border border-slate-100">
                   <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-slate-400">
                      <Clock size={18} />
                   </div>
                   <div>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Opened At</p>
                      <p className="text-sm font-semibold text-slate-700">{new Date(query.opened_at).toLocaleString()}</p>
                   </div>
                </div>
             </div>
          </Card>

          {/* Resolution Section (if closed) */}
          {query.status === QueryStatus.CLOSED && (
             <Card className="p-6 border-emerald-200 bg-emerald-50/30 shadow-sm relative overflow-hidden">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                   <CheckCircle2 size={18} className="text-emerald-500" />
                   Resolution Details
                </h3>
                <div className="bg-white p-6 rounded-2xl border border-emerald-100 mb-6">
                   <p className="text-slate-700 leading-relaxed font-medium">"{query.resolve_note}"</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                   <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <DollarSign size={18} className="text-emerald-600" />
                      <div>
                         <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Repair Cost</p>
                         <p className="text-lg font-bold text-emerald-700">£{query.repair_cost}</p>
                      </div>
                   </div>
                   <div className="flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <Calendar size={18} className="text-emerald-600" />
                      <div>
                         <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Resolved At</p>
                         <p className="text-sm font-semibold text-emerald-700">{query.closed_at ? new Date(query.closed_at).toLocaleString() : '-'}</p>
                      </div>
                   </div>
                </div>
             </Card>
          )}

          {/* Action Section (if open) */}
          {query.status === QueryStatus.OPEN && (
             <Card className="p-6 border-primary-100 bg-white shadow-lg shadow-primary-50/50">
                <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                   <MessageSquare size={18} className="text-primary-500" />
                   Solve This Ticket
                </h3>
                <div className="space-y-4">
                   <div>
                      <label className="text-sm font-semibold text-slate-700 mb-1.5 flex items-center gap-2">
                         <DollarSign size={14} className="text-slate-400" />
                         Repair Cost (£)
                      </label>
                      <Input
                         type="number"
                         placeholder="0.00"
                         value={repairCost}
                         onChange={(e) => setRepairCost(e.target.value)}
                         className="max-w-[200px]"
                      />
                   </div>
                   <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Resolution Note *</label>
                      <textarea
                         className="w-full h-32 px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-primary-500 transition-all outline-none resize-none text-slate-700"
                         placeholder="How was the issue resolved? (e.g. Replaced display panel)"
                         value={resolveNote}
                         onChange={(e) => setResolveNote(e.target.value)}
                      />
                   </div>
                   <div className="pt-2">
                      <Button 
                         variant="primary" 
                         className="w-full h-12 shadow-lg shadow-primary-200"
                         onClick={handleCloseTicket}
                         isLoading={isSubmitting}
                         disabled={!resolveNote.trim()}
                      >
                         <CheckCircle2 size={20} className="mr-2" />
                         Mark as Resolved
                      </Button>
                   </div>
                </div>
             </Card>
          )}
        </div>

        <div className="space-y-6">
           <Card className="p-6 border-slate-200/60 shadow-sm">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                 <Package size={16} className="text-primary-500" />
                 Target Asset
              </h4>
              <div className="flex items-center gap-4 mb-6">
                 <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400">
                    <Package size={24} />
                 </div>
                 <div>
                    <h5 className="font-bold text-slate-900 leading-tight">{item?.item_name || 'N/A'}</h5>
                    <p className="text-xs text-slate-500">ID: {item?._id.slice(-8)}</p>
                 </div>
              </div>
              
              <div className="space-y-3 pt-4 border-t border-slate-50">
                 <Button 
                    variant="ghost" 
                    className="w-full justify-start text-primary-600 hover:bg-primary-50 border border-primary-100/30"
                    onClick={() => navigate(ROUTES.ADMIN.INVENTORY.DETAILS(item?._id))}
                 >
                    <Eye size={16} className="mr-2" />
                    View Item Specs
                 </Button>
              </div>
           </Card>
           
           <Card className="p-6 border-slate-200/60 shadow-sm bg-slate-50/50">
              <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2 italic">
                 Note
              </h4>
              <p className="text-sm text-slate-500 leading-relaxed uppercase tracking-tight text-[10px]">
                 CLOSING A TICKET WILL AUTOMATICALLY ATTEMPT TO REVERT THE ITEM STATUS BACK TO "GOOD" IF NO OTHER OPEN TICKETS EXIST FOR THAT PARTICULAR ASSET.
              </p>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default QueryDetail;
