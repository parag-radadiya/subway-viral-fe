import { BarChart3, CheckCircle2, Loader2, Plus, X } from "lucide-react";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Button from "../../../components/common/Button";
import { financialsApi, shopsApi } from "../../../config/apiCall";
import { MonthCardComponent } from "./components/MonthCardComponent";
import {
  MonthCard,
  newMonthCard,
  newMonthlyShopEntry,
} from "./components/MonthlyShopMetricsForm";
import { n } from "./components/utils";

const MonthlyFinancialsUpload: React.FC = () => {
  const [shops, setShops] = useState<any[]>([]);
  const [shopsLoading, setShopsLoading] = useState(true);
  const [months, setMonths] = useState<MonthCard[]>([newMonthCard()]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    shopsApi
      .list()
      .then((res: any) => {
        const data = res.data.data;
        const loadedShops = data.shops || data.data || [];
        setShops(loadedShops);

        setMonths((prev) => {
          if (prev.length === 1 && prev[0].shops.length === 0) {
            const mc = { ...prev[0] };
            mc.shops = loadedShops.map((s: any) => {
              const e = newMonthlyShopEntry();
              e.shopId = s._id;
              return e;
            });
            return [mc];
          }
          return prev;
        });
      })
      .catch((err: any) => toast.error(err.message || "Failed to load shops"))
      .finally(() => setShopsLoading(false));
  }, []);

  const addMonth = useCallback(() => {
    setMonths((prev) => {
      const mc = newMonthCard();
      mc.shops = shops.map((s) => {
        const e = newMonthlyShopEntry();
        e.shopId = s._id;
        return e;
      });
      return [...prev, mc];
    });
  }, [shops]);

  const resetAll = () => {
    const mc = newMonthCard();
    mc.shops = shops.map((s) => {
      const e = newMonthlyShopEntry();
      e.shopId = s._id;
      return e;
    });
    setMonths([mc]);
  };

  const handleSubmit = async () => {
    const missingDate = months.find((m) => !m.monthNumber || !m.year);
    if (missingDate) {
      toast.error("Please set Year and Month Number for all blocks.");
      return;
    }
    const missingShop = months.some((m) => m.shops.some((s) => !s.shopId));
    if (missingShop) {
      toast.error("Please select a shop for every shop row.");
      return;
    }

    setSubmitting(true);
    let successCount = 0;
    let failCount = 0;

    for (const mc of months) {
      const year = parseInt(mc.year, 10);
      const monthNum = parseInt(mc.monthNumber, 10);

      for (const s of mc.shops) {
        const m = s.metrics;

        const gross = n(m.grossSale);
        const net = n(m.netSale);
        const payload = {
          shop_id: s.shopId,
          year,
          month: monthNum,
          metrics: {
            grossSale: gross,
            netSale: net,
            vat: gross - net,
            customerCount: n(m.customerCount),
            bidfood: n(m.bidfood),
            labourHour: n(m.labourHour),
            kioskPct: n(m.kioskPct),
            revScoreQ1: n(m.revScoreQ1),
          },
        };

        try {
          await financialsApi.submitMonthlySale(payload);
          successCount++;
        } catch (err: any) {
          failCount++;
          console.error("Failed for row:", s, err);
        }
      }
    }

    setSubmitting(false);

    if (failCount === 0) {
      toast.success(`Successfully uploaded ${successCount} monthly records.`);
      resetAll();
    } else {
      toast.error(`Uploaded ${successCount} records, but ${failCount} failed.`);
    }
  };

  const totalEntries = months.reduce((acc, m) => acc + m.shops.length, 0);

  return (
    <div className="space-y-6 pb-28 animate-fade-in">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={20} className="text-accent-600" />
            <h2 className="text-xl font-bold text-slate-800">
              Monthly Financial Report
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Add monthly financial metrics for each shop.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={addMonth}
          leftIcon={<Plus size={16} />}
          className="shrink-0"
        >
          Add Month
        </Button>
      </div>

      {/* ── Loading ── */}
      {shopsLoading && (
        <div className="flex items-center justify-center gap-2 py-10 text-slate-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading shops…</span>
        </div>
      )}

      {/* ── Month cards ── */}
      {!shopsLoading && (
        <div className="space-y-6">
          {months.map((month, idx) => (
            <MonthCardComponent
              key={month.id}
              month={month}
              setMonths={setMonths}
              allShops={shops}
              index={idx}
              canRemoveMonth={months.length > 1}
            />
          ))}
        </div>
      )}

      {/* ── Sticky submit bar ── */}
      {!shopsLoading && (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 sm:px-8 py-3 bg-white/95 backdrop-blur border-t border-slate-200 flex items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">
              {months.length}
            </span>{" "}
            {months.length === 1 ? "month" : "months"},{" "}
            <span className="font-semibold text-slate-700">{totalEntries}</span>{" "}
            {totalEntries === 1 ? "shop entry" : "shop entries"}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={resetAll}
              className="text-xs text-slate-500 hover:text-slate-700 flex items-center gap-1.5 transition-colors"
            >
              <X size={13} />
              Reset all
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

export default MonthlyFinancialsUpload;
