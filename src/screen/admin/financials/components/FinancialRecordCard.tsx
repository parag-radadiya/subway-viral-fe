import { useState } from "react";
import {
  ChevronDown,
  DollarSign,
  ShoppingBag,
  TrendingUp,
  Truck,
} from "lucide-react";
import { SectionHeading } from "./SectionHeading";
import { fmtNum, fmtPct, n } from "./utils";

export function FinancialRecordCard({
  record,
  defaultExpanded = false,
}: {
  record: any;
  defaultExpanded?: boolean;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const m = record.metrics || {};

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm mb-4">
      {/* Header */}
      <div
        className={`flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-slate-800 to-slate-700 text-white cursor-pointer ${expanded ? "rounded-t-2xl" : "rounded-2xl"}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold shrink-0">
          W{record.weekNumber}
        </div>
        <div className="flex-1">
          <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
            {record.shopName}
          </p>
          <p className="text-sm font-bold">
            {record.weekRange} ({record.year})
          </p>
        </div>

        <div className="hidden sm:flex gap-6 mr-4 items-center">
          <div className="text-right">
            <p className="text-[9px] text-white/60 font-medium uppercase tracking-widest">
              Net Sales
            </p>
            <p className="text-sm font-bold text-emerald-400">
              £{fmtNum(n(m["NET SALES"]))}
            </p>
          </div>
          <div className="text-right">
            <p className="text-[9px] text-white/60 font-medium uppercase tracking-widest">
              Total Cost
            </p>
            <p className="text-sm font-bold text-rose-400">
              {fmtPct(n(m["TOTAL COST %"]))}
            </p>
          </div>
        </div>

        <button className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors">
          <ChevronDown
            size={16}
            className={`transition-transform duration-200 ${expanded ? "" : "rotate-180"}`}
          />
        </button>
      </div>

      {/* Expanded Body */}
      {expanded && (
        <div className="p-5">
          {" "}
          {/* KPI Top Bar */}
          <div className="flex flex-wrap gap-2 mb-4">
            {[
              {
                label: "Net Sales",
                val: `£${fmtNum(n(m["NET SALES"]))}`,
                bg: "bg-blue-50 text-blue-700 border-blue-100",
              },
              {
                label: "Total 3PD",
                val: `£${fmtNum(n(m["Total 3PD Sale"]))}`,
                bg: "bg-orange-50 text-orange-700 border-orange-100",
              },
              {
                label: "Delivery %",
                val: fmtPct(n(m["Delivery %"])),
                bg: "bg-emerald-50 text-emerald-700 border-emerald-100",
              },
              {
                label: "Labour Cost %",
                val: fmtPct(n(m["Labour cost %"])),
                bg: "bg-violet-50 text-violet-700 border-violet-100",
              },
              {
                label: "Food Cost %",
                val: fmtPct(n(m["Food cost %"])),
                bg: "bg-rose-50 text-rose-700 border-rose-100",
              },
              {
                label: "Total Cost %",
                val: fmtPct(n(m["TOTAL COST %"])),
                bg: "bg-slate-100 text-slate-700 border-slate-200",
              },
            ].map((k) => (
              <div
                key={k.label}
                className={`flex-1 min-w-[120px] rounded-lg border px-3 py-2 ${k.bg}`}
              >
                <p className="text-[9px] font-bold uppercase tracking-widest opacity-60 mb-0.5">
                  {k.label}
                </p>
                <p className="text-xs font-extrabold">{k.val}</p>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-3">
            {/* Sales Overview */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm">
              <SectionHeading
                icon={<TrendingUp size={12} />}
                title="Sales"
                accent="text-emerald-700"
              />
              <div className="space-y-1.5 mt-3 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Gross Sales</span>
                  <span className="font-bold text-slate-700">
                    £{fmtNum(n(m["GROSS SALES"]))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">VAT</span>
                  <span className="font-bold text-slate-700">
                    £{fmtNum(n(m["VAT"]))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">VAT %</span>
                  <span className="font-bold text-slate-700">
                    {fmtPct(n(m["VAT %"]))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Adjusted VAT</span>
                  <span className="font-bold text-slate-700">
                    £{fmtNum(n(m["Adjusted VAT"]))}
                  </span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-200">
                  <span className="text-slate-500 font-semibold">
                    Net Sales
                  </span>
                  <span className="font-bold text-slate-800">
                    £{fmtNum(n(m["NET SALES"]))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">
                    Delivery %
                  </span>
                  <span className="font-bold text-slate-800">
                    {fmtPct(n(m["Delivery %"]))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 font-semibold">
                    Total 3PD Sale
                  </span>
                  <span className="font-bold text-slate-800">
                    £{fmtNum(n(m["Total 3PD Sale"]))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Customer Count</span>
                  <span className="font-bold text-slate-700">
                    {fmtNum(n(m["Customer Count"]))}
                  </span>
                </div>
              </div>
            </div>

            {/* Delivery Platforms */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm">
              <SectionHeading
                icon={<Truck size={12} />}
                title="Delivery"
                accent="text-blue-700"
              />
              <div className="space-y-3 mt-3 text-[11px]">
                {[
                  {
                    name: "JustEat",
                    sale: m["JustEat Sale"],
                    charge: m["JUST Charge"],
                    vat: m["JustEat 20% Vat"],
                    receive: m["Receive from Justeat"],
                  },
                  {
                    name: "Uber Eats",
                    sale: m["UberEat Sale"],
                    charge: m["UBEREAT Charge"],
                    vat: m["UBEREAT 20% Vat"],
                    receive: m["Receive From Uber"],
                  },
                  {
                    name: "Deliveroo",
                    sale: m["Deliveroo sale"],
                    charge: m["DELIVEROO Charge"],
                    vat: m["DELIVEROO 20% Vat"],
                    receive: m["Recive From Deliveroo"],
                  },
                ].map((plat) => (
                  <div
                    key={plat.name}
                    className="border border-slate-200/60 rounded-md p-2 bg-white"
                  >
                    <div className="text-[9px] uppercase font-bold text-slate-400 mb-1.5">
                      {plat.name}
                    </div>
                    <div className="grid grid-cols-4 gap-1 text-center divide-x divide-slate-100">
                      <div>
                        <div className="text-[9px] text-slate-400">Sale</div>
                        <div className="font-bold text-slate-700">
                          £{fmtNum(n(plat.sale))}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400">Charge</div>
                        <div className="font-bold text-slate-700">
                          £{fmtNum(n(plat.charge))}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400">20% VAT</div>
                        <div className="font-bold text-slate-700">
                          £{fmtNum(n(plat.vat))}
                        </div>
                      </div>
                      <div>
                        <div className="text-[9px] text-slate-400">Receive</div>
                        <div className="font-bold text-slate-700">
                          £{fmtNum(n(plat.receive))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Costs & Labour */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm">
              <SectionHeading
                icon={<DollarSign size={12} />}
                title="Costs & Labour"
                accent="text-violet-700"
              />
              <div className="space-y-1.5 mt-3 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery Total</span>
                  <span className="font-bold text-slate-700">
                    £{fmtNum(n(m["delivery Charges TOTAL"]))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Delivery %</span>
                  <span className="font-bold text-slate-700">
                    {fmtPct(n(m["Delivery Charge %"]))}
                  </span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-200">
                  <span className="text-slate-500">Labour Hours</span>
                  <span className="font-bold text-slate-700">
                    {fmtNum(n(m["LABOUR HOURS"]))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Labour Cost</span>
                  <span className="font-bold text-slate-700">
                    £{fmtNum(n(m["LABOUR COST "]))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Labour Cost %</span>
                  <span className="font-bold text-slate-700">
                    {fmtPct(n(m["Labour cost %"]))}
                  </span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-200">
                  <span className="text-slate-500">Food Cost (BID)</span>
                  <span className="font-bold text-slate-700">
                    £{fmtNum(n(m["BID FOOD "]))}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Food Cost %</span>
                  <span className="font-bold text-slate-700">
                    {fmtPct(n(m["Food cost %"]))}
                  </span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-slate-200">
                  <span className="text-slate-500 font-semibold">
                    Total Cost %
                  </span>
                  <span className="font-bold border px-1.5 py-0.5 rounded-md text-slate-800 bg-white shadow-sm border-slate-200">
                    {fmtPct(n(m["TOTAL COST %"]))}
                  </span>
                </div>
              </div>
            </div>

            {/* Instore & Variables */}
            <div className="flex flex-col gap-3">
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 shadow-sm h-full">
                <SectionHeading
                  icon={<ShoppingBag size={12} />}
                  title="Instore & Variables"
                  accent="text-rose-700"
                />
                <div className="space-y-1.5 mt-3 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Instore Food Cost</span>
                    <span className="font-bold text-slate-700">
                      {fmtPct(n(m["Instore Food Cost"]) / 100)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Instore Labour Cost</span>
                    <span className="font-bold text-slate-700">
                      {fmtPct(n(m["Instore Labour Cost"]) / 100)}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1.5 border-t border-slate-200">
                    <span className="text-slate-500">Bidfood Prev Week</span>
                    <span className="font-bold text-slate-700">
                      £{fmtNum(n(m["Previous Week"]))}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500 font-semibold">
                      Bidfood Diff Total
                    </span>
                    <span className="font-bold text-slate-800">
                      £{fmtNum(n(m["Bidfood Total"]))}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
