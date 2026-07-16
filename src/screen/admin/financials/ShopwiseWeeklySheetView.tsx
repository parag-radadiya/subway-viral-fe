import {
  getISOWeek,
  setISOWeek,
  startOfISOWeek,
  endOfISOWeek,
  format,
} from "date-fns";
import { CheckCircle2, Plus, RefreshCw, Trash2 } from "lucide-react";

import { useCallback, useEffect, useState } from "react";

import { toast } from "react-toastify";
import Button from "../../../components/common/Button";
import { financialsApi, shopsApi } from "../../../config/apiCall";
import { Shop, ShopMetrics, WeekCard } from "./components/types";

import {
  calcDerived,
  fmtPct,
  n,
  newShopEntry,
  newWeekCard,
} from "./components/utils";

// ─── Editable cell ─────────────────────────────────────────────────────────────
const EditCell = ({
  value,
  onChange,
  placeholder = "0.00",
  type = "number",
}: {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  type?: string;
}) => (
  <input
    type={type}
    step="0.1"
    min={0}
    placeholder={placeholder}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    className="w-full min-w-[72px] text-right text-[11px] font-semibold text-slate-900 bg-transparent border border-transparent rounded focus:outline-none focus:border-green-400 focus:bg-white px-1.5 py-0.5 placeholder:text-slate-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
  />
);

// ─── Read-only formula cell ────────────────────────────────────────────────────
const FormulaCell = ({ val }: { val: string | number }) => (
  <span className="block w-full text-right text-[11px] font-mono text-slate-500 px-1.5">
    {typeof val === "number"
      ? isNaN(val) || !isFinite(val)
        ? "—"
        : val.toLocaleString("en-GB", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })
      : val}
  </span>
);

// ─── Styled TH helpers ────────────────────────────────────────────────────────
const TH = ({
  children,
  className = "",
  rowSpan,
  colSpan,
}: {
  children: React.ReactNode;
  className?: string;
  rowSpan?: number;
  colSpan?: number;
}) => (
  <th
    rowSpan={rowSpan}
    colSpan={colSpan}
    className={`px-2 py-1.5 text-center text-[9px] font-bold uppercase tracking-widest border-r border-b border-slate-600 whitespace-pre-line ${className}`}
  >
    {children}
  </th>
);

// ─── Column definitions ────────────────────────────────────────────────────────
// Each entry: { label, key, input?, formula?, subGroup }
// "input" → editable (green tinted)
// "formula" → read-only (grey tinted)

