import { Package, PlusCircle, Search } from "lucide-react";
import { Card } from "../../components/common/Card";

const Inventory = () => (
  <div className="max-w-7xl mx-auto space-y-6 animate-fade-in-up">
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold text-primary-900">Inventory</h1>
      <button className="btn-primary">
        <PlusCircle size={16} />
        Add Item
      </button>
    </div>
    <Card>
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input placeholder="Search items…" className="form-input pl-9" />
        </div>
      </div>
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Package size={40} className="text-slate-300 mb-3" />
        <p className="text-slate-500 font-medium">Inventory management coming soon</p>
        <p className="text-slate-400 text-sm mt-1">
          Connect to <code className="bg-slate-100 px-1 py-0.5 rounded text-xs">/api/inventory/items</code> to populate
        </p>
      </div>
    </Card>
  </div>
);

export default Inventory;
