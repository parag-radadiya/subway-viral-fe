export interface Shop {
  _id: string;
  name: string;
}

export interface ShopMetrics {
  grossSales: string;
  vat: string;
  customerCount: string;
  justEatSale: string;
  justCharge: string;
  justEatVat: string;
  justEatBankReceived: string;
  justEatVariance: string;
  uberEatSale: string;
  uberEatCharge: string;
  uberEatVat: string;
  uberEatBankReceived: string;
  uberAdvertise: string;
  uberDiscount: string;
  deliverooSale: string;
  deliverooCharge: string;
  deliverooVat: string;
  deliverooBankReceived: string;
  deliverooVariance: string;
  labourHours: string;
  bidFood: string;
  instoreFoodCost: string;
  instoreLabourCost: string;
  bidfoodPreviousWeek: string;
}

export interface ShopEntry {
  id: string;
  shopId: string;
  metrics: ShopMetrics;
  collapsed: boolean;
}

export interface WeekCard {
  id: string;
  startDate: string;
  endDate: string;
  shops: ShopEntry[];
}
