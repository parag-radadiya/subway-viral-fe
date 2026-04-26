import { ChevronDown, Trash2 } from "lucide-react";
import React, { useState } from "react";
import Input from "../../../../components/common/Input";
import { MonthCard, MonthlyShopMetricsForm } from "./MonthlyShopMetricsForm";

export function MonthCardComponent({
  month,
  setMonths,
  allShops,
  index,
  canRemoveMonth,
}: {
  month: MonthCard;
  setMonths: React.Dispatch<React.SetStateAction<MonthCard[]>>;
  allShops: any[];
  index: number;
  canRemoveMonth: boolean;
}) {
  const [expanded, setExpanded] = useState(true);

  const usedShopIds = month.shops.map((s) => s.shopId).filter(Boolean);

  const handleUpdateMonth = (val: string) => {
    // Only allow 1 to 12
    const m = parseInt(val, 10);
    if (val === "" || (!isNaN(m) && m >= 1 && m <= 12)) {
      setMonths((prev) =>
        prev.map((mc) =>
          mc.id === month.id ? { ...mc, monthNumber: val } : mc,
        ),
      );
    }
  };

  const handleUpdateYear = (val: string) => {
    setMonths((prev) =>
      prev.map((mc) => (mc.id === month.id ? { ...mc, year: val } : mc)),
    );
  };

  const onRemoveMonth = () => {
    setMonths((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((mc) => mc.id !== month.id);
    });
  };

  // Compute dates for viewing purpose
  let startLabel = "";
  let endLabel = "";
  if (month.monthNumber && month.year) {
    const mStr = month.monthNumber.padStart(2, "0");
    const yStr = month.year;
    // Last day of month
    const d = new Date(parseInt(yStr, 10), parseInt(mStr, 10), 0);
    const lastDay = d.getDate();
    startLabel = `${yStr}-${mStr}-01`;
    endLabel = `${yStr}-${mStr}-${String(lastDay).padStart(2, "0")}`;
  }

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const mIndex = parseInt(month.monthNumber, 10);
  const mName =
    !isNaN(mIndex) && mIndex >= 1 && mIndex <= 12
      ? monthNames[mIndex - 1]
      : "Unknown";

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      {/* Header */}
      <div
        className={`flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-slate-800 to-slate-700 text-white cursor-pointer select-none ${expanded ? "rounded-t-2xl" : "rounded-2xl"}`}
        onClick={() => setExpanded((v) => !v)}
      >
        <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold shrink-0">
          {index + 1}
        </span>
        <div className="flex-1">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
            {month.year ? month.year : "Year not set"}
          </p>
          <p className="text-sm font-bold">
            {month.monthNumber
              ? `${mName} (Month ${month.monthNumber})`
              : "Set month below"}
          </p>
        </div>
        <span
          className="transition-transform duration-200 text-slate-300"
          style={{
            transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        >
          <ChevronDown size={18} />
        </span>
        {canRemoveMonth && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveMonth();
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-300 transition-colors"
            title="Remove month"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {/* Body */}
      {expanded && (
        <>
          {/* Metadata Row */}
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-3 items-end">
            <Input
              label="Year"
              type="number"
              min={2000}
              max={2100}
              value={month.year}
              onChange={(e) => handleUpdateYear(e.target.value)}
            />
            <Input
              label="Month Number"
              type="number"
              min={1}
              max={12}
              value={month.monthNumber}
              onChange={(e) => handleUpdateMonth(e.target.value)}
            />
            <Input
              label="Calculated Start Date"
              type="date"
              value={startLabel}
              disabled
            />
            <Input
              label="Calculated End Date"
              type="date"
              value={endLabel}
              disabled
            />
          </div>

          <div className="p-5 space-y-4">
            {month.shops.map((shopEntry) => (
              <MonthlyShopMetricsForm
                key={shopEntry.id}
                entry={shopEntry}
                shops={allShops}
                disabledIds={usedShopIds.filter(
                  (id) => id !== shopEntry.shopId,
                )}
                setMonths={setMonths}
                monthId={month.id}
                canRemove={false}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