// ─── Main Component ────────────────────────────────────────────────────────────
const ShopwiseWeeklySheetView = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopsLoading, setShopsLoading] = useState(true);
  const [weeks, setWeeks] = useState<WeekCard[]>([newWeekCard()]);
  const [submitting, setSubmitting] = useState(false);
  const [activeWeekIdx, setActiveWeekIdx] = useState(0);

  useEffect(() => {
    shopsApi
      .list()
      .then((res: any) => {
        const data = res.data.data;
        const loaded: Shop[] = (data.shops || data.data || []).filter(
          (s: any) => !s.is_all_shops && s.is_active !== false
        );
        setShops(loaded);
        setWeeks((prev) => {
          if (
            prev.length === 1 &&
            prev[0].shops.length === 1 &&
            !prev[0].shops[0].shopId
          ) {
            const wk = { ...prev[0] };
            wk.shops = loaded.map((s) => {
              const e = newShopEntry();
              e.shopId = s._id;
              return e;
            });
            return [wk];
          }
          return prev;
        });
      })
      .catch((err: any) => toast.error(err.message || "Failed to load shops"))
      .finally(() => setShopsLoading(false));
  }, []);

  // ── Week management ──────────────────────────────────────────────────────────
  const addWeek = useCallback(() => {
    setWeeks((prev) => {
      const wk = newWeekCard();
      wk.shops = shops.map((s) => {
        const e = newShopEntry();
        e.shopId = s._id;
        return e;
      });
      const next = [...prev, wk];
      setActiveWeekIdx(next.length - 1);
      return next;
    });
  }, [shops]);

  const removeWeek = (idx: number) => {
    setWeeks((prev) => {
      if (prev.length === 1) return prev;
      const next = prev.filter((_, i) => i !== idx);
      setActiveWeekIdx(Math.min(idx, next.length - 1));
      return next;
    });
  };

  const setWeekDates = (weekId: string, wn: number) => {
    const diw = setISOWeek(new Date(), wn);
    setWeeks((prev) =>
      prev.map((w) =>
        w.id === weekId
          ? {
              ...w,
              startDate: format(startOfISOWeek(diw), "yyyy-MM-dd"),
              endDate: format(endOfISOWeek(diw), "yyyy-MM-dd"),
            }
          : w,
      ),
    );
  };

  const setMetric = (
    weekId: string,
    shopEntryId: string,
    key: keyof ShopMetrics,
    val: string,
  ) => {
    setWeeks((prev) =>
      prev.map((w) =>
        w.id === weekId
          ? {
              ...w,
              shops: w.shops.map((s) =>
                s.id === shopEntryId
                  ? { ...s, metrics: { ...s.metrics, [key]: val } }
                  : s,
              ),
            }
          : w,
      ),
    );
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const buildPayload = () => {
    const entries: object[] = [];
    weeks.forEach((week) => {
      const fmtDate = (ds: string) => {
        if (!ds) return "";
        const d = new Date(ds);
        return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
      };
      week.shops.forEach((shopEntry) => {
        const m = shopEntry.metrics;
        const d = calcDerived(m);
        const shop = shops.find((s) => s._id === shopEntry.shopId);
        const startDt = week.startDate ? new Date(week.startDate) : null;
        entries.push({
          report_type: "weekly_financial",
          store_name: shop?.name ?? "",
          store_id: shopEntry.shopId,
          year: startDt?.getFullYear() ?? null,
          week_number: startDt ? getISOWeek(startDt) : 1,
          month: startDt ? startDt.getMonth() + 1 : null,
          week_range_label: `${fmtDate(week.startDate)} to ${fmtDate(week.endDate)}`,
          metrics: {
            "GROSS SALES": n(m.grossSales),
            VAT: n(m.vat),
            "VAT %": d.vatPct,
            "Adjusted VAT": d.adjustedVat,
            "NET SALES": d.netSales,
            "Delivery %": d.deliveryPct,
            "Total 3PD Sale": d.total3PD,
            "Customer Count": n(m.customerCount),
            "JustEat Sale": n(m.justEatSale),
            "JUST Charge": n(m.justCharge),
            "JustEat 20% Vat": n(m.justEatVat),
            "Receive from Justeat": d.receiveFromJustEat,
            "JustEat Amount Received in Bank": n(m.justEatBankReceived),
            "JustEat Variance from Bank": n(m.justEatVariance),
            "UberEat Sale": n(m.uberEatSale),
            "UBEREAT Charge": n(m.uberEatCharge),
            "UBEREAT 20% Vat": n(m.uberEatVat),
            "Receive From Uber": d.receiveFromUber,
            "UBEREAT Amount Received in Bank": n(m.uberEatBankReceived),
            "Ubereats Advertise": n(m.uberAdvertise),
            "Uber discount %": n(m.uberDiscount),
            "Deliveroo sale": n(m.deliverooSale),
            "DELIVEROO Charge": n(m.deliverooCharge),
            "DELIVEROO 20% Vat": n(m.deliverooVat),
            "Recive From Deliveroo": d.receiveFromDeliveroo,
            "DELIVEROO Amount Received in Bank": n(m.deliverooBankReceived),
            "Variance from Bank": n(m.deliverooVariance),
            "delivery Charges TOTAL": d.deliveryChargesTotal,
            "Delivery Charge %": d.deliveryChargePct,
            "LABOUR HOURS": n(m.labourHours),
            "LABOUR RATE": n(m.labourRate) || 11.5,
            "LABOUR COST ": d.labourCost,
            "Labour cost %": d.labourCostPct,
            "BID FOOD ": n(m.bidFood),
            "Food cost %": d.foodCostPct,
            "TOTAL COST %": d.totalCostPct,
            "Instore Food Cost": n(m.instoreFoodCost),
            "Instore Labour Cost": n(m.instoreLabourCost),
            "Bidfood Total": d.bidfoodTotal,
            "Previous Week": n(m.bidfoodPreviousWeek),
          },
        });
      });
    });
    return { entries };
  };

  const handleSubmit = async () => {
    const missingWeek = weeks.find((w) => !w.startDate || !w.endDate);
    if (missingWeek) {
      toast.error("Please set Start and End dates for all weeks.");
      return;
    }
    const payload = buildPayload();
    setSubmitting(true);
    financialsApi
      .submitWeeklyReport(payload)
      .then(({ data }) => {
        if (data.data?.errors?.length) {
          toast.error(data?.errors?.join(",") || "Failed");
          return;
        }
        toast.success(data.message);
        setWeeks([newWeekCard()]);
        setActiveWeekIdx(0);
      })
      .catch((err: any) => toast.error(err.message || "Failed to import data"))
      .finally(() => setSubmitting(false));
  };

  const activeWeek = weeks[activeWeekIdx];

  const gc = "bg-green-50/50"; // input cell tint
  const fc = "bg-slate-50/70"; // formula cell tint

  const fmtDateLabel = (ds: string) => {
    if (!ds) return "";
    const d = new Date(ds);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  };

  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── Week tabs ─────────────────────────────────────────────────────── */}
      <div className="flex flex-wrap items-center gap-2">
        {weeks.map((w, i) => {
          const wn = w.startDate ? getISOWeek(new Date(w.startDate)) : "?";
          const label = w.startDate
            ? `Wk ${wn}: ${fmtDateLabel(w.startDate)} → ${fmtDateLabel(w.endDate)}`
            : `Week ${i + 1}`;
          return (
            <button
              key={w.id}
              type="button"
              onClick={() => setActiveWeekIdx(i)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                activeWeekIdx === i
                  ? "bg-slate-800 text-white border-slate-800 shadow"
                  : "bg-white text-slate-600 border-slate-200 hover:border-slate-400"
              }`}
            >
              {label}
              {weeks.length > 1 && (
                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    removeWeek(i);
                  }}
                  className="ml-1 opacity-50 hover:opacity-100 hover:text-red-400 transition-opacity"
                >
                  ×
                </span>
              )}
            </button>
          );
        })}
        <button
          type="button"
          onClick={addWeek}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border border-dashed border-slate-300 text-slate-500 hover:border-slate-500 hover:text-slate-700 transition-all"
        >
          <Plus size={12} /> Add Week
        </button>

        <div className="flex-1" />

        {/* Week number input for active week */}
        {activeWeek && (
          <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-1.5">
            <span className="text-xs text-slate-500 font-medium">Week #</span>
            <input
              type="number"
              min={1}
              max={53}
              value={
                activeWeek.startDate
                  ? getISOWeek(new Date(activeWeek.startDate))
                  : ""
              }
              onChange={(e) => {
                const wn = parseInt(e.target.value, 10);
                if (!isNaN(wn) && wn >= 1 && wn <= 53)
                  setWeekDates(activeWeek.id, wn);
              }}
              placeholder="e.g. 5"
              className="w-14 text-center text-xs font-bold text-slate-800 border-none outline-none bg-transparent"
            />
            {activeWeek.startDate && (
              <span className="text-[10px] text-slate-400 font-mono ml-1">
                {fmtDateLabel(activeWeek.startDate)} →{" "}
                {fmtDateLabel(activeWeek.endDate)}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ── Spreadsheet ──────────────────────────────────────────────────────── */}
      {shopsLoading ? (
        <div className="flex items-center justify-center gap-2 py-16 text-slate-400 text-sm rounded-xl border border-slate-200 bg-white">
          <RefreshCw size={16} className="animate-spin" /> Loading shops…
        </div>
      ) : !activeWeek ? null : (
        <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
          <div className="overflow-x-auto" style={{ overflowY: "auto" }}>
            <table
              className="text-[11px] border-collapse"
              style={{ minWidth: 2200 }}
            >
              {/* ── Header ─────────────────────────────────────────────────── */}
              <thead className="sticky top-0 z-30">
                {/* Row 1: group labels */}
                <tr className="bg-gradient-to-r from-slate-900 to-slate-800 text-white">
                  <TH
                    rowSpan={2}
                    className="sticky left-0 z-40 bg-slate-900 min-w-[140px] text-left pl-3"
                  >
                    # Store
                  </TH>
                  {/* Sales group: GROSS SALES, VAT, VAT%, Adj VAT, NET SALES, Delivery%, Total 3PD Sale, Cust Count = 8 */}
                  <TH colSpan={8} className="text-green-300 bg-emerald-900/40">
                    Sales Overview
                  </TH>
                  {/* JustEat: Sale, Charge, VAT, Receive, Bank, Variance = 6 */}
                  <TH colSpan={6} className="text-orange-300 bg-orange-900/30">
                    JustEat
                  </TH>
                  {/* Uber: Sale, Charge, VAT, Receive, Bank, Advert, Disc% = 7 */}
                  <TH colSpan={7} className="text-green-300 bg-green-900/30">
                    Uber Eats
                  </TH>
                  {/* Deliveroo: Sale, Charge, VAT, Receive, Bank, Variance = 6 */}
                  <TH colSpan={6} className="text-teal-300 bg-teal-900/30">
                    Deliveroo
                  </TH>
                  {/* Labour & Food: Del Chg Total, Del Chg%, Labour Hrs, Labour Rate, Labour Cost, Labour% = 6 */}
                  <TH colSpan={6} className="text-violet-300 bg-violet-900/30">
                    Labour &amp; Food
                  </TH>
                  {/* Instore: BidFood, Food%, TOTAL COST%, Instore Food, Instore Labour, Prev Wk, Bidfood Total = 7 */}
                  <TH colSpan={7} className="text-rose-300 bg-rose-900/30">
                    Instore &amp; Bidfood
                  </TH>
                </tr>

                {/* Row 2: column labels */}
                <tr className="bg-slate-100 text-slate-600 border-b-2 border-slate-300">
                  {/* Sales — in exact Excel column order */}
                  <TH className={`${gc} text-green-700`}>GROSS{"\n"}SALES</TH>
                  <TH className={`${gc} text-green-700`}>VAT</TH>
                  <TH className={`${fc} text-slate-500`}>VAT %</TH>
                  <TH className={`${fc} text-slate-500`}>Adj VAT{"\n"}(12%)</TH>
                  <TH className={`${fc} text-slate-700`}>NET{"\n"}SALES</TH>
                  <TH className={`${fc} text-slate-500`}>Delivery{"\n"}%</TH>
                  <TH className={`${fc} text-slate-500`}>
                    Total{"\n"}3PD Sale
                  </TH>
                  <TH className={`${gc} text-green-700`}>Cust{"\n"}Count</TH>
                  {/* JustEat */}
                  <TH className={`${gc} text-orange-700`}>JE Sale</TH>
                  <TH className={`${gc} text-orange-700`}>JUST{"\n"}Charge</TH>
                  <TH className={`${gc} text-orange-700`}>20%{"\n"}Vat</TH>
                  <TH className={`${fc} text-slate-500`}>Receive{"\n"}JE</TH>
                  <TH className={`${gc} text-orange-700`}>Bank{"\n"}(JE)</TH>
                  <TH className={`${gc} text-orange-700`}>
                    Variance{"\n"}(JE)
                  </TH>
                  {/* Uber */}
                  <TH className={`${gc} text-green-700`}>Uber Sale</TH>
                  <TH className={`${gc} text-green-700`}>UBER{"\n"}Charge</TH>
                  <TH className={`${gc} text-green-700`}>20%{"\n"}Vat</TH>
                  <TH className={`${fc} text-slate-500`}>Receive{"\n"}Uber</TH>
                  <TH className={`${gc} text-green-700`}>Bank{"\n"}(Uber)</TH>
                  <TH className={`${gc} text-green-700`}>Uber{"\n"}Advert</TH>
                  <TH className={`${gc} text-green-700`}>Uber{"\n"}Disc%</TH>
                  {/* Deliveroo */}
                  <TH className={`${gc} text-teal-700`}>Doo Sale</TH>
                  <TH className={`${gc} text-teal-700`}>Doo{"\n"}Charge</TH>
                  <TH className={`${gc} text-teal-700`}>20%{"\n"}Vat</TH>
                  <TH className={`${fc} text-slate-500`}>Receive{"\n"}Doo</TH>
                  <TH className={`${gc} text-teal-700`}>Bank{"\n"}(Doo)</TH>
                  <TH className={`${gc} text-teal-700`}>Variance{"\n"}(Doo)</TH>
                  {/* Labour & Food */}
                  <TH className={`${fc} text-slate-500`}>Del Chg{"\n"}TOTAL</TH>
                  <TH className={`${fc} text-slate-500`}>Delivery{"\n"}Chg%</TH>
                  <TH className={`${gc} text-violet-700`}>LABOUR{"\n"}HOURS</TH>
                  <TH className={`${gc} text-violet-700`}>LABOUR{"\n"}RATE</TH>
                  <TH className={`${fc} text-slate-500`}>LABOUR{"\n"}COST</TH>
                  <TH className={`${fc} text-slate-500`}>Labour{"\n"}cost%</TH>
                  {/* Instore & Bidfood */}
                  <TH className={`${gc} text-rose-700`}>BID{"\n"}FOOD</TH>
                  <TH className={`${fc} text-slate-500`}>Food{"\n"}cost%</TH>
                  <TH className={`${fc} text-slate-700 font-bold`}>
                    TOTAL{"\n"}COST%
                  </TH>
                  <TH className={`${gc} text-rose-700`}>
                    Instore{"\n"}Food Cost
                  </TH>
                  <TH className={`${gc} text-rose-700`}>
                    Instore{"\n"}Labour Cost
                  </TH>
                  <TH className={`${gc} text-rose-500`}>
                    Prev Wk{"\n"}Bidfood
                  </TH>
                  <TH className={`${fc} text-rose-700 font-bold`}>
                    Bidfood{"\n"}Total
                  </TH>
                </tr>
              </thead>

              <tbody>
                {activeWeek.shops.map((entry, i) => {
                  const shop = shops.find((s) => s._id === entry.shopId);
                  const m = entry.metrics;
                  const d = calcDerived(m);

                  const set = (key: keyof ShopMetrics, val: string) =>
                    setMetric(activeWeek.id, entry.id, key, val);

                  return (
                    <tr
                      key={entry.id}
                      className={`border-b border-slate-100 hover:bg-blue-50/20 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}
                    >
                      {/* Store name — sticky */}
                      <td className="sticky left-0 z-10 bg-inherit border-r border-slate-200 px-3 py-1.5 font-semibold text-slate-800 whitespace-nowrap min-w-[140px] !bg-white">
                        <span className="text-[10px] text-slate-400 font-mono mr-2">
                          {i + 1}
                        </span>
                        {shop?.name ?? "—"}
                      </td>

                      {/* ── Sales ── */}
                      <td
                        className={`border-r border-slate-100 px-1 py-1 ${gc}`}
                      >
                        <EditCell
                          value={m.grossSales}
                          onChange={(v) => set("grossSales", v)}
                        />
                      </td>
                      <td
                        className={`border-r border-slate-100 px-1 py-1 ${gc}`}
                      >
                        <EditCell
                          value={m.vat}
                          onChange={(v) => set("vat", v)}
                        />
                      </td>
                      <td
                        className={`cursor-default border-r border-slate-100 px-2 py-1 ${fc}`}
                      >
                        <FormulaCell val={fmtPct(d.vatPct)} />
                      </td>
                      <td
                        className={`cursor-default border-r border-slate-100 px-2 py-1 ${fc}`}
                      >
                        <FormulaCell val={d.adjustedVat} />
                      </td>
                      <td
                        className={`cursor-default border-r border-slate-100 px-2 py-1 ${fc} font-bold`}
                      >
                        <FormulaCell val={d.netSales} />
                      </td>
                      <td
                        className={`cursor-default border-r border-slate-100 px-2 py-1 ${fc}`}
                      >
                        <FormulaCell val={fmtPct(d.deliveryPct)} />
                      </td>
                      <td
                        className={`cursor-default border-r border-slate-100 px-2 py-1 ${fc}`}
                      >
                        <FormulaCell val={d.total3PD} />
                      </td>
                      <td
                        className={`border-r border-slate-100 px-1 py-1 ${gc}`}
                      >
                        <EditCell
                          value={m.customerCount}
                          onChange={(v) => set("customerCount", v)}
                          placeholder="0"
                        />
                      </td>

                      {/* ── JustEat ── */}
                      <td
                        className={`border-r border-slate-100 px-1 py-1 ${gc}`}
                      >
                        <EditCell
                          value={m.justEatSale}
                          onChange={(v) => set("justEatSale", v)}
                        />
                      </td>
                      <td
                        className={`border-r border-slate-100 px-1 py-1 ${gc}`}
                      >
                        <EditCell
                          value={m.justCharge}
                          onChange={(v) => set("justCharge", v)}
                        />
                      </td>
                      <td
                        className={`border-r border-slate-100 px-1 py-1 ${gc}`}
                      >
                        <EditCell
                          value={m.justEatVat}
                          onChange={(v) => set("justEatVat", v)}
                        />
                      </td>
                      <td
                        className={`cursor-default border-r border-slate-100 px-2 py-1 ${fc}`}
                      >
                        <FormulaCell val={d.receiveFromJustEat} />
                      </td>
                      <td
                        className={`border-r border-slate-100 px-1 py-1 ${gc}`}
                      >
                        <EditCell
                          value={m.justEatBankReceived}
                          onChange={(v) => set("justEatBankReceived", v)}
                        />
                      </td>
                      <td
                        className={`border-r border-slate-100 px-1 py-1 ${gc}`}
                      >
                        <EditCell
                          value={m.justEatVariance}
                          onChange={(v) => set("justEatVariance", v)}
                        />
                      </td>

                      {/* ── Uber ── */}
                      <td
                        className={`border-r border-slate-100 px-1 py-1 ${gc}`}
                      >
                        <EditCell
                          value={m.uberEatSale}
                          onChange={(v) => set("uberEatSale", v)}
                        />
                      </td>
                      <td
                        className={`border-r border-slate-100 px-1 py-1 ${gc}`}
                      >
                        <EditCell
                          value={m.uberEatCharge}
                          onChange={(v) => set("uberEatCharge", v)}
                        />
                      </td>
                      <td
                        className={`border-r border-slate-100 px-1 py-1 ${gc}`}
                      >
                        <EditCell
                          value={m.uberEatVat}
                          onChange={(v) => set("uberEatVat", v)}
                        />
                      </td>
                      <td
                        className={`cursor-default border-r border-slate-100 px-2 py-1 ${fc}`}
                      >
                        <FormulaCell val={d.receiveFromUber} />
                      </td>
                      <td
                        className={`border-r border-slate-100 px-1 py-1 ${gc}`}
                      >
                        <EditCell
                          value={m.uberEatBankReceived}
                          onChange={(v) => set("uberEatBankReceived", v)}
                        />
                      </td>
                      <td
                        className={`border-r border-slate-100 px-1 py-1 ${gc}`}
                      >
                        <EditCell
                          value={m.uberAdvertise}
                          onChange={(v) => set("uberAdvertise", v)}
                        />
                      </td>
                      <td
                        className={`border-r border-slate-100 px-1 py-1 ${gc}`}
                      >
                        <EditCell
                          value={m.uberDiscount}
                          onChange={(v) => set("uberDiscount", v)}
                          placeholder="0"
                        />
                      </td>

                      {/* ── Deliveroo ── */}
                      <td
                        className={`border-r border-slate-100 px-1 py-1 ${gc}`}
                      >
                        <EditCell
                          value={m.deliverooSale}
                          onChange={(v) => set("deliverooSale", v)}
                        />
                      </td>
                      <td
                        className={`border-r border-slate-100 px-1 py-1 ${gc}`}
                      >
                        <EditCell
                          value={m.deliverooCharge}
                          onChange={(v) => set("deliverooCharge", v)}
                        />
                      </td>
                      <td
                        className={`border-r border-slate-100 px-1 py-1 ${gc}`}
                      >
                        <EditCell
                          value={m.deliverooVat}
                          onChange={(v) => set("deliverooVat", v)}
                        />
                      </td>
                      <td
                        className={`cursor-default border-r border-slate-100 px-2 py-1 ${fc}`}
                      >
                        <FormulaCell val={d.receiveFromDeliveroo} />
                      </td>
                      <td
                        className={`border-r border-slate-100 px-1 py-1 ${gc}`}
                      >
                        <EditCell
                          value={m.deliverooBankReceived}
                          onChange={(v) => set("deliverooBankReceived", v)}
                        />
                      </td>
                      <td
                        className={`border-r border-slate-100 px-1 py-1 ${gc}`}
                      >
                        <EditCell
                          value={m.deliverooVariance}
                          onChange={(v) => set("deliverooVariance", v)}
                        />
                      </td>

                      {/* ── Labour & Food ── */}
                      <td
                        className={`cursor-default border-r border-slate-100 px-2 py-1 ${fc}`}
                      >
                        <FormulaCell val={d.deliveryChargesTotal} />
                      </td>
                      <td
                        className={`cursor-default border-r border-slate-100 px-2 py-1 ${fc}`}
                      >
                        <FormulaCell val={fmtPct(d.deliveryChargePct)} />
                      </td>
                      <td
                        className={`border-r border-slate-100 px-1 py-1 ${gc}`}
                      >
                        <EditCell
                          value={m.labourHours}
                          onChange={(v) => set("labourHours", v)}
                          placeholder="35"
                        />
                      </td>
                      <td
                        className={`border-r border-slate-100 px-1 py-1 ${gc}`}
                      >
                        <EditCell
                          value={m.labourRate}
                          onChange={(v) => set("labourRate", v)}
                          placeholder="11.50"
                        />
                      </td>
                      <td
                        className={`cursor-default border-r border-slate-100 px-2 py-1 ${fc}`}
                      >
                        <FormulaCell val={d.labourCost} />
                      </td>
                      <td
                        className={`cursor-default border-r border-slate-100 px-2 py-1 ${fc}`}
                      >
                        <FormulaCell val={fmtPct(d.labourCostPct)} />
                      </td>

                      {/* ── Instore & Bidfood ── */}
                      <td
                        className={`border-r border-slate-100 px-1 py-1 ${gc}`}
                      >
                        <EditCell
                          value={m.bidFood}
                          onChange={(v) => set("bidFood", v)}
                        />
                      </td>
                      <td
                        className={`cursor-default border-r border-slate-100 px-2 py-1 ${fc}`}
                      >
                        <FormulaCell val={fmtPct(d.foodCostPct)} />
                      </td>
                      <td
                        className={`border-r border-slate-100 px-2 py-1 bg-slate-100 font-bold`}
                      >
                        <span
                          className={`block w-full text-right text-[11px] font-bold px-1.5 ${n(m.grossSales) > 0 ? (d.totalCostPct > 0.6 ? "text-red-600" : "text-emerald-700") : "text-slate-400"}`}
                        >
                          {n(m.grossSales) > 0 ? fmtPct(d.totalCostPct) : "—"}
                        </span>
                      </td>
                      <td
                        className={`border-r border-slate-100 px-1 py-1 ${gc}`}
                      >
                        <EditCell
                          value={m.instoreFoodCost}
                          onChange={(v) => set("instoreFoodCost", v)}
                        />
                      </td>
                      <td
                        className={`border-r border-slate-100 px-1 py-1 ${gc}`}
                      >
                        <EditCell
                          value={m.instoreLabourCost}
                          onChange={(v) => set("instoreLabourCost", v)}
                        />
                      </td>
                      <td
                        className={`border-r border-slate-100 px-1 py-1 ${gc}`}
                      >
                        <EditCell
                          value={m.bidfoodPreviousWeek}
                          onChange={(v) => set("bidfoodPreviousWeek", v)}
                        />
                      </td>
                      <td
                        className={`cursor-default border-r border-slate-100 px-2 py-1 ${fc} font-bold`}
                      >
                        <FormulaCell val={d.bidfoodTotal} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              {/* ── Totals ───────────────────────────────────────────────────── */}
              <tfoot>
                {(() => {
                  const tot = activeWeek.shops.reduce(
                    (acc, entry) => {
                      const m = entry.metrics;
                      const d = calcDerived(m);
                      return {
                        grossSales: acc.grossSales + n(m.grossSales),
                        vat: acc.vat + n(m.vat),
                        netSales: acc.netSales + d.netSales,
                        customerCount: acc.customerCount + n(m.customerCount),
                        justEatSale: acc.justEatSale + n(m.justEatSale),
                        uberEatSale: acc.uberEatSale + n(m.uberEatSale),
                        deliverooSale: acc.deliverooSale + n(m.deliverooSale),
                        total3PD: acc.total3PD + d.total3PD,
                        deliveryChargesTotal:
                          acc.deliveryChargesTotal + d.deliveryChargesTotal,
                        labourHours: acc.labourHours + n(m.labourHours),
                        labourCost: acc.labourCost + d.labourCost,
                        bidFood: acc.bidFood + n(m.bidFood),
                        instoreFoodCost:
                          acc.instoreFoodCost + n(m.instoreFoodCost),
                        instoreLabourCost:
                          acc.instoreLabourCost + n(m.instoreLabourCost),
                        bidfoodTotal: acc.bidfoodTotal + d.bidfoodTotal,
                      };
                    },
                    {
                      grossSales: 0,
                      vat: 0,
                      netSales: 0,
                      customerCount: 0,
                      justEatSale: 0,
                      uberEatSale: 0,
                      deliverooSale: 0,
                      total3PD: 0,
                      deliveryChargesTotal: 0,
                      labourHours: 0,
                      labourCost: 0,
                      bidFood: 0,
                      instoreFoodCost: 0,
                      instoreLabourCost: 0,
                      bidfoodTotal: 0,
                    },
                  );

                  const f = (v: number) =>
                    v.toLocaleString("en-GB", {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    });
                  const dash = "—";
                  const totalCostPct =
                    tot.netSales > 0
                      ? (
                          ((tot.deliveryChargesTotal +
                            tot.labourCost +
                            tot.bidFood) /
                            tot.netSales) *
                          100
                        ).toFixed(2) + "%"
                      : dash;

                  return (
                    <tr className="bg-slate-800 text-white border-t-2 border-slate-600 text-[10px] font-bold">
                      <td className="sticky left-0 bg-slate-800 px-3 py-2 text-slate-300 uppercase tracking-widest border-r border-slate-600">
                        Σ TOTAL
                      </td>
                      <td className="px-2 py-2 text-right text-green-300 border-r border-slate-600">
                        {f(tot.grossSales)}
                      </td>
                      <td className="px-2 py-2 text-right text-green-300 border-r border-slate-600">
                        {f(tot.vat)}
                      </td>
                      <td className="px-2 py-2 text-center text-slate-400 border-r border-slate-600">
                        {dash}
                      </td>
                      <td className="px-2 py-2 text-center text-slate-400 border-r border-slate-600">
                        {dash}
                      </td>
                      <td className="px-2 py-2 text-right text-green-300 border-r border-slate-600">
                        {f(tot.netSales)}
                      </td>
                      <td className="px-2 py-2 text-center text-slate-400 border-r border-slate-600">
                        {dash}
                      </td>
                      <td className="px-2 py-2 text-right text-slate-300 border-r border-slate-600">
                        {f(tot.total3PD)}
                      </td>
                      <td className="px-2 py-2 text-right text-slate-300 border-r border-slate-600">
                        {f(tot.customerCount)}
                      </td>
                      <td className="px-2 py-2 text-right text-orange-300 border-r border-slate-600">
                        {f(tot.justEatSale)}
                      </td>
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <td
                            key={i}
                            className="px-2 py-2 text-center text-slate-500 border-r border-slate-600"
                          >
                            {dash}
                          </td>
                        ))}
                      <td className="px-2 py-2 text-right text-green-300 border-r border-slate-600">
                        {f(tot.uberEatSale)}
                      </td>
                      {Array(6)
                        .fill(0)
                        .map((_, i) => (
                          <td
                            key={i}
                            className="px-2 py-2 text-center text-slate-500 border-r border-slate-600"
                          >
                            {dash}
                          </td>
                        ))}
                      <td className="px-2 py-2 text-right text-teal-300 border-r border-slate-600">
                        {f(tot.deliverooSale)}
                      </td>
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <td
                            key={i}
                            className="px-2 py-2 text-center text-slate-500 border-r border-slate-600"
                          >
                            {dash}
                          </td>
                        ))}
                      <td className="px-2 py-2 text-right text-slate-300 border-r border-slate-600">
                        {f(tot.deliveryChargesTotal)}
                      </td>
                      <td className="px-2 py-2 text-center text-slate-400 border-r border-slate-600">
                        {dash}
                      </td>
                      <td className="px-2 py-2 text-right text-violet-300 border-r border-slate-600">
                        {f(tot.labourHours)}
                      </td>
                      <td className="px-2 py-2 text-center text-slate-400 border-r border-slate-600">
                        {dash}
                      </td>
                      <td className="px-2 py-2 text-right text-violet-300 border-r border-slate-600">
                        {f(tot.labourCost)}
                      </td>
                      <td className="px-2 py-2 text-center text-slate-400 border-r border-slate-600">
                        {dash}
                      </td>
                      <td className="px-2 py-2 text-right text-rose-300 border-r border-slate-600">
                        {f(tot.bidFood)}
                      </td>
                      <td className="px-2 py-2 text-center text-slate-400 border-r border-slate-600">
                        {dash}
                      </td>
                      <td className="px-2 py-2 text-right text-white border-r border-slate-600">
                        {totalCostPct}
                      </td>
                      <td className="px-2 py-2 text-right text-rose-300 border-r border-slate-600">
                        {f(tot.instoreFoodCost)}
                      </td>
                      <td className="px-2 py-2 text-right text-rose-300 border-r border-slate-600">
                        {f(tot.instoreLabourCost)}
                      </td>
                      <td className="px-2 py-2 text-center text-slate-400 border-r border-slate-600">
                        {dash}
                      </td>
                      <td className="px-2 py-2 text-right text-rose-300 font-bold border-r border-slate-600">
                        {f(tot.bidfoodTotal)}
                      </td>
                    </tr>
                  );
                })()}
              </tfoot>
            </table>
          </div>

          {/* Legend */}
          <div className="flex items-center gap-4 px-4 py-2 border-t border-slate-100 bg-slate-50/70 text-[10px] text-slate-400">
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-green-100 border border-green-200 inline-block" />{" "}
              Input cell
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 inline-block" />{" "}
              Formula (auto-calculated)
            </span>
          </div>
        </div>
      )}

      {/* ── Sticky submit bar ─────────────────────────────────────────────── */}
      {!shopsLoading && (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 sm:px-8 py-3 bg-white/95 backdrop-blur border-t border-slate-200 flex items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{weeks.length}</span>{" "}
            {weeks.length === 1 ? "week" : "weeks"} ·{" "}
            <span className="font-semibold text-slate-700">
              {activeWeek?.shops.length ?? 0}
            </span>{" "}
            shops
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setWeeks([newWeekCard()]);
                setActiveWeekIdx(0);
              }}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <Trash2 size={13} /> Reset all
            </button>
            <Button
              variant="primary"
              onClick={handleSubmit}
              isLoading={submitting}
              leftIcon={<CheckCircle2 size={16} />}
              className="px-6"
            >
              Submit Report
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShopwiseWeeklySheetView;
