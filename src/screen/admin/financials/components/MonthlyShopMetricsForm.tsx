import { ChevronDown, Store, Trash2 } from "lucide-react";
import React from "react";
import Input from "../../../../components/common/Input";
import { fmtNum, fmtPct, n } from "./utils";

export interface MonthlyShopEntry {
  id: string;
  shopId: string;
  collapsed?: boolean;
  metrics: {
    grossSale: string;
    netSale: string;
    customerCount: string;
    bidfood: string;
    labourHour: string;
    kioskPct: string;
    revScoreQ1: string;
  };
}

export interface MonthCard {
  id: string;
  monthNumber: string;
  year: string;
  shops: MonthlyShopEntry[];
}

export const newMonthlyShopEntry = (): MonthlyShopEntry => ({
  id: Math.random().toString(36).substring(2, 9),
  shopId: "",
  collapsed: true,
  metrics: {
    grossSale: "",
    netSale: "",
    customerCount: "",
    bidfood: "",
    labourHour: "",
    kioskPct: "",
    revScoreQ1: "",
  },
});

export const newMonthCard = (): MonthCard => ({
  id: Math.random().toString(36).substring(2, 9),
  monthNumber: String(new Date().getMonth() + 1),
  year: String(new Date().getFullYear()),
  shops: [],
});

interface MonthlyShopMetricsFormProps {
  entry: MonthlyShopEntry;
  shops: any[];
  disabledIds: string[];
  setMonths: React.Dispatch<React.SetStateAction<MonthCard[]>>;
  monthId: string;
  canRemove: boolean;
}

export function MonthlyShopMetricsForm({
  entry,
  shops,
  setMonths,
  monthId,
  canRemove,
}: MonthlyShopMetricsFormProps) {
  const m = entry.metrics;

  const onUpdateField = (field: keyof typeof m, val: string) => {
    setMonths((prev) =>
      prev.map((mc) =>
        mc.id === monthId
          ? {
              ...mc,
              shops: mc.shops.map((s) =>
                s.id === entry.id
                  ? { ...s, metrics: { ...s.metrics, [field]: val } }
                  : s,
              ),
            }
          : mc,
      ),
    );
  };

  const onToggleCollapse = () => {
    setMonths((prev) =>
      prev.map((mc) =>
        mc.id === monthId
          ? {
              ...mc,
              shops: mc.shops.map((s) =>
                s.id === entry.id ? { ...s, collapsed: !s.collapsed } : s,
              ),
            }
          : mc,
      ),
    );
  };

  const onRemove = () => {
    setMonths((prev) =>
      prev.map((mc) =>
        mc.id === monthId
          ? { ...mc, shops: mc.shops.filter((s) => s.id !== entry.id) }
          : mc,
      ),
    );
  };

  // Calculations
  const gross = n(m.grossSale);
  const net = n(m.netSale);
  const vat = gross - net;
  const vatPct = net > 0 ? ((vat / net) * 100) / 100 : 0;
  const bidfood = n(m.bidfood);
  const bidfoodPct = net > 0 ? ((bidfood / net) * 100) / 100 : 0;
  const labourHour = n(m.labourHour);
  const labourCost = labourHour * 11.5;
  const labourPct = net > 0 ? ((labourCost / net) * 100) / 100 : 0;
  const totalCogs = bidfoodPct + labourPct;

  const shopName =
    shops.find((s) => s._id === entry.shopId)?.name || "Unknown Shop";

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200 relative group transition-all hover:shadow-md">
      {/* Remove button */}
      {canRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="absolute -top-3 -right-3 w-7 h-7 rounded-full bg-white border border-rose-200 text-rose-500 flex items-center justify-center hover:bg-rose-50 hover:scale-110 transition-all opacity-0 group-hover:opacity-100 z-10 shadow-sm"
          title="Remove shop"
        >
          <Trash2 size={13} />
        </button>
      )}

      {/* Shop Header Bar */}
      <div
        className="flex items-center gap-2 p-3 bg-white rounded-xl hover:bg-slate-100 cursor-pointer"
        onClick={onToggleCollapse}
      >
        <Store size={14} className="text-slate-400 shrink-0" />
        <span className="text-sm font-semibold text-slate-800 flex-1 truncate">
          {shopName}
        </span>
        <button
          type="button"
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 transition-colors shrink-0"
          title={entry.collapsed ? "Expand" : "Collapse"}
        >
          <ChevronDown
            size={14}
            className={`transition-transform duration-200 ${entry.collapsed ? "" : "rotate-180"}`}
          />
        </button>
      </div>

      {/* Collapsible Body */}
      {!entry.collapsed && (
        <div className="border-t border-slate-200 p-4">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3 mb-4">
            <Input
              label="Gross Sale"
              type="number"
              step="0.01"
              value={m.grossSale}
              onChange={(e) => onUpdateField("grossSale", e.target.value)}
            />
            <Input
              label="Net Sale"
              type="number"
              step="0.01"
              value={m.netSale}
              onChange={(e) => onUpdateField("netSale", e.target.value)}
            />
            <Input
              label="Customer Count"
              type="number"
              value={m.customerCount}
              onChange={(e) => onUpdateField("customerCount", e.target.value)}
            />
            <Input
              label="Bidfood"
              type="number"
              step="0.01"
              value={m.bidfood}
              onChange={(e) => onUpdateField("bidfood", e.target.value)}
            />
            <Input
              label="Labour Hour"
              type="number"
              step="0.01"
              value={m.labourHour}
              onChange={(e) => onUpdateField("labourHour", e.target.value)}
            />
            <Input
              label="Kiosk %"
              type="number"
              step="0.01"
              value={m.kioskPct}
              onChange={(e) => onUpdateField("kioskPct", e.target.value)}
            />
            <Input
              label="Rev Score Q1"
              type="number"
              step="0.01"
              value={m.revScoreQ1}
              onChange={(e) => onUpdateField("revScoreQ1", e.target.value)}
            />
          </div>

          {/* Computed values summary row */}
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-3 border-t border-dashed border-slate-200">
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col items-center text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Vat
              </span>
              <span className="font-semibold text-slate-700 text-sm">
                £{fmtNum(vat)}
              </span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col items-center text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Vat %
              </span>
              <span className="font-semibold text-slate-700 text-sm">
                {net > 0 ? fmtPct(vatPct) : "#DIV/0!"}
              </span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col items-center text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Bidfood %
              </span>
              <span className="font-semibold text-slate-700 text-sm">
                {net > 0 ? fmtPct(bidfoodPct) : "#DIV/0!"}
              </span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col items-center text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Labour Cost
              </span>
              <span className="font-semibold text-slate-700 text-sm">
                £{fmtNum(labourCost)}
              </span>
            </div>
            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex flex-col items-center text-center">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">
                Labour %
              </span>
              <span className="font-semibold text-slate-700 text-sm">
                {net > 0 ? fmtPct(labourPct) : "#DIV/0!"}
              </span>
            </div>
            <div className="bg-rose-50 p-2 rounded-lg border border-rose-100 flex flex-col items-center text-center">
              <span className="text-[10px] font-bold text-rose-500 uppercase tracking-widest mb-0.5">
                TOTAL COGS
              </span>
              <span className="font-bold text-rose-700 text-sm">
                {net > 0 ? fmtPct(totalCogs) : "#DIV/0!"}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
