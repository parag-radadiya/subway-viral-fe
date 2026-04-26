import {
  endOfISOWeek,
  format,
  getISOWeek,
  setISOWeek,
  startOfISOWeek,
} from "date-fns";
import {
  ChevronDown,
  DollarSign,
  ShoppingBag,
  Trash2,
  TrendingUp,
  Truck,
} from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";
import Input from "../../../../components/common/Input";
import { SectionHeading } from "./SectionHeading";
import { ShopMetricsForm } from "./ShopMetricsForm";
import { Shop, WeekCard } from "./types";
import { aggregateWeekMetrics, calcDerived, fmtNum, fmtPct, n } from "./utils";

export function WeekCardComponent({
  week,
  setWeeks,
  allShops,
  index,
  canRemoveWeek,
}: {
  week: WeekCard;
  setWeeks: Dispatch<SetStateAction<WeekCard[]>>;
  allShops: Shop[];
  index: number;
  canRemoveWeek: boolean;
}) {
  const usedShopIds = week.shops.map((s) => s.shopId).filter(Boolean);

  // const onUpdateDates = (field: "startDate" | "endDate", val: string) => {
  //   setWeeks((prev) =>
  //     prev.map((w) => (w.id === week.id ? { ...w, [field]: val } : w)),
  //   );
  // };

  const onRemoveWeek = () => {
    setWeeks((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((w) => w.id !== week.id);
    });
  };

  const dateLabel = () => {
    if (!week.startDate && !week.endDate) return null;
    const fmt = (ds: string) => {
      if (!ds) return "";
      return format(new Date(ds), "dd MMM yyyy");
    };
    return `${fmt(week.startDate)}${week.endDate ? ` → ${fmt(week.endDate)}` : ""}`;
  };

  const agg = aggregateWeekMetrics(week);
  const d = calcDerived(agg);
  const hasShops = week.shops.some((s) => !!s.shopId);

  const [weekExpanded, setWeekExpanded] = useState(true);
  const [summaryExpanded, setSummaryExpanded] = useState(true);

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm">
      {/* Week header */}
      <div
        className={`flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-slate-800 to-slate-700 text-white cursor-pointer select-none ${weekExpanded ? "rounded-t-2xl" : "rounded-2xl"}`}
        onClick={() => setWeekExpanded((v) => !v)}
      >
        <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold shrink-0">
          {index + 1}
        </span>
        <div className="flex-1">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
            Week {index + 1}
          </p>
          <p className="text-sm font-bold">
            {dateLabel() ?? "Set date range below"}
          </p>
        </div>
        {/* Expand / collapse chevron */}
        <span
          className="transition-transform duration-200 text-slate-300"
          style={{
            transform: weekExpanded ? "rotate(0deg)" : "rotate(-90deg)",
          }}
        >
          <ChevronDown size={18} />
        </span>
        {canRemoveWeek && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onRemoveWeek();
            }}
            className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-300 transition-colors"
            title="Remove week"
          >
            <Trash2 size={15} />
          </button>
        )}
      </div>

      {/* Collapsible body */}
      {weekExpanded && (
        <>
          {/* Date range row */}
          <div className="px-5 py-3 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-3 items-end">
            <Input
              label="Week Number"
              type="number"
              min={1}
              max={53}
              value={week.startDate ? getISOWeek(new Date(week.startDate)) : ""}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                const val = e.target.value;
                const wn = parseInt(val, 10);
                if (val === "") {
                  setWeeks((prev) =>
                    prev.map((w) =>
                      w.id === week.id
                        ? { ...w, startDate: "", endDate: "" }
                        : w,
                    ),
                  );
                } else if (!isNaN(wn) && wn >= 1 && wn <= 53) {
                  const dateInWeek = setISOWeek(new Date(), wn);
                  const start = startOfISOWeek(dateInWeek);
                  const end = endOfISOWeek(dateInWeek);
                  setWeeks((prev) =>
                    prev.map((w) =>
                      w.id === week.id
                        ? {
                            ...w,
                            startDate: format(start, "yyyy-MM-dd"),
                            endDate: format(end, "yyyy-MM-dd"),
                          }
                        : w,
                    ),
                  );
                }
              }}
            />
            <Input
              label="Week Start"
              type="date"
              value={week.startDate}
              disabled
            />
            <Input label="Week End" type="date" value={week.endDate} disabled />
          </div>

          {/* Shop entries */}
          <div className="p-5 space-y-4">
            {week.shops.map((shopEntry) => (
              <ShopMetricsForm
                key={shopEntry.id}
                entry={shopEntry}
                shops={allShops}
                disabledIds={usedShopIds.filter(
                  (id) => id !== shopEntry.shopId,
                )}
                setWeeks={setWeeks}
                weekId={week.id}
                canRemove={true}
              />
            ))}

            {/* Weekly Summary */}
            {hasShops && (
              <div className="mt-6 pt-6 border-t border-slate-200">
                {/* Summary toggle header */}
                <button
                  type="button"
                  onClick={() => setSummaryExpanded((v) => !v)}
                  className="w-full flex items-center justify-between mb-4 group"
                >
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
                    Weekly Aggregate Summary
                  </h3>
                  <span
                    className="text-slate-400 group-hover:text-slate-600 transition-all duration-200"
                    style={{
                      transform: summaryExpanded
                        ? "rotate(0deg)"
                        : "rotate(-90deg)",
                      display: "inline-block",
                    }}
                  >
                    <ChevronDown size={16} />
                  </span>
                </button>

                {/* KPI Top Bar + detail grid — only shown when expanded */}
                {summaryExpanded && (
                  <>
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-2 mb-6">
                      {[
                        {
                          label: "Net Sales",
                          val: `£${fmtNum(d.netSales)}`,
                          bg: "bg-blue-50 text-blue-700 border-blue-100",
                        },
                        {
                          label: "Total 3PD",
                          val: `£${fmtNum(d.total3PD)}`,
                          bg: "bg-orange-50 text-orange-700 border-orange-100",
                        },
                        {
                          label: "Delivery %",
                          val: fmtPct(d.deliveryPct),
                          bg: "bg-emerald-50 text-emerald-700 border-emerald-100",
                        },
                        {
                          label: "Labour Cost %",
                          val: fmtPct(d.labourCostPct),
                          bg: "bg-violet-50 text-violet-700 border-violet-100",
                        },
                        {
                          label: "Food Cost %",
                          val: fmtPct(d.foodCostPct),
                          bg: "bg-rose-50 text-rose-700 border-rose-100",
                        },
                        {
                          label: "Total Cost %",
                          val: fmtPct(d.totalCostPct),
                          bg: "bg-slate-100 text-slate-700 border-slate-200",
                        },
                      ].map((k) => (
                        <div
                          key={k.label}
                          className={`rounded-lg border px-3 py-2 ${k.bg}`}
                        >
                          <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-0.5">
                            {k.label}
                          </p>
                          <p className="text-sm font-extrabold">{k.val}</p>
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                      {/* Sales Overview */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <SectionHeading
                          icon={<TrendingUp size={12} />}
                          title="Sales"
                          accent="text-emerald-700"
                        />
                        <div className="space-y-2 mt-3">
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">
                              Gross Sales
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              £{fmtNum(n(agg.grossSales))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">VAT</span>
                            <span className="text-xs font-bold text-slate-700">
                              £{fmtNum(n(agg.vat))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">
                              VAT %
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              {fmtPct(d.vatPct)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">
                              Adjusted VAT
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              £{fmtNum(d.adjustedVat)}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-slate-200">
                            <span className="text-xs text-slate-500 font-semibold">
                              Net Sales
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              £{fmtNum(d.netSales)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500 font-semibold">
                              Delivery %
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {fmtPct(d.deliveryPct)}
                            </span>
                          </div>
                          <div className="flex justify-between ">
                            <span className="text-xs text-slate-500 font-semibold">
                              Total 3PD Sale
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              £{fmtNum(d.total3PD)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">
                              Customer Count
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              {fmtNum(n(agg.customerCount))}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Delivery Platforms */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <SectionHeading
                          icon={<Truck size={12} />}
                          title="Delivery"
                          accent="text-blue-700"
                        />
                        <div className="space-y-4 mt-3">
                          <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                              JustEat
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-slate-500">
                                Sale
                              </span>
                              <span className="text-xs font-bold text-slate-700">
                                £{fmtNum(n(agg.justEatSale))}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-slate-500">
                                Charge
                              </span>
                              <span className="text-xs font-bold text-slate-700">
                                £{fmtNum(n(agg.justCharge))}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-slate-500">
                                20% VAT
                              </span>
                              <span className="text-xs font-bold text-slate-700">
                                £{fmtNum(n(agg.justEatVat))}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-slate-500">
                                Receive
                              </span>
                              <span className="text-xs font-bold text-slate-700">
                                £{fmtNum(d.receiveFromJustEat)}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                              Uber Eats
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-slate-500">
                                Sale
                              </span>
                              <span className="text-xs font-bold text-slate-700">
                                £{fmtNum(n(agg.uberEatSale))}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-slate-500">
                                Charge
                              </span>
                              <span className="text-xs font-bold text-slate-700">
                                £{fmtNum(n(agg.uberEatCharge))}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-slate-500">
                                20% VAT
                              </span>
                              <span className="text-xs font-bold text-slate-700">
                                £{fmtNum(n(agg.uberEatVat))}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-slate-500">
                                Receive
                              </span>
                              <span className="text-xs font-bold text-slate-700">
                                £{fmtNum(d.receiveFromUber)}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-slate-500">
                                Advertise
                              </span>
                              <span className="text-xs font-bold text-slate-700">
                                £{fmtNum(n(agg.uberAdvertise))}
                              </span>
                            </div>
                          </div>
                          <div>
                            <div className="text-[10px] uppercase font-bold text-slate-400 mb-1">
                              Deliveroo
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-slate-500">
                                Sale
                              </span>
                              <span className="text-xs font-bold text-slate-700">
                                £{fmtNum(n(agg.deliverooSale))}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-slate-500">
                                Charge
                              </span>
                              <span className="text-xs font-bold text-slate-700">
                                £{fmtNum(n(agg.deliverooCharge))}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-slate-500">
                                20% VAT
                              </span>
                              <span className="text-xs font-bold text-slate-700">
                                £{fmtNum(n(agg.deliverooVat))}
                              </span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-xs text-slate-500">
                                Receive
                              </span>
                              <span className="text-xs font-bold text-slate-700">
                                £{fmtNum(d.receiveFromDeliveroo)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Costs & Labour */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <SectionHeading
                          icon={<DollarSign size={12} />}
                          title="Costs & Labour"
                          accent="text-violet-700"
                        />
                        <div className="space-y-2 mt-3">
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">
                              Delivery Total
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              £{fmtNum(d.deliveryChargesTotal)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">
                              Delivery %
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              {fmtPct(d.deliveryChargePct)}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-slate-200">
                            <span className="text-xs text-slate-500">
                              Labour Hours
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              {fmtNum(n(agg.labourHours))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">
                              Labour Cost
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              £{fmtNum(d.labourCost)}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">
                              Labour Cost %
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              {fmtPct(d.labourCostPct)}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-slate-200">
                            <span className="text-xs text-slate-500">
                              Food Cost (BID)
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              £{fmtNum(n(agg.bidFood))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">
                              Food Cost %
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              {fmtPct(d.foodCostPct)}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-slate-200">
                            <span className="text-xs text-slate-500 font-semibold">
                              Total Cost %
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              {fmtPct(d.totalCostPct)}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Instore & Variables */}
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                        <SectionHeading
                          icon={<ShoppingBag size={12} />}
                          title="Instore & Variables"
                          accent="text-rose-700"
                        />
                        <div className="space-y-2 mt-3">
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">
                              Instore Food Cost
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              {fmtPct(
                                n(agg.instoreFoodCost) /
                                  week.shops.length /
                                  100,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500">
                              Instore Labour Cost
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              {fmtPct(
                                n(agg.instoreLabourCost) /
                                  week.shops.length /
                                  100,
                              )}
                            </span>
                          </div>
                          <div className="flex justify-between pt-2 border-t border-slate-200">
                            <span className="text-xs text-slate-500">
                              Bidfood Prev Week
                            </span>
                            <span className="text-xs font-bold text-slate-700">
                              £{fmtNum(n(agg.bidfoodPreviousWeek))}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-xs text-slate-500 font-semibold">
                              Bidfood Diff Total
                            </span>
                            <span className="text-xs font-bold text-slate-800">
                              £{fmtNum(d.bidfoodTotal)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
