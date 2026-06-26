import {
  endOfISOWeek,
  format,
  getISOWeek,
  setISOWeek,
  startOfISOWeek,
} from "date-fns";
import { CheckCircle2, Plus, Trash2, X } from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Button from "../../../components/common/Button";
import { financialsApi, shopsApi } from "../../../config/apiCall";
import { Shop } from "./components/types";

// ── Types ────────────────────────────────────────────────────────────────────
interface RowData {
  id: string;
  weekNum: number | "";
  startDate: string;
  endDate: string;
  sales: string;
  commision: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
const newRow = (lastWeekNum?: number | ""): RowData => {
  let d = new Date();
  let wn = getISOWeek(d);
  if (typeof lastWeekNum === "number") {
    wn = lastWeekNum < 52 ? lastWeekNum + 1 : lastWeekNum === 52 ? 53 : 1;
    d = setISOWeek(new Date(), wn);
  }
  return {
    id: Math.random().toString(36).substring(2, 9),
    weekNum: wn,
    startDate: format(startOfISOWeek(d), "yyyy-MM-dd"),
    endDate: format(endOfISOWeek(d), "yyyy-MM-dd"),
    sales: "",
    commision: "",
  };
};

/** "DD/MM To DD/MM" from ISO date strings */
const weekEndingLabel = (start: string, end: string) => {
  if (!start || !end) return "—";
  const f = (ds: string) => {
    const d = new Date(ds);
    return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
  };
  return `${f(start)} To ${f(end)}`;
};

/**
 * Formulas match original WeeklyFinancialsUpload.tsx exactly:
 *   vat        = sales × 0.18
 *   net        = sales − vat
 *   labour     = sales × 0.08
 *   royalties  = net   × 0.125
 *   foodCost   = net   × 0.22
 *   commPct    = (commission / sales) × 100
 *   total      = labour + vat + royalties + foodCost + commission
 *   income     = sales − total
 */
const calc = (r: RowData) => {
  const s = parseFloat(r.sales) || 0;
  const c = parseFloat(r.commision) || 0;
  const vat = s * 0.18;
  const net = s - vat;
  const labour = s * 0.08;
  const royalties = net * 0.125;
  const foodCost = net * 0.22;
  const commPct = s > 0 ? (c / s) * 100 : 0;
  const total = labour + vat + royalties + foodCost + c;
  const income = s - total;
  return { s, c, vat, net, labour, royalties, foodCost, commPct, total, income };
};

const fmtGBP = (v: number) =>
  v.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtPct = (v: number) =>
  isNaN(v) || !isFinite(v)
    ? "#DIV/0!"
    : v.toLocaleString("en-GB", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + "%";

// Shared CSS
const inputCls =
  "w-full min-w-[80px] text-right text-[11px] font-semibold text-slate-900 bg-transparent border border-transparent rounded focus:outline-none focus:border-green-400 focus:bg-white px-1.5 py-0.5 placeholder:text-slate-300 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none";
const formulaCls =
  "px-3 py-1.5 text-right text-[11px] font-mono text-slate-500 bg-slate-50/70 border-r border-slate-100";
const inputTdCls = "border-r border-slate-100 px-1 py-1 bg-green-50/40";

// ── Component ─────────────────────────────────────────────────────────────────
const WeeklySheetView: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState("");
  const [rows, setRows] = useState<RowData[]>([newRow()]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    shopsApi
      .list()
      .then((res: any) => {
        const loaded = res.data.data.shops || res.data.data.data || [];
        setShops(loaded);
      })
      .catch((err: any) => toast.error(err.message || "Failed to load shops"));
  }, []);

