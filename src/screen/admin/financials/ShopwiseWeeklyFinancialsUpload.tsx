import { getISOWeek } from "date-fns";
import { BarChart3, CheckCircle2, Loader2, Plus, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { toast } from "react-toastify";
import Button from "../../../components/common/Button";
import { financialsApi, shopsApi } from "../../../config/apiCall";

import { Shop, WeekCard } from "./components/types";
import { calcDerived, n, newShopEntry, newWeekCard } from "./components/utils";
import { WeekCardComponent } from "./components/WeekCardComponent";

// ─── Main Screen ──────────────────────────────────────────────────────────────

const ShopwiseWeeklyFinancialsUpload = () => {
  const [shops, setShops] = useState<Shop[]>([]);
  const [shopsLoading, setShopsLoading] = useState(true);
  const [weeks, setWeeks] = useState<WeekCard[]>([newWeekCard()]);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    shopsApi
      .list()
      .then((res: any) => {
        const data = res.data.data;
        const loadedShops = data.shops || data.data || [];
        setShops(loadedShops);

        setWeeks((prev) => {
          if (
            prev.length === 1 &&
            prev[0].shops.length === 1 &&
            !prev[0].shops[0].shopId
          ) {
            const wk = { ...prev[0] };
            wk.shops = loadedShops.map((s: any) => {
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

  // ── Week mutations ────────────────────────────────────────────────────────

  const addWeek = useCallback(() => {
    setWeeks((prev) => {
      const wk = newWeekCard();
      wk.shops = shops.map((s) => {
        const e = newShopEntry();
        e.shopId = s._id;
        return e;
      });
      return [...prev, wk];
    });
  }, [shops]);

  // ── Submit ────────────────────────────────────────────────────────────────

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
    const missingShop = weeks.some((w) => w.shops.some((s) => !s.shopId));
    if (missingShop) {
      toast.error("Please select a shop for every shop row.");
      return;
    }

    const payload = buildPayload();
    console.log("🚀 - handleSubmit - payload:", payload);

    setSubmitting(true);

    financialsApi
      .submitWeeklyReport(buildPayload())
      .then(({ data }) => {
        if (data.data?.errors?.length) {
          toast.error(data?.errors?.join(",") || "Failed to load shop details");
          return;
        }
        toast.success(data.message);
        setWeeks([newWeekCard()]);
      })
      .catch((err: any) => {
        toast.error(err.message || "Failed to import data");
        console.error(err);
      })
      .finally(() => setSubmitting(false));
  };

  const totalEntries = weeks.reduce((acc, w) => acc + w.shops.length, 0);

  return (
    <div className="space-y-6 pb-28 animate-fade-in">
      {/* ── Page header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 size={20} className="text-accent-600" />
            <h2 className="text-xl font-bold text-slate-800">
              Shopwise weekly
            </h2>
          </div>
          <p className="text-xs text-slate-500">
            Add shopwise weekly data for each shop within that week.
          </p>
        </div>
        <Button
          variant="secondary"
          onClick={addWeek}
          leftIcon={<Plus size={16} />}
          className="shrink-0"
        >
          Add Week
        </Button>
      </div>

      {/* ── Loading ── */}
      {shopsLoading && (
        <div className="flex items-center justify-center gap-2 py-10 text-slate-400">
          <Loader2 size={18} className="animate-spin" />
          <span className="text-sm">Loading shops…</span>
        </div>
      )}

      {/* ── Week cards ── */}
      {!shopsLoading && (
        <div className="space-y-6">
          {weeks.map((week, idx) => (
            <WeekCardComponent
              key={week.id}
              week={week}
              setWeeks={setWeeks}
              allShops={shops}
              index={idx}
              canRemoveWeek={weeks.length > 1}
            />
          ))}
        </div>
      )}

      {/* ── Sticky submit bar ── */}
      {!shopsLoading && (
        <div className="fixed bottom-0 left-0 right-0 z-40 px-4 sm:px-8 py-3 bg-white/95 backdrop-blur border-t border-slate-200 flex items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            <span className="font-semibold text-slate-700">{weeks.length}</span>{" "}
            {weeks.length === 1 ? "week" : "weeks"},{" "}
            <span className="font-semibold text-slate-700">{totalEntries}</span>{" "}
            {totalEntries === 1 ? "shop entry" : "shop entries"}
          </p>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setWeeks([newWeekCard()])}
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

export default ShopwiseWeeklyFinancialsUpload;
