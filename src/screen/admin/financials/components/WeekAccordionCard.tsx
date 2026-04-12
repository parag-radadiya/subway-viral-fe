import { ChevronDown, Eye } from "lucide-react";
import { useState } from "react";
import { fmtNum, fmtPct, n } from "./utils";

interface WeekAccordionCardProps {
  weekRange: string;
  shops: any[];
  onView: (record: any) => void;
}

export function WeekAccordionCard({
  weekRange,
  shops,
  onView,
}: WeekAccordionCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const first = shops[0] ?? {};

  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
      {/* ── Week header ── */}
      <button
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-slate-800 to-slate-700 text-white text-left"
      >
        {/* Week badge */}
        <div className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center text-xs font-black shrink-0">
          W{first.weekNumber}
        </div>

        {/* Labels */}
        <div className="flex-1 min-w-0">
          <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">
            {first.year}
          </p>
          <p className="text-sm font-bold truncate">{weekRange}</p>
        </div>

        {/* Shop count badge */}
        <span className="text-[10px] font-bold bg-white/10 px-2.5 py-1 rounded-full shrink-0">
          {shops.length} {shops.length === 1 ? "shop" : "shops"}
        </span>

        {/* Chevron */}
        <ChevronDown
          size={16}
          className={`shrink-0 transition-transform duration-200 text-slate-400 ${
            isOpen ? "" : "-rotate-90"
          }`}
        />
      </button>

      {/* ── Shop rows ── */}
      {isOpen && (
        <div className="divide-y divide-slate-100 bg-white">
          {shops.map((record: any) => {
            const m = record.metrics ?? {};
            const totalCost = n(m["TOTAL COST %"]);
            const badgeColour =
              totalCost > 70
                ? "text-rose-700 bg-rose-50 border-rose-200"
                : totalCost > 55
                  ? "text-amber-700 bg-amber-50 border-amber-200"
                  : "text-emerald-700 bg-emerald-50 border-emerald-200";

            return (
              <div
                key={record.id ?? record._id}
                className="flex items-center gap-4 px-5 py-3.5 hover:bg-slate-50/60 transition-colors"
              >
                {/* Shop indicator */}
                <div className="w-2 h-2 rounded-full bg-slate-300 shrink-0 ml-1" />

                {/* Shop name */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-700 truncate">
                    {record.shopName ?? "—"}
                  </p>
                </div>

                {/* KPIs */}
                <div className="hidden sm:flex items-center gap-5 shrink-0">
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest">
                      Net Sales
                    </p>
                    <p className="text-xs font-bold text-emerald-700">
                      £{fmtNum(n(m["NET SALES"]))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest">
                      Labour %
                    </p>
                    <p className="text-xs font-bold text-violet-700">
                      {fmtPct(n(m["Labour cost %"]))}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-[9px] text-slate-400 font-semibold uppercase tracking-widest">
                      Food %
                    </p>
                    <p className="text-xs font-bold text-orange-700">
                      {fmtPct(n(m["Food cost %"]))}
                    </p>
                  </div>
                  <span
                    className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full border ${badgeColour}`}
                  >
                    {fmtPct(totalCost)}
                  </span>
                </div>

                {/* View button */}
                <button
                  onClick={() => onView(record)}
                  className="ml-2 inline-flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-800 hover:bg-primary-50 px-3 py-1.5 rounded-lg transition-colors shrink-0"
                >
                  <Eye size={14} />
                  View
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