  const handleChange = (id: string, field: keyof RowData, value: string) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "weekNum") {
          const wn = parseInt(value, 10);
          if (!value) {
            updated.startDate = "";
            updated.endDate = "";
          } else if (!isNaN(wn) && wn >= 1 && wn <= 53) {
            const diw = setISOWeek(new Date(), wn);
            updated.startDate = format(startOfISOWeek(diw), "yyyy-MM-dd");
            updated.endDate = format(endOfISOWeek(diw), "yyyy-MM-dd");
          }
        }
        return updated;
      }),
    );
  };

  const removeRow = (id: string) =>
    setRows((prev) => (prev.length > 1 ? prev.filter((r) => r.id !== id) : prev));

  const handleSubmit = async () => {
    if (!selectedShopId) { toast.error("Please select a shop first."); return; }
    const invalid = rows.find(
      (r) => r.weekNum === "" || Number(r.weekNum) < 1 || Number(r.weekNum) > 53,
    );
    if (invalid) { toast.error("All rows need a valid week number (1–53)."); return; }

    setSubmitting(true);
    let ok = 0, fail = 0;

    for (const r of rows) {
      const d = calc(r);
      const startDt = r.startDate ? new Date(r.startDate) : null;
      const payload = {
        shop_id: selectedShopId,
        year: startDt ? startDt.getFullYear() : new Date().getFullYear(),
        month: startDt ? startDt.getMonth() + 1 : null,
        week_number: Number(r.weekNum),
        week_range_label: weekEndingLabel(r.startDate, r.endDate),
        source_sheet: "Weekly 2026",
        metrics: {
          sales: d.s,
          net: d.net,
          labour: d.labour,
          vat: d.vat,
          royalties: d.royalties,
          food_cost: d.foodCost,
          commision: d.c,
          commision_percentage: d.commPct,
          total: d.total,
          income: d.income,
        },
      };
      try { await financialsApi.submitWeekly(payload); ok++; }
      catch (err) { fail++; console.error(err); }
    }

    setSubmitting(false);
    if (fail === 0) {
      toast.success(`Successfully uploaded ${ok} weeks.`);
      setRows([newRow()]);
      setSelectedShopId("");
    } else {
      toast.error(`Uploaded ${ok} weeks, ${fail} failed.`);
    }
  };

  // Column totals
  const totals = rows.reduce(
    (acc, r) => {
      const d = calc(r);
      return {
        sales: acc.sales + d.s,
        net: acc.net + d.net,
        labour: acc.labour + d.labour,
        vat: acc.vat + d.vat,
        royalties: acc.royalties + d.royalties,
        foodCost: acc.foodCost + d.foodCost,
        commision: acc.commision + d.c,
        total: acc.total + d.total,
        income: acc.income + d.income,
      };
    },
    { sales: 0, net: 0, labour: 0, vat: 0, royalties: 0, foodCost: 0, commision: 0, total: 0, income: 0 },
  );

  const dash = "—";

  return (
    <div className="space-y-4 pb-28 animate-fade-in">
      {/* ── Controls ── */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-slate-600 whitespace-nowrap">Shop:</label>
          <select
            value={selectedShopId}
            onChange={(e) => setSelectedShopId(e.target.value)}
            className="text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-accent-500 min-w-[160px]"
          >
            <option value="">— Select shop —</option>
            {shops.map((s) => (
              <option key={s._id} value={s._id}>{s.name}</option>
            ))}
          </select>
        </div>
        <div className="flex-1" />
        <button
          type="button"
          onClick={() => setRows((prev) => [...prev, newRow(prev[prev.length - 1]?.weekNum)])}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg px-3 py-2 bg-white hover:bg-slate-50 transition-colors"
        >
          <Plus size={13} /> Add Row
        </button>
        <button
          type="button"
          onClick={() => { setRows([newRow()]); setSelectedShopId(""); }}
          className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-red-600 border border-slate-200 rounded-lg px-3 py-2 bg-white hover:bg-red-50 transition-colors"
        >
          <Trash2 size={13} /> Reset
        </button>
      </div>

      {/* ── Sheet ── */}
      <div className="rounded-xl border border-slate-200 overflow-hidden shadow-sm bg-white">
        <div className="overflow-x-auto">
          <table className="text-[11px] border-collapse" style={{ minWidth: 1100 }}>
            <thead>
              {/* Group row */}
              <tr className="bg-gradient-to-r from-slate-800 to-slate-700 text-white text-[9px] uppercase tracking-widest">
                <th className="sticky left-0 z-20 bg-slate-800 border-r border-slate-600 px-2 py-2 text-center w-8">#</th>
                <th className="border-r border-slate-600 px-2 py-2 text-center w-14">Wk #</th>
                {/* Week Ending */}
                <th className="border-r border-slate-500 px-3 py-2 text-center text-green-300">Week Ending</th>
                {/* Inputs */}
                <th className="border-r border-slate-500 px-3 py-2 text-center text-green-300">Sales</th>
                {/* Formulas */}
                <th colSpan={5} className="border-r border-slate-500 px-3 py-2 text-center text-slate-300">Calculated (formula)</th>
                {/* Commission */}
                <th className="border-r border-slate-500 px-3 py-2 text-center text-green-300">Commission</th>
                {/* More formulas */}
                <th colSpan={3} className="px-3 py-2 text-center text-slate-300">Calculated</th>
                <th className="w-8 border-l border-slate-600" />
              </tr>

              {/* Column header — exact Excel order */}
              <tr className="bg-slate-100 text-slate-600 border-b-2 border-slate-300 text-[9px] font-bold uppercase tracking-wider">
                <th className="sticky left-0 z-20 bg-slate-100 border-r border-slate-200 px-2 py-2 text-center" />
                <th className="border-r border-slate-200 px-2 py-2 text-center">Wk #</th>
                <th className="border-r border-slate-300 px-3 py-2 text-center text-green-700">Week Ending</th>
                <th className="border-r border-slate-300 px-3 py-2 text-center text-green-700">Sales</th>
                <th className="border-r border-slate-200 px-3 py-2 text-center text-slate-500">Net</th>
                <th className="border-r border-slate-200 px-3 py-2 text-center text-slate-500">Labour</th>
                <th className="border-r border-slate-200 px-3 py-2 text-center text-slate-500">VAT 18%</th>
                <th className="border-r border-slate-200 px-3 py-2 text-center text-slate-500">Royalties</th>
                <th className="border-r border-slate-300 px-3 py-2 text-center text-slate-500">Food Cost 22%</th>
                <th className="border-r border-slate-300 px-3 py-2 text-center text-green-700">Commission</th>
                <th className="border-r border-slate-200 px-3 py-2 text-center text-slate-500">Comm %</th>
                <th className="border-r border-slate-200 px-3 py-2 text-center text-orange-700">Total</th>
                <th className="border-r border-slate-200 px-3 py-2 text-center text-emerald-700">Income</th>
                <th className="px-2 py-2" />
              </tr>
            </thead>

            <tbody>
              {rows.map((row, i) => {
                const d = calc(row);
                return (
                  <tr
                    key={row.id}
                    className="border-b border-slate-100 hover:bg-slate-50/70 transition-colors group"
                  >
                    {/* # */}
                    <td className="sticky left-0 z-10 bg-white group-hover:bg-slate-50/70 border-r border-slate-100 px-2 py-1.5 text-center text-slate-400 font-mono font-bold">{i + 1}</td>

                    {/* Week # — editable (drives date calc) */}
                    <td className="border-r border-slate-200 px-1 py-1 bg-green-50/30">
                      <input
                        type="number" min={1} max={53}
                        value={row.weekNum}
                        onChange={(e) => handleChange(row.id, "weekNum", e.target.value)}
                        className="w-full text-center text-[11px] font-bold text-slate-800 bg-transparent border border-transparent rounded focus:outline-none focus:border-green-400 focus:bg-white px-1 py-0.5 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      />
                    </td>

                    {/* Week Ending — formula */}
                    <td className={`${formulaCls} text-slate-700 font-semibold whitespace-nowrap`}>
                      {weekEndingLabel(row.startDate, row.endDate)}
                    </td>

                    {/* Sales — input */}
                    <td className={inputTdCls}>
                      <input type="number" placeholder="0.00" value={row.sales}
                        onChange={(e) => handleChange(row.id, "sales", e.target.value)}
                        className={inputCls} />
                    </td>

                    {/* Net — formula */}
                    <td className={formulaCls}>{fmtGBP(d.net)}</td>
                    {/* Labour — formula */}
                    <td className={formulaCls}>{fmtGBP(d.labour)}</td>
                    {/* VAT 18% — formula */}
                    <td className={formulaCls}>{fmtGBP(d.vat)}</td>
                    {/* Royalties — formula */}
                    <td className={formulaCls}>{fmtGBP(d.royalties)}</td>
                    {/* Food Cost 22% — formula */}
                    <td className={`${formulaCls} border-r border-slate-200`}>{fmtGBP(d.foodCost)}</td>

                    {/* Commission — input */}
                    <td className={`border-r border-slate-200 px-1 py-1 bg-green-50/40`}>
                      <input type="number" placeholder="0.00" value={row.commision}
                        onChange={(e) => handleChange(row.id, "commision", e.target.value)}
                        className={inputCls} />
                    </td>

                    {/* Commission % — formula */}
                    <td className={formulaCls}>{fmtPct(d.commPct)}</td>
                    {/* Total — formula */}
                    <td className="border-r border-slate-100 px-3 py-1.5 text-right text-[11px] font-mono font-bold text-orange-700 bg-orange-50/40">{fmtGBP(d.total)}</td>
                    {/* Income — formula */}
                    <td className="border-r border-slate-100 px-3 py-1.5 text-right text-[11px] font-mono font-bold text-emerald-700 bg-emerald-50/40">{fmtGBP(d.income)}</td>

                    {/* Remove */}
                    <td className="px-2 py-1.5 text-center">
                      <button type="button" onClick={() => removeRow(row.id)} disabled={rows.length === 1}
                        className="p-1 rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-20">
                        <X size={12} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>

            <tfoot>
              <tr className="bg-slate-800 text-white border-t-2 border-slate-600 text-[10px] font-bold">
                <td className="sticky left-0 bg-slate-800 border-r border-slate-600 px-2 py-2 text-center text-slate-400">Σ</td>
                <td className="border-r border-slate-600 px-2 py-2 text-center text-slate-400">{rows.length} wks</td>
                <td className="border-r border-slate-600 px-3 py-2 text-center text-slate-400 uppercase tracking-widest text-[9px]">Total</td>
                <td className="border-r border-slate-500 px-3 py-2 text-right font-mono text-green-300">{fmtGBP(totals.sales)}</td>
                <td className="border-r border-slate-600 px-3 py-2 text-right font-mono text-slate-300">{fmtGBP(totals.net)}</td>
                <td className="border-r border-slate-600 px-3 py-2 text-right font-mono text-slate-300">{fmtGBP(totals.labour)}</td>
                <td className="border-r border-slate-600 px-3 py-2 text-right font-mono text-slate-300">{fmtGBP(totals.vat)}</td>
                <td className="border-r border-slate-600 px-3 py-2 text-right font-mono text-slate-300">{fmtGBP(totals.royalties)}</td>
                <td className="border-r border-slate-600 px-3 py-2 text-right font-mono text-slate-300">{fmtGBP(totals.foodCost)}</td>
                <td className="border-r border-slate-500 px-3 py-2 text-right font-mono text-green-300">{fmtGBP(totals.commision)}</td>
                <td className="border-r border-slate-600 px-3 py-2 text-center text-slate-400">{dash}</td>
                <td className="border-r border-slate-600 px-3 py-2 text-right font-mono text-orange-300">{fmtGBP(totals.total)}</td>
                <td className="border-r border-slate-600 px-3 py-2 text-right font-mono text-emerald-300">{fmtGBP(totals.income)}</td>
                <td />
              </tr>
            </tfoot>
          </table>
        </div>
        <div className="flex items-center gap-4 px-4 py-2 border-t border-slate-100 bg-slate-50/70 text-[10px] text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-green-100 border border-green-200 inline-block" /> Input</span>
          <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-slate-100 border border-slate-200 inline-block" /> Formula</span>
        </div>
      </div>

      {/* ── Submit bar ── */}
      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 sm:px-8 py-3 bg-white/95 backdrop-blur border-t border-slate-200 flex items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{rows.length}</span> {rows.length === 1 ? "week" : "weeks"}
          {selectedShopId && (
            <> · <span className="font-semibold text-slate-700">{shops.find((s) => s._id === selectedShopId)?.name}</span></>
          )}
        </p>
        <div className="flex items-center gap-3">
          <button type="button" onClick={() => { setRows([newRow()]); setSelectedShopId(""); }}
            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1.5 transition-colors">
            <Trash2 size={13} /> Reset
          </button>
          <Button variant="primary" onClick={handleSubmit} isLoading={submitting} leftIcon={<CheckCircle2 size={16} />} className="px-6">
            Submit Weekly
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WeeklySheetView;
