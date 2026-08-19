import { useState } from "react";
import { AlertTriangle, DatabaseZap } from "lucide-react";
import { toast } from "react-toastify";
import Button from "../../components/common/Button";
import Dialog from "../../components/common/Dialog";
import { sandboxApi } from "../../config/apiCall";

const Configuration = () => {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [isCloning, setIsCloning] = useState(false);

  const handleClone = async () => {
    setIsCloning(true);
    try {
      const summary = await sandboxApi.clone();
      toast.success(
        `Sandbox refreshed: ${summary.collections_cloned} collections, ` +
          `${summary.total_documents.toLocaleString()} docs in ` +
          `${(summary.duration_ms / 1000).toFixed(1)}s`,
      );
      setConfirmOpen(false);
    } catch (err: any) {
      toast.error(err?.message || "Failed to clone production to sandbox");
    } finally {
      setIsCloning(false);
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h1 className="text-2xl font-bold text-slate-800 mb-1">
        Configuration
      </h1>
      <p className="text-slate-500 font-medium mb-6">
        Root-only operational tools.
      </p>

      <div className="border border-slate-200 rounded-xl p-5 flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="p-2.5 bg-accent-50 rounded-lg text-accent-600 shrink-0">
            <DatabaseZap size={20} />
          </div>
          <div>
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">
              Clone Production to Sandbox
            </h2>
            <p className="text-slate-500 text-sm mt-1 max-w-xl">
              Drops and rebuilds every sandbox collection as an exact
              snapshot of production. Never writes to production. Safe to
              re-run anytime.
            </p>
          </div>
        </div>
        <Button
          variant="danger"
          onClick={() => setConfirmOpen(true)}
          leftIcon={<DatabaseZap size={16} />}
        >
          Clone to Sandbox
        </Button>
      </div>

      <Dialog
        isOpen={confirmOpen}
        onClose={() => !isCloning && setConfirmOpen(false)}
        title="Confirm Sandbox Refresh"
        maxWidth="md"
        footer={
          <>
            <Button
              variant="secondary"
              onClick={() => setConfirmOpen(false)}
              disabled={isCloning}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleClone}
              isLoading={isCloning}
            >
              Erase &amp; Clone
            </Button>
          </>
        }
      >
        <div className="flex items-start gap-3">
          <AlertTriangle
            className="text-amber-500 shrink-0 mt-0.5"
            size={20}
          />
          <p className="text-sm text-slate-600">
            This will <strong>erase the sandbox database</strong> and replace
            it with a fresh copy of production. This can take several
            seconds. Continue?
          </p>
        </div>
      </Dialog>
    </div>
  );
};

export default Configuration;
