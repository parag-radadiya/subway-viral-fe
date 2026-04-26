import {
  endOfISOWeek,
  format,
  getISOWeek,
  setISOWeek,
  startOfISOWeek,
} from "date-fns";
import {
  BarChart3,
  CheckCircle2,
  ChevronDown,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import Button from "../../../components/common/Button";
import Input from "../../../components/common/Input";
import Select from "../../../components/common/Select";
import { financialsApi, shopsApi } from "../../../config/apiCall";
import { Shop } from "./components/types";

interface RowData {
  id: string;
  weekNum: number | "";
  startDate: string;
  endDate: string;
  sales: number | "";
  commision: number | "";
  expanded: boolean;
}

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
    expanded: true,
  };
};

const formatDateRange = (start: string, end: string) => {
  if (!start || !end) return "";
  const s = new Date(start);
  const e = new Date(end);
  const fmt = (dt: Date) =>
    `${String(dt.getDate()).padStart(2, "0")}/${String(dt.getMonth() + 1).padStart(2, "0")}`;
  return `${fmt(s)} To ${fmt(e)}`;
};

const fmtNum = (num: number) =>
  num.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
const fmtPct = (num: number) =>
  num.toLocaleString("en-GB", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }) + "%";

const WeeklyFinancialsUpload: React.FC = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [selectedShopId, setSelectedShopId] = useState<string>("");
  const [rows, setRows] = useState<RowData[]>([newRow()]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    shopsApi
      .list()
      .then((res: any) => {
        const loadedShops = res.data.data.shops || res.data.data.data || [];
        setShops(loadedShops);
      })
      .catch((err: any) => toast.error(err.message || "Failed to load shops"));
  }, []);

  const handleRowChange = (id: string, field: keyof RowData, value: any) => {
    setRows((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r;
        const updated = { ...r, [field]: value };
        if (field === "weekNum") {
          const wn = parseInt(value, 10);
          if (value === "") {
            updated.startDate = "";
            updated.endDate = "";
          } else if (!isNaN(wn) && wn >= 1 && wn <= 53) {
            const dateInWeek = setISOWeek(new Date(), wn);
            updated.startDate = format(
              startOfISOWeek(dateInWeek),
              "yyyy-MM-dd",
            );
            updated.endDate = format(endOfISOWeek(dateInWeek), "yyyy-MM-dd");
          }
        }
        return updated;
      }),
    );
  };

  const removeRow = (id: string) => {
    setRows((prev) =>
      prev.length > 1 ? prev.filter((r) => r.id !== id) : prev,
    );
  };

  const calcDerived = (r: RowData) => {
    const s = Number(r.sales) || 0;
    const c = Number(r.commision) || 0;
    const vat = s * 0.18;
    const net = s - vat;
    const labour = s * 0.08;
    const royalties = net * 0.125;
    const foodCost = net * 0.22;
    const commPct = s > 0 ? (c / s) * 100 : 0;
    const total = labour + vat + royalties + foodCost + c;
    const income = s - total;

    return {
      s,
      c,
      vat,
      net,
      labour,
      royalties,
      foodCost,
      commPct,
      total,
      income,
    };
  };

  const handleSubmit = async () => {
    if (!selectedShopId) {
      toast.error("Please select a shop first.");
      return;
    }

    const invalidRow = rows.find(
      (r) =>
        r.weekNum === "" || Number(r.weekNum) < 1 || Number(r.weekNum) > 53,
    );
    if (invalidRow) {
      toast.error("Please ensure all rows have a valid week number.");
      return;
    }

    setSubmitting(true);
    let successCount = 0;
    let failCount = 0;

    for (const r of rows) {
      const d = calcDerived(r);
      const startDt = r.startDate ? new Date(r.startDate) : null;
      const month = startDt ? startDt.getMonth() + 1 : null;
      const year = startDt ? startDt.getFullYear() : new Date().getFullYear();

      const payload = {
        shop_id: selectedShopId,
        year,
        month,
        week_number: Number(r.weekNum),
        week_range_label: formatDateRange(r.startDate, r.endDate),
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

      try {
        await financialsApi.submitWeekly(payload);
        successCount++;
      } catch (err) {
        failCount++;
        console.error("Failed for row:", r, err);
      }
    }

    setSubmitting(false);
    if (failCount === 0) {
      toast.success(`Successfully uploaded ${successCount} weeks of data.`);
      setRows([newRow()]);
      setSelectedShopId("");
    } else {
      toast.error(`Uploaded ${successCount} weeks, but ${failCount} failed.`);
    }
  };

  return (
    <div className="space-y-6 pb-28 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={20} className="text-accent-600" />
            <h2 className="text-xl font-bold text-slate-800">
              Weekly Financial Report
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Add weekly financial data for the selected shop.
          </p>
        </div>
        <div className="flex gap-2">
          <Select
            value={selectedShopId}
            onChange={(e) => setSelectedShopId(e.target.value)}
          >
            {shops.map((shop) => (
              <option key={shop._id} value={shop._id}>
                {shop.name}
              </option>
            ))}
          </Select>
          <Button
            variant="secondary"
            onClick={() =>
              setRows((prev) => [
                ...prev,
                newRow(prev[prev.length - 1]?.weekNum),
              ])
            }
            leftIcon={<Plus size={16} />}
            className="shrink-0"
          >
            Add Week
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        {rows.map((row, i) => {
          const d = calcDerived(row);
          return (
            <div
              key={row.id}
              className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden group transition-all hover:shadow-md"
            >
              {/* Header */}
              <div
                className={`flex items-center gap-3 px-5 py-3.5 bg-gradient-to-r from-slate-800 to-slate-700 text-white select-none cursor-pointer ${row.expanded ? "rounded-t-2xl" : "rounded-2xl"}`}
                onClick={() =>
                  handleRowChange(row.id, "expanded", !row.expanded)
                }
              >
                <span className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold shrink-0">
                  {i + 1}
                </span>
                <div className="flex-1">
                  <p className="text-[10px] text-slate-400 font-medium uppercase tracking-widest">
                    Week {row.weekNum || "—"}
                  </p>
                  <p className="text-sm font-bold">
                    {formatDateRange(row.startDate, row.endDate) ||
                      "Invalid week configuration"}
                  </p>
                </div>
                <span
                  className="transition-transform duration-200 text-slate-300 mx-2"
                  style={{
                    transform: row.expanded ? "rotate(0deg)" : "rotate(-90deg)",
                  }}
                >
                  <ChevronDown size={18} />
                </span>
                <button
                  type="button"
                  className="p-1.5 rounded-lg hover:bg-white/10 text-slate-400 hover:text-red-300 transition-colors disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-slate-400"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeRow(row.id);
                  }}
                  disabled={rows.length === 1}
                  title="Remove row"
                >
                  <Trash2 size={15} />
                </button>
              </div>

              {row.expanded && (
                <>
                  {/* Inputs Row */}
                  <div className="px-5 py-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-4">
                    <Input
                      label="Week Number"
                      type="number"
                      min={1}
                      max={53}
                      value={row.weekNum}
                      onChange={(e) =>
                        handleRowChange(row.id, "weekNum", e.target.value)
                      }
                    />
                    <Input
                      label="Sales (£)"
                      type="number"
                      min={0}
                      step="0.01"
                      value={row.sales}
                      onChange={(e) =>
                        handleRowChange(row.id, "sales", e.target.value)
                      }
                      className="font-bold text-slate-800"
                    />
                    <Input
                      label="Commission (£)"
                      type="number"
                      min={0}
                      step="0.01"
                      value={row.commision}
                      onChange={(e) =>
                        handleRowChange(row.id, "commision", e.target.value)
                      }
                      className="font-bold text-slate-800"
                    />
                  </div>

                  {/* Metrics Grid */}
                  <div className="p-5">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
                      {[
                        {
                          label: "Net",
                          val: `£${fmtNum(d.net)}`,
                          bg: "bg-blue-50 text-blue-700 border-blue-100",
                        },
                        {
                          label: "Labour (8%)",
                          val: `£${fmtNum(d.labour)}`,
                          bg: "bg-violet-50 text-violet-700 border-violet-100",
                        },
                        {
                          label: "VAT (18%)",
                          val: `£${fmtNum(d.vat)}`,
                          bg: "bg-slate-50 text-slate-700 border-slate-200",
                        },
                        {
                          label: "Royalities (12.5%)",
                          val: `£${fmtNum(d.royalties)}`,
                          bg: "bg-orange-50 text-orange-700 border-orange-100",
                        },
                        {
                          label: "Food Cost (22%)",
                          val: `£${fmtNum(d.foodCost)}`,
                          bg: "bg-rose-50 text-rose-700 border-rose-100",
                        },
                        {
                          label: "Comm %",
                          val:
                            d.commPct > 0
                              ? d.commPct === Infinity
                                ? "0.00%"
                                : fmtPct(d.commPct)
                              : "#DIV/0!",
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

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="rounded-xl border border-orange-200 bg-orange-50/50 p-4 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-orange-800 uppercase tracking-wider">
                            Total Deductions
                          </h4>
                          <p className="text-[10px] text-orange-600/80 mt-0.5">
                            Labour + VAT + Royalties + Food Cost + Comm
                          </p>
                        </div>
                        <span className="text-xl font-black text-orange-700">
                          £{fmtNum(d.total)}
                        </span>
                      </div>
                      <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 flex items-center justify-between">
                        <div>
                          <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider">
                            Net Income
                          </h4>
                          <p className="text-[10px] text-emerald-600/80 mt-0.5">
                            Sales - Total Deductions
                          </p>
                        </div>
                        <span className="text-xl font-black text-emerald-700">
                          £{fmtNum(d.income)}
                        </span>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-40 px-4 sm:px-8 py-3 bg-white/95 backdrop-blur border-t border-slate-200 flex items-center justify-between gap-4">
        <p className="text-xs text-slate-500">
          <span className="font-semibold text-slate-700">{rows.length}</span>{" "}
          {rows.length === 1 ? "week" : "weeks"} pending
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => {
              setRows([newRow()]);
              setSelectedShopId("");
            }}
            className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <X size={13} />
            Reset
          </button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            isLoading={submitting}
            leftIcon={<CheckCircle2 size={16} />}
            className="px-6"
          >
            Submit Weekly Financials
          </Button>
        </div>
      </div>
    </div>
  );
};

export default WeeklyFinancialsUpload;
