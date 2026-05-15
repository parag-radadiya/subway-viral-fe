import { TrendingDown, TrendingUp } from "lucide-react";
import type { DeltaNode, ShopRow } from "./analytics.types";

const fmt = (n: number, decimals = 0) =>
  new Intl.NumberFormat("en-GB", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(n ?? 0);

const DeltaBadge = ({ delta }: { delta?: DeltaNode }) => {
  if (!delta) return <span className="text-slate-300 text-xs">—</span>;
  const pos = delta.changePct >= 0;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
        pos
          ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
          : "bg-red-50 text-red-500 border border-red-100"
      }`}
    >
      {pos ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
      {Math.abs(delta.changePct).toFixed(1)}%
    </span>
  );
};

interface Props {
  shops: ShopRow[];
}

const COLS: Array<{
  key: string;
  label: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
}> = [
  { key: "grossSales", label: "Gross Sales", prefix: "£" },
  { key: "netSales", label: "Net Sales", prefix: "£" },
  { key: "labourPercent", label: "Labour %", suffix: "%", decimals: 1 },
  { key: "foodCostPercent", label: "Food %", suffix: "%", decimals: 1 },
  { key: "avgOrderValue", label: "AOV", prefix: "£", decimals: 2 },
  { key: "customerCount", label: "Customers" },
];

const AnalyticsShopTable = ({ shops }: Props) => {
  if (!shops?.length) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4">Shop Ranking</h3>
        <p className="text-slate-400 text-sm text-center py-8">
          No shop data available
        </p>
      </div>
    );
  }

  const sorted = [...shops].sort(
    (a, b) =>
      ((b.current.grossSales ?? 0) - (a.current.grossSales ?? 0)),
  );

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100">
        <h3 className="text-sm font-bold text-slate-800">
          Shop Ranking
          <span className="ml-2 text-xs font-normal text-slate-400">
            sorted by gross sales
          </span>
        </h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/60">
              <th className="text-left px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                #
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Shop
              </th>
              {COLS.map((c) => (
                <th
                  key={c.key}
                  className="text-right px-4 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap"
                >
                  {c.label}
                </th>
              ))}
              <th className="text-right px-6 py-3 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                YoY Δ
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.map((shop, idx) => (
              <tr
                key={shop.shopId}
                className="border-b border-slate-50 hover:bg-slate-50/40 transition-colors"
              >
                <td className="px-6 py-3.5 text-xs font-bold text-slate-400">
                  {idx + 1}
                </td>
                <td className="px-4 py-3.5">
                  <span className="font-semibold text-slate-800 capitalize">
                    {shop.shopName}
                  </span>
                  <div className="text-[10px] text-slate-400">
                    {shop.record_count} records
                  </div>
                </td>
                {COLS.map((c) => {
                  const val = (shop.current as any)[c.key] ?? 0;
                  return (
                    <td
                      key={c.key}
                      className="px-4 py-3.5 text-right font-medium text-slate-700 whitespace-nowrap"
                    >
                      {c.prefix}
                      {fmt(val, c.decimals)}
                      {c.suffix}
                    </td>
                  );
                })}
                <td className="px-6 py-3.5 text-right">
                  <DeltaBadge delta={shop.delta?.grossSales} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AnalyticsShopTable;
