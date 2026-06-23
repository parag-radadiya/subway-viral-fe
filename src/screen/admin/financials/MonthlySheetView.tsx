import React, { useEffect, useState } from "react";
import { CheckCircle2, RefreshCw, Trash2 } from "lucide-react";
import { toast } from "react-toastify";
import Button from "../../../components/common/Button";
import { financialsApi, shopsApi } from "../../../config/apiCall";

// ── Types ────────────────────────────────────────────────────────────────────
interface MonthlyShopRow {
  shopId: string;
  shopName: string;
  grossSale: string;
  netSale: string;
  customerCount: string;
  bidfood: string;
  labourHour: string;
  labourRate: string; // NEW – default 11.5
  kioskPct: string;
  revScoreQ1: string;
}

const MONTH_NAMES = [
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

// ── Helpers ──────────────────────────────────────────────────────────────────
const n = (v: string) => parseFloat(v) || 0;

const fmtNum = (v: number) =>
  isNaN(v) || !isFinite(v)
    ? "—"
    : v.toLocaleString("en-GB", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

/**
 * Returns percentage as decimal first (like original MonthlyShopMetricsForm),
 * then formats as "XX.XX%"
 *   e.g. vatPct = vat / net  → display = (vatPct * 100).toFixed(2) + "%"
 */
const fmtPct = (numerator: number, denominator: number) => {
  if (!denominator) return "#DIV/0!";
  const pct = (numerator / denominator) * 100;
  return (
    pct.toLocaleString("en-GB", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }) + "%"
  );
};

/**
 * Formulas match original MonthlyShopMetricsForm.tsx exactly:
 *   vat         = grossSale − netSale
 *   vatPct      = vat / net              (decimal)
 *   bidfoodPct  = bidfood / net          (decimal)
 *   labourCost  = labourHour × labourRate  (was hardcoded 11.5, now user-editable)
 *   labourPct   = labourCost / net       (decimal)
 *   totalCogs   = bidfoodPct + labourPct  (sum of two decimal fractions → display as %)
 */
const calcRow = (r: MonthlyShopRow) => {
  const gross = n(r.grossSale);
  const net = n(r.netSale);
  const vat = gross - net;
  const bidfood = n(r.bidfood);
  const labourHour = n(r.labourHour);
  const labourRate = n(r.labourRate) || 11.5;
  const labourCost = labourHour * labourRate;
  const bidfoodPct = net > 0 ? ((bidfood / net) * 100) / 100 : 0;
  const labourPct = net > 0 ? ((labourCost / net) * 100) / 100 : 0;
  const totalCogs = bidfoodPct + labourPct;
  return {
    gross,
    net,
    vat,
    bidfood,
    labourHour,
    labourRate,
    labourCost,
    bidfoodPct,
    labourPct,
    totalCogs,
  };
};

// ── Shared cell CSS ──────────────────────────────────────────────────────────
const inputCls =
  "w-full min-w-[72px] text-right text-[11px] font-semibold text-slate-900 bg-transparent border border-transparent rounded focus:outline-none focus:border-blue-400 focus:bg-white px-1.5 py-0.5 placeholder:text-slate-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
const formulaTdCls =
  "border-r border-slate-100 px-3 py-1.5 text-right text-[11px] font-mono text-slate-500 bg-slate-50/60";
const inputTdCls = "border-r border-slate-100 px-1 py-1 bg-green-50/40";

const MONTHLY_STORAGE_KEY = "financials_draft_month";

interface MonthlyDraft {
  year: string;
  monthNum: string;
  rows: MonthlyShopRow[];
}

// ── Component ─────────────────────────────────────────────────────────────────
const MonthlySheetView: React.FC = () => {
  const [shops, setShops] = useState<any[]>([]);
  const [shopsLoading, setShopsLoading] = useState(true);

  // Restore draft on mount
  const [year, setYear] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(MONTHLY_STORAGE_KEY);
      if (saved)
        return (
          (JSON.parse(saved) as MonthlyDraft).year ??
          String(new Date().getFullYear())
        );
    } catch {}
    return String(new Date().getFullYear());
  });
  const [monthNum, setMonthNum] = useState<string>(() => {
    try {
      const saved = localStorage.getItem(MONTHLY_STORAGE_KEY);
      if (saved)
        return (
          (JSON.parse(saved) as MonthlyDraft).monthNum ??
          String(new Date().getMonth() + 1)
        );
    } catch {}
    return String(new Date().getMonth() + 1);
  });
  const [rows, setRows] = useState<MonthlyShopRow[]>(() => {
    try {
      const saved = localStorage.getItem(MONTHLY_STORAGE_KEY);
      if (saved) {
        const draft = JSON.parse(saved) as MonthlyDraft;
        if (draft.rows?.length) return draft.rows;
      }
    } catch {}
    return [];
  });
  const [submitting, setSubmitting] = useState(false);

  // Save to localStorage on every change to rows, year, or monthNum
  useEffect(() => {
    const draft: MonthlyDraft = { year, monthNum, rows };
    localStorage.setItem(MONTHLY_STORAGE_KEY, JSON.stringify(draft));
  }, [rows, year, monthNum]);

  const makeRow = (s: any): MonthlyShopRow => ({
    shopId: s._id,
    shopName: s.name,
    grossSale: "",
    netSale: "",
    customerCount: "",
    bidfood: "",
    labourHour: "",
    labourRate: "11.5",
    kioskPct: "",
    revScoreQ1: "",
  });

  useEffect(() => {
    shopsApi
      .list()
      .then((res: any) => {
        const data = res.data.data;
        const loaded = data.shops || data.data || [];
        setShops(loaded);
        // Only seed rows from shops if no draft was restored
        setRows((prev) => (prev.length > 0 ? prev : loaded.map(makeRow)));
      })
      .catch((err: any) => toast.error(err.message || "Failed to load shops"))
      .finally(() => setShopsLoading(false));
  }, []);

  const handleCell = (
    shopId: string,
    field: keyof MonthlyShopRow,
    value: string,
  ) =>
    setRows((prev) =>
      prev.map((r) => (r.shopId === shopId ? { ...r, [field]: value } : r)),
    );

  const resetAll = () => {
    localStorage.removeItem(MONTHLY_STORAGE_KEY);
    setRows(shops.map(makeRow));
  };

  const handleSubmit = async () => {
    if (!year || !monthNum) {
      toast.error("Please set year and month.");
      return;
    }
    setSubmitting(true);
    let ok = 0,
      fail = 0;

    for (const r of rows) {
      const d = calcRow(r);
      const payload = {
        shop_id: r.shopId,
        year: parseInt(year, 10),
        month: parseInt(monthNum, 10),
        metrics: {
          grossSale: d.gross,
          netSale: d.net,
          vat: d.vat,
          customerCount: n(r.customerCount),
          bidfood: d.bidfood,
          labourHour: d.labourHour,
          labourRate: d.labourRate,
          labourCost: d.labourCost,
          kioskPct: n(r.kioskPct),
          revScoreQ1: n(r.revScoreQ1),
          totalCogs: d.totalCogs,
        },
      };
      try {
        await financialsApi.submitMonthlySale(payload);
        ok++;
      } catch (err: any) {
        fail++;
        console.error(err);
      }
    }

    setSubmitting(false);
    if (fail === 0) {
      toast.success(`Uploaded ${ok} monthly records.`);
      // Clear draft after successful submit
      localStorage.removeItem(MONTHLY_STORAGE_KEY);
      setRows(shops.map(makeRow));
    } else toast.error(`Uploaded ${ok}, but ${fail} failed.`);
  };

  // ── Totals ───────────────────────────────────────────────────────────────
  const totals = rows.reduce(
    (acc, r) => {
      const d = calcRow(r);
      return {
        gross: acc.gross + d.gross,
        net: acc.net + d.net,
        vat: acc.vat + d.vat,
        customers: acc.customers + n(r.customerCount),
        bidfood: acc.bidfood + d.bidfood,
        labourHour: acc.labourHour + d.labourHour,
        labourCost: acc.labourCost + d.labourCost,
      };
    },
    {
      gross: 0,
      net: 0,
      vat: 0,
      customers: 0,
      bidfood: 0,
      labourHour: 0,
      labourCost: 0,
    },
  );

  const dash = "—";

  // group header colspan config:
  // Sales(2) | Calc(2) | Count(1) | Food(2) | Labour(4=Hr+Rate+Cost+%) | Kiosk(1) | COGS(1) | Rev(1)
  return (
    <div className="space-y-4 animate-fade-in">
      {/* ── Controls ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Year:</label>
          <input
            type="number"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            className="w-20 text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600">Month:</label>
          <select
            value={monthNum}
            onChange={(e) => setMonthNum(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-500"
          >
            {MONTH_NAMES.map((m, i) => (
              <option key={i + 1} value={String(i + 1)}>
                {m}
              </option>
            ))}
          </select>
        </div>
        <div className="flex-1" />
        <button
          type="button"
          onClick={resetAll}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 border border-slate-200 rounded-lg px-3 py-2 bg-white hover:bg-red-50 transition-colors"
        >
          <RefreshCw size={13} /> Reset
        </button>
      </div>

      {/* ── Sheet ── */}
      <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
        {shopsLoading ? (
          <div className="flex items-center justify-center gap-2 py-12 text-slate-400 text-sm">
            <RefreshCw size={16} className="animate-spin" /> Loading shops…
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table
              className="text-[11px] border-collapse"
              style={{ minWidth: 1300 }}
            >
              <thead>
                {/* Group row */}
                <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white text-[9px] uppercase tracking-widest">
                  <th className="whitespace-nowrap sticky left-0 z-20 bg-slate-800 border-r border-slate-600 px-2 py-2 text-center w-8">
                    #
                  </th>
                  <th className="whitespace-nowrap sticky left-8 z-20 bg-slate-800 border-r border-slate-600 px-4 py-2 text-left min-w-[140px]">
                    Store
                  </th>
                  <th
                    colSpan={2}
                    className="border-r border-slate-500 px-3 py-2 text-center text-green-300"
                  >
                    Sales
                  </th>
                  <th
                    colSpan={2}
                    className="border-r border-slate-500 px-3 py-2 text-center text-slate-300"
                  >
                    Calculated
                  </th>
                  <th className="whitespace-nowrap border-r border-slate-500 px-3 py-2 text-center text-green-300">
                    Count
                  </th>
                  <th
                    colSpan={2}
                    className="border-r border-slate-500 px-3 py-2 text-center text-green-300"
                  >
                    Food
                  </th>
                  {/* Labour: Hr, Rate, Cost, % = 4 cols */}
                  <th
                    colSpan={4}
                    className="border-r border-slate-500 px-3 py-2 text-center text-violet-300"
                  >
                    Labour
                  </th>
                  <th className="whitespace-nowrap border-r border-slate-500 px-3 py-2 text-center text-green-300">
                    Kiosk
                  </th>
                  <th className="whitespace-nowrap border-r border-slate-500 px-3 py-2 text-center text-red-300">
                    COGS
                  </th>
                  <th className="whitespace-nowrap px-3 py-2 text-center text-green-300">
                    Rev
                  </th>
                </tr>

                {/* Column headers — exact Excel order */}
                <tr className="bg-slate-100 text-slate-600 border-b-2 border-slate-300 text-[9px] font-bold uppercase tracking-wider">
                  <th className="whitespace-nowrap sticky left-0 z-20 bg-slate-100 border-r border-slate-200 px-2 py-2 text-center" />
                  <th className="whitespace-nowrap sticky left-8 z-20 bg-slate-100 border-r border-slate-200 px-4 py-2 text-left">
                    Store
                  </th>
                  {/* Sales */}
                  <th className="whitespace-nowrap border-r border-slate-200 px-3 py-2 text-center text-green-700">
                    Gross Sale
                  </th>
                  <th className="whitespace-nowrap border-r border-slate-300 px-3 py-2 text-center text-green-700">
                    Net Sale
                  </th>
                  {/* Calculated */}
                  <th className="whitespace-nowrap border-r border-slate-200 px-3 py-2 text-center text-slate-500">
                    Vat
                  </th>
                  <th className="whitespace-nowrap border-r border-slate-300 px-3 py-2 text-center text-slate-500">
                    Vat %
                  </th>
                  {/* Count */}
                  <th className="whitespace-nowrap border-r border-slate-200 px-3 py-2 text-center text-green-700">
                    Customer Count
                  </th>
                  {/* Food */}
                  <th className="whitespace-nowrap border-r border-slate-200 px-3 py-2 text-center text-green-700">
                    Bidfood
                  </th>
                  <th className="whitespace-nowrap border-r border-slate-300 px-3 py-2 text-center text-slate-500">
                    Bidfood %
                  </th>
                  {/* Labour */}
                  <th className="whitespace-nowrap border-r border-slate-200 px-3 py-2 text-center text-violet-700">
                    Labour Hour
                  </th>
                  <th className="whitespace-nowrap border-r border-slate-200 px-3 py-2 text-center text-violet-700">
                    Labour Rate
                  </th>
                  <th className="whitespace-nowrap border-r border-slate-200 px-3 py-2 text-center text-slate-500">
                    Labour Cost
                  </th>
                  <th className="whitespace-nowrap border-r border-slate-300 px-3 py-2 text-center text-slate-500">
                    Labour %
                  </th>
                  {/* Kiosk */}
                  <th className="whitespace-nowrap border-r border-slate-200 px-3 py-2 text-center text-green-700">
                    Kiosk %
                  </th>
                  {/* COGS */}
                  <th className="whitespace-nowrap border-r border-slate-200 px-3 py-2 text-center text-red-700">
                    TOTAL COGS
                  </th>
                  {/* Rev */}
                  <th className="whitespace-nowrap px-3 py-2 text-center text-green-700">
                    Rev Score Q1
                  </th>
                </tr>
              </thead>

              <tbody>
                {rows.map((row, i) => {
                  const d = calcRow(row);
                  const ic = (
                    field: keyof MonthlyShopRow,
                    val: string,
                    placeholder = "0.00",
                  ) => (
                    <input
                      type="number"
                      step="0.01"
                      placeholder={placeholder}
                      value={val}
                      onChange={(e) =>
                        handleCell(row.shopId, field, e.target.value)
                      }
                      className={inputCls}
                    />
                  );
                  return (
                    <tr
                      key={row.shopId}
                      className={`border-b border-slate-100 hover:bg-blue-50/20 transition-colors ${i % 2 === 0 ? "bg-white" : "bg-slate-50/30"}`}
                    >
                      <td className="sticky left-0 bg-inherit border-r border-slate-100 px-2 py-1.5 text-center text-slate-400 font-mono font-bold text-[10px]">
                        {i + 1}
                      </td>
                      <td className="sticky left-8 bg-inherit border-r border-slate-200 px-4 py-1.5 font-semibold text-slate-800 whitespace-nowrap">
                        {row.shopName}
                      </td>

                      {/* Gross Sale */}
                      <td className={inputTdCls}>
                        {ic("grossSale", row.grossSale)}
                      </td>
                      {/* Net Sale */}
                      <td
                        className={`border-r border-green-200 px-1 py-1 bg-green-50/40`}
                      >
                        {ic("netSale", row.netSale)}
                      </td>

                      {/* Vat — formula */}
                      <td className={formulaTdCls}>{fmtNum(d.vat)}</td>
                      {/* Vat % — formula */}
                      <td
                        className={`${formulaTdCls} border-r border-slate-200`}
                      >
                        {fmtPct(d.vat, d.net)}
                      </td>

                      {/* Customer Count */}
                      <td className={inputTdCls}>
                        {ic("customerCount", row.customerCount, "0")}
                      </td>

                      {/* Bidfood */}
                      <td className={inputTdCls}>
                        {ic("bidfood", row.bidfood)}
                      </td>
                      {/* Bidfood % — formula */}
                      <td
                        className={`${formulaTdCls} border-r border-slate-200`}
                      >
                        {fmtPct(d.bidfood, d.net)}
                      </td>

                      {/* Labour Hour */}
                      <td className={inputTdCls}>
                        {ic("labourHour", row.labourHour, "0")}
                      </td>
                      {/* Labour Rate */}
                      <td className={inputTdCls}>
                        {ic("labourRate", row.labourRate, "11.5")}
                      </td>
                      {/* Labour Cost — formula */}
                      <td className={formulaTdCls}>{fmtNum(d.labourCost)}</td>
                      {/* Labour % — formula */}
                      <td
                        className={`${formulaTdCls} border-r border-slate-200`}
                      >
                        {fmtPct(d.labourCost, d.net)}
                      </td>

                      {/* Kiosk % */}
                      <td className={inputTdCls}>
                        {ic("kioskPct", row.kioskPct)}
                      </td>

                      {/* TOTAL COGS — formula (bidfoodPct + labourPct shown as %) */}
                      <td className="border-r border-slate-100 px-3 py-1.5 text-right text-[11px] font-mono font-bold bg-red-50/40">
                        <span
                          className={
                            d.totalCogs > 0.5
                              ? "text-red-600"
                              : "text-emerald-700"
                          }
                        >
                          {d.net > 0
                            ? fmtPct(
                                (d.bidfoodPct + d.labourPct) * d.net,
                                d.net,
                              )
                            : "—"}
                        </span>
                      </td>

                      {/* Rev Score Q1 */}
                      <td className="px-1 py-1 bg-green-50/40">
                        {ic("revScoreQ1", row.revScoreQ1)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>

              <tfoot>
                <tr className="bg-slate-800 text-white border-t-2 border-slate-600 text-[10px] font-bold">
                  <td className="sticky left-0 bg-slate-800 border-r border-slate-600 px-2 py-2 text-center text-slate-400">
                    Σ
                  </td>
                  <td className="sticky left-8 bg-slate-800 border-r border-slate-600 px-4 py-2 text-left text-slate-300 uppercase text-[9px] tracking-widest">
                    Total
                  </td>
                  <td className="border-r border-slate-600 px-3 py-2 text-right font-mono text-green-300">
                    {fmtNum(totals.gross)}
                  </td>
                  <td className="border-r border-slate-500 px-3 py-2 text-right font-mono text-green-300">
                    {fmtNum(totals.net)}
                  </td>
                  <td className="border-r border-slate-600 px-3 py-2 text-right font-mono text-slate-300">
                    {fmtNum(totals.vat)}
                  </td>
                  <td className="border-r border-slate-500 px-3 py-2 text-center text-slate-400">
                    {dash}
                  </td>
                  <td className="border-r border-slate-600 px-3 py-2 text-right font-mono text-slate-300">
                    {fmtNum(totals.customers)}
                  </td>
                  <td className="border-r border-slate-600 px-3 py-2 text-right font-mono text-slate-300">
                    {fmtNum(totals.bidfood)}
                  </td>
                  <td className="border-r border-slate-500 px-3 py-2 text-center text-slate-400">
                    {dash}
                  </td>
                  <td className="border-r border-slate-600 px-3 py-2 text-right font-mono text-violet-300">
                    {fmtNum(totals.labourHour)}
                  </td>
                  <td className="border-r border-slate-600 px-3 py-2 text-center text-slate-400">
                    {dash}
                  </td>
                  <td className="border-r border-slate-600 px-3 py-2 text-right font-mono text-violet-300">
                    {fmtNum(totals.labourCost)}
                  </td>
                  <td className="border-r border-slate-500 px-3 py-2 text-center text-slate-400">
                    {dash}
                  </td>
                  <td className="border-r border-slate-600 px-3 py-2 text-center text-slate-400">
                    {dash}
                  </td>
                  <td className="border-r border-slate-600 px-3 py-2 text-right font-mono text-red-300">
                    {fmtPct(totals.bidfood + totals.labourCost, totals.net)}
                  </td>
                  <td className="px-3 py-2 text-center text-slate-400">
                    {dash}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        <div className="flex items-center gap-4 px-4 py-2 border-t border-slate-100 bg-slate-50/70 text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-green-100 border border-green-200 inline-block" />{" "}
            Input
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 inline-block" />{" "}
            Formula
          </span>
        </div>
      </div>

      {/* ── Submit bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 sm:px-8 py-3 bg-white/95 backdrop-blur border-t border-slate-200 flex items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          <span className="font-semibold text-slate-700">
            {MONTH_NAMES[parseInt(monthNum) - 1]}
          </span>{" "}
          {year} ·{" "}
          <span className="font-semibold text-slate-700">{rows.length}</span>{" "}
          shops
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={resetAll}
            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Trash2 size={13} /> Reset
          </button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={submitting}
            leftIcon={<CheckCircle2 size={16} />}
            className="px-6"
          >
            Submit Monthly
          </Button>
        </div>
      </div>
    </div>
  );
};

export default MonthlySheetView;
