import {
  ChevronDown,
  DollarSign,
  ShoppingBag,
  Store,
  TrendingUp,
  Truck,
} from "lucide-react";
import { Dispatch, SetStateAction } from "react";
import Input from "../../../../components/common/Input";
import { SectionHeading } from "./SectionHeading";
import { Shop, ShopEntry, ShopMetrics, WeekCard } from "./types";
import { calcDerived, fmtNum, fmtPct } from "./utils";

export function ShopMetricsForm({
  entry,
  shops,
  setWeeks,
  weekId,
}: {
  entry: ShopEntry;
  shops: Shop[];
  disabledIds: string[];
  setWeeks: Dispatch<SetStateAction<WeekCard[]>>;
  weekId: string;
  canRemove: boolean;
}) {
  const onMetricChange = (key: keyof ShopMetrics, val: string) => {
    setWeeks((prev) =>
      prev.map((w) =>
        w.id === weekId
          ? {
              ...w,
              shops: w.shops.map((s) =>
                s.id === entry.id
                  ? { ...s, metrics: { ...s.metrics, [key]: val } }
                  : s,
              ),
            }
          : w,
      ),
    );
  };

  const onToggleCollapse = () => {
    setWeeks((prev) =>
      prev.map((w) =>
        w.id === weekId
          ? {
              ...w,
              shops: w.shops.map((s) =>
                s.id === entry.id ? { ...s, collapsed: !s.collapsed } : s,
              ),
            }
          : w,
      ),
    );
  };

  const m = entry.metrics;
  const d = calcDerived(m);

  const shopName = shops.find((s) => s._id === entry.shopId)?.name;

  return (
    <div className="bg-slate-50 rounded-xl border border-slate-200">
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
      {!entry.collapsed && (
        <div className="border-t border-slate-200">
          {entry.shopId ? (
            <div className="p-4 space-y-6">
              {/* KPI bar */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2">
                {[
                  {
                    label: "Net Sales",
                    val: `£${fmtNum(d.netSales)}`,
                    bg: "bg-blue-50 text-blue-700 border-blue-100",
                  },
                  {
                    label: "Delivery %",
                    val: fmtPct(d.deliveryPct),
                    bg: "bg-emerald-50 text-emerald-700 border-emerald-100",
                  },
                  {
                    label: "Total 3PD",
                    val: `£${fmtNum(d.total3PD)}`,
                    bg: "bg-orange-50 text-orange-700 border-orange-100",
                  },
                  // {
                  //   label: "Labour Cost %",
                  //   val: fmtPct(d.labourCostPct),
                  //   bg: "bg-violet-50 text-violet-700 border-violet-100",
                  // },
                  // {
                  //   label: "Food Cost %",
                  //   val: fmtPct(d.foodCostPct),
                  //   bg: "bg-rose-50 text-rose-700 border-rose-100",
                  // },
                  // {
                  //   label: "Total Cost %",
                  //   val: fmtPct(d.totalCostPct),
                  //   bg: "bg-slate-100 text-slate-700 border-slate-200",
                  // },
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

              {/* ── Sales ── */}
              <div>
                <SectionHeading
                  icon={<TrendingUp size={12} />}
                  title="Sales Overview"
                  accent="text-emerald-700"
                />
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                  <div>
                    <Input
                      label="Gross Sales"
                      type="number"
                      placeholder="2000.00"
                      value={m.grossSales}
                      onChange={(e) =>
                        onMetricChange("grossSales", e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>
                  <Input
                    type="number"
                    label="VAT"
                    placeholder="300.00"
                    value={m.vat}
                    onChange={(e) => onMetricChange("vat", e.target.value)}
                    className="text-sm"
                  />

                  <div>
                    <Input
                      label="VAT %"
                      type="text"
                      value={fmtPct(d.vatPct)}
                      disabled
                      readOnly
                      className="text-sm  cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Input
                      label="Adjusted VAT (12%)"
                      type="text"
                      value={fmtNum(d.adjustedVat)}
                      disabled
                      readOnly
                      className="text-sm  cursor-not-allowed"
                    />
                  </div>

                  <div className="col-span-4">
                    <Input
                      label="Customer Count"
                      type="number"
                      placeholder="100"
                      value={m.customerCount}
                      onChange={(e) =>
                        onMetricChange("customerCount", e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>

              {/* ── Delivery Platforms ── */}
              <div>
                <SectionHeading
                  icon={<Truck size={12} />}
                  title="Delivery Platforms"
                  accent="text-blue-700"
                />
                <div className="space-y-3">
                  {/* JustEat */}
                  <div className="bg-orange-50 rounded-xl border border-orange-100 overflow-hidden">
                    <div className="px-4 py-2 border-b border-orange-100">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-orange-600">
                        JustEat
                      </span>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4">
                      <div>
                        <Input
                          label="Sale"
                          type="number"
                          placeholder="0.00"
                          value={m.justEatSale}
                          onChange={(e) =>
                            onMetricChange("justEatSale", e.target.value)
                          }
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Input
                          label="Service Charge"
                          type="number"
                          placeholder="0.00"
                          value={m.justCharge}
                          onChange={(e) =>
                            onMetricChange("justCharge", e.target.value)
                          }
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Input
                          label="20% VAT"
                          type="number"
                          placeholder="0.00"
                          value={m.justEatVat}
                          onChange={(e) =>
                            onMetricChange("justEatVat", e.target.value)
                          }
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Input
                          label="Receive from JustEat"
                          type="text"
                          value={fmtNum(d.receiveFromJustEat)}
                          disabled
                          readOnly
                          className="text-sm cursor-not-allowed"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          label="Received in Bank"
                          type="number"
                          placeholder="0.00"
                          value={m.justEatBankReceived}
                          onChange={(e) =>
                            onMetricChange(
                              "justEatBankReceived",
                              e.target.value,
                            )
                          }
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          label="Variance from Bank"
                          type="number"
                          placeholder="0.00"
                          value={m.justEatVariance}
                          onChange={(e) =>
                            onMetricChange("justEatVariance", e.target.value)
                          }
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Uber Eats */}
                  <div className="bg-green-50 rounded-xl border border-green-100 overflow-hidden">
                    <div className="px-4 py-2 border-b border-green-100">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-green-700">
                        Uber Eats
                      </span>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4">
                      <div>
                        <Input
                          label="Sale"
                          type="number"
                          placeholder="0.00"
                          value={m.uberEatSale}
                          onChange={(e) =>
                            onMetricChange("uberEatSale", e.target.value)
                          }
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Input
                          label="Service Charge"
                          type="number"
                          placeholder="0.00"
                          value={m.uberEatCharge}
                          onChange={(e) =>
                            onMetricChange("uberEatCharge", e.target.value)
                          }
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Input
                          label="20% VAT"
                          type="number"
                          placeholder="0.00"
                          value={m.uberEatVat}
                          onChange={(e) =>
                            onMetricChange("uberEatVat", e.target.value)
                          }
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Input
                          label="Receive from Uber"
                          type="text"
                          value={fmtNum(d.receiveFromUber)}
                          disabled
                          readOnly
                          className="text-sm cursor-not-allowed"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          label="Received in Bank"
                          type="number"
                          placeholder="0.00"
                          value={m.uberEatBankReceived}
                          onChange={(e) =>
                            onMetricChange(
                              "uberEatBankReceived",
                              e.target.value,
                            )
                          }
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Input
                          label="Advertise Cost"
                          type="number"
                          placeholder="0.00"
                          value={m.uberAdvertise}
                          onChange={(e) =>
                            onMetricChange("uberAdvertise", e.target.value)
                          }
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Input
                          label="Discount %"
                          type="number"
                          placeholder="0"
                          value={m.uberDiscount}
                          onChange={(e) =>
                            onMetricChange("uberDiscount", e.target.value)
                          }
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Deliveroo */}
                  <div className="bg-teal-50 rounded-xl border border-teal-100 overflow-hidden">
                    <div className="px-4 py-2 border-b border-teal-100">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-teal-700">
                        Deliveroo
                      </span>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4">
                      <div>
                        <Input
                          label="Sale"
                          type="number"
                          placeholder="0.00"
                          value={m.deliverooSale}
                          onChange={(e) =>
                            onMetricChange("deliverooSale", e.target.value)
                          }
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Input
                          label="Service Charge"
                          type="number"
                          placeholder="0.00"
                          value={m.deliverooCharge}
                          onChange={(e) =>
                            onMetricChange("deliverooCharge", e.target.value)
                          }
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Input
                          label="20% VAT"
                          type="number"
                          placeholder="0.00"
                          value={m.deliverooVat}
                          onChange={(e) =>
                            onMetricChange("deliverooVat", e.target.value)
                          }
                          className="text-sm"
                        />
                      </div>
                      <div>
                        <Input
                          label="Receive from Deliveroo"
                          type="text"
                          value={fmtNum(d.receiveFromDeliveroo)}
                          disabled
                          readOnly
                          className="text-sm cursor-not-allowed"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          label="Received in Bank"
                          type="number"
                          placeholder="0.00"
                          value={m.deliverooBankReceived}
                          onChange={(e) =>
                            onMetricChange(
                              "deliverooBankReceived",
                              e.target.value,
                            )
                          }
                          className="text-sm"
                        />
                      </div>
                      <div className="col-span-2">
                        <Input
                          label="Variance from Bank"
                          type="number"
                          placeholder="0.00"
                          value={m.deliverooVariance}
                          onChange={(e) =>
                            onMetricChange("deliverooVariance", e.target.value)
                          }
                          className="text-sm"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Costs & Labour ── */}
              <div>
                <SectionHeading
                  icon={<DollarSign size={12} />}
                  title="Costs & Labour"
                  accent="text-violet-700"
                />
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-3">
                  <div>
                    <Input
                      label="Total Delivery Charges"
                      disabled
                      value={fmtNum(d.deliveryChargesTotal)}
                      readOnly
                      className="text-sm  cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Input
                      label="Delivery Charge %"
                      disabled
                      value={fmtPct(d.deliveryChargePct)}
                      readOnly
                      className="text-sm  cursor-not-allowed"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Input
                        label="Labour Hours"
                        type="number"
                        placeholder="35"
                        value={m.labourHours}
                        onChange={(e) =>
                          onMetricChange("labourHours", e.target.value)
                        }
                        className="text-sm"
                      />
                    </div>
                    <div>
                      <Input
                        label="Labour Cost (×£11.50)"
                        type="text"
                        value={fmtNum(d.labourCost)}
                        disabled
                        readOnly
                        className="text-sm  cursor-not-allowed"
                      />
                    </div>
                  </div>
                  <div>
                    <Input
                      label="Labour Cost %"
                      type="text"
                      value={fmtPct(d.labourCostPct)}
                      disabled
                      readOnly
                      className="text-sm  cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Input
                      label="Bidfood (BID FOOD)"
                      type="number"
                      placeholder="400.00"
                      value={m.bidFood}
                      onChange={(e) =>
                        onMetricChange("bidFood", e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Input
                      label="Food Cost %"
                      type="text"
                      value={fmtPct(d.foodCostPct)}
                      disabled
                      readOnly
                      className="text-sm  cursor-not-allowed"
                    />
                  </div>
                  <div />
                  <div>
                    <Input
                      label="Total Cost %"
                      type="text"
                      value={fmtPct(d.totalCostPct)}
                      disabled
                      readOnly
                      className="text-sm  cursor-not-allowed"
                    />
                  </div>
                  <div />
                </div>
              </div>

              {/* ── Instore & Bidfood ── */}
              <div>
                <SectionHeading
                  icon={<ShoppingBag size={12} />}
                  title="Instore & Bidfood"
                  accent="text-rose-700"
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <Input
                      label="Instore Food Cost"
                      type="number"
                      placeholder="0.00"
                      value={m.instoreFoodCost}
                      onChange={(e) =>
                        onMetricChange("instoreFoodCost", e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Input
                      label="Instore Labour Cost"
                      type="number"
                      placeholder="0.00"
                      value={m.instoreLabourCost}
                      onChange={(e) =>
                        onMetricChange("instoreLabourCost", e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Input
                      label="Bidfood Total (this week)"
                      type="text"
                      value={fmtNum(d.bidfoodTotal)}
                      disabled
                      readOnly
                      className="text-sm  cursor-not-allowed"
                    />
                  </div>
                  <div>
                    <Input
                      label="Bidfood Previous Week"
                      type="number"
                      placeholder="0.00"
                      value={m.bidfoodPreviousWeek}
                      onChange={(e) =>
                        onMetricChange("bidfoodPreviousWeek", e.target.value)
                      }
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="px-4 py-6 text-center text-slate-400 text-sm">
              Select a shop above to enter weekly data
            </div>
          )}
        </div>
      )}
    </div>
  );
}
