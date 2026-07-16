import { ShopMetrics, ShopEntry, WeekCard } from "./types";

export const emptyMetrics = (): ShopMetrics => ({
  grossSales: "",
  vat: "",
  customerCount: "",
  justEatSale: "",
  justCharge: "",
  justEatVat: "",
  justEatBankReceived: "",
  justEatVariance: "",
  uberEatSale: "",
  uberEatCharge: "",
  uberEatVat: "",
  uberEatBankReceived: "",
  uberAdvertise: "",
  uberDiscount: "",
  deliverooSale: "",
  deliverooCharge: "",
  deliverooVat: "",
  deliverooBankReceived: "",
  deliverooVariance: "",
  labourHours: "",
  labourRate: "11.50",
  bidFood: "",
  instoreFoodCost: "",
  instoreLabourCost: "",
  bidfoodPreviousWeek: "",
});

export const newShopEntry = (): ShopEntry => ({
  id: crypto.randomUUID(),
  shopId: "",
  metrics: emptyMetrics(),
  collapsed: true,
});

export const newWeekCard = (): WeekCard => ({
  id: crypto.randomUUID(),
  startDate: "",
  endDate: "",
  shops: [newShopEntry()],
});

export const n = (v: string) => parseFloat(v) || 0;
export const pct = (a: number, b: number) => (b !== 0 ? a / b : 0);
export const fmtNum = (v: number) =>
  isNaN(v) || !isFinite(v) ? "—" : v.toFixed(2);
export const fmtPct = (v: number) =>
  isNaN(v) || !isFinite(v) ? "—" : `${(v * 100).toFixed(2)}%`;

export function calcDerived(m: ShopMetrics) {
  const grossSales = n(m.grossSales);
  const vat = n(m.vat);
  const netSales = grossSales - vat;
  const adjustedVat = grossSales * 0.12;

  const justEatSale = n(m.justEatSale);
  const justCharge = n(m.justCharge);
  const justEatVat = n(m.justEatVat);
  const receiveFromJustEat = justEatSale - justCharge - justEatVat;

  const uberEatSale = n(m.uberEatSale);
  const uberEatCharge = n(m.uberEatCharge);
  const uberEatVat = n(m.uberEatVat);
  const receiveFromUber = uberEatSale - uberEatCharge - uberEatVat;

  const deliverooSale = n(m.deliverooSale);
  const deliverooCharge = n(m.deliverooCharge);
  const deliverooVat = n(m.deliverooVat);
  const receiveFromDeliveroo = deliverooSale - deliverooCharge - deliverooVat;

  const total3PD = justEatSale + uberEatSale + deliverooSale;
  const deliveryChargesTotal = justCharge + uberEatCharge + deliverooCharge;

  const labourHours = n(m.labourHours);
  const labourRate = parseFloat(m.labourRate) || 0;
  const labourCost = labourHours * labourRate;
  const bidFood = n(m.bidFood);
  const bidfoodPreviousWeek = n(m.bidfoodPreviousWeek);
  const bidfoodTotal = bidFood - bidfoodPreviousWeek;

  const deliveryChargePct = pct(deliveryChargesTotal, netSales);
  const labourCostPct = pct(labourCost, netSales);
  const foodCostPct = pct(bidFood, netSales);
  const totalCostPct = deliveryChargePct + labourCostPct + foodCostPct;

  return {
    netSales,
    adjustedVat,
    vatPct: pct(vat, grossSales),
    deliveryPct: pct(total3PD, grossSales),
    total3PD,
    receiveFromJustEat,
    receiveFromUber,
    receiveFromDeliveroo,
    deliveryChargesTotal,
    deliveryChargePct,
    labourCost,
    labourCostPct,
    foodCostPct,
    totalCostPct,
    bidfoodTotal,
  };
}

export function aggregateWeekMetrics(week: WeekCard): ShopMetrics {
  const aggregated = emptyMetrics();
  for (const shop of week.shops) {
    if (!shop.shopId) continue; // Only aggregate assigned shops
    for (const key of Object.keys(aggregated) as Array<keyof ShopMetrics>) {
      const val1 = n(aggregated[key]);
      const val2 = n(shop.metrics[key]);
      aggregated[key] = (val1 + val2).toString();
    }
  }
  return aggregated;
}
