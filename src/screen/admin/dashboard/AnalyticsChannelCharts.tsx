import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LinearScale,
  Tooltip,
} from "chart.js";
import { Bar, Doughnut } from "react-chartjs-2";
import type { KpiTotals } from "./analytics.types";

ChartJS.register(
  ArcElement,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
);

const fmt = (n: number) =>
  "£" + new Intl.NumberFormat("en-GB").format(Math.round(n ?? 0));

// ─── Cost Breakdown Donut ──────────────────────────────────────────────────────
const CostBreakdownDonut = ({ kpis }: { kpis: KpiTotals }) => {
  const data = {
    labels: ["Labour", "Food Cost", "Commission", "Net Income"],
    datasets: [
      {
        data: [
          kpis.labour,
          kpis.foodCost,
          kpis.commission,
          Math.max(0, kpis.income),
        ],
        backgroundColor: ["#3b82f6", "#f59e0b", "#ef4444", "#10b981"],
        borderWidth: 0,
        hoverOffset: 6,
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 mb-4">Cost Breakdown</h3>
      <div style={{ height: "220px" }}>
        <Doughnut
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: "65%",
            plugins: {
              legend: {
                position: "right",
                labels: { boxWidth: 12, font: { size: 11 }, padding: 12 },
              },
              tooltip: {
                callbacks: {
                  label: (ctx) => ` ${ctx.label}: ${fmt(ctx.parsed)}`,
                },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

// ─── 3PD Channel Bar ───────────────────────────────────────────────────────────
const ChannelBar = ({ kpis }: { kpis: KpiTotals }) => {
  const data = {
    labels: ["Just Eat", "Uber Eats", "Deliveroo", "In-Store"],
    datasets: [
      {
        label: "Revenue",
        data: [kpis.justeat, kpis.ubereat, kpis.deliveroo, kpis.instore],
        backgroundColor: ["#f97316", "#14b8a6", "#0ea5e9", "#10b981"],
        borderRadius: 6,
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 mb-4">Channel Revenue</h3>
      <div style={{ height: "220px" }}>
        <Bar
          data={data}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: { label: (ctx) => ` ${fmt(ctx.parsed.y!)}` },
              },
            },
            scales: {
              y: {
                border: { display: false },
                grid: { color: "#f1f5f9" },
                ticks: {
                  color: "#94a3b8",
                  font: { size: 10 },
                  callback: (val: any) =>
                    "£" + new Intl.NumberFormat("en-GB").format(val),
                },
              },
              x: {
                grid: { display: false },
                ticks: { color: "#64748b", font: { size: 11 } },
              },
            },
          }}
        />
      </div>
    </div>
  );
};

// ─── Channel Mix Badges ───────────────────────────────────────────────────────
const ChannelMixBadges = ({ kpis }: { kpis: KpiTotals }) => {
  const channels = [
    {
      label: "In-Store",
      value: kpis.instorePercent ?? 100 - kpis.threePdPercent,
      color: "bg-emerald-500",
    },
    {
      label: "Just Eat",
      value: (kpis.justeat / kpis.grossSales) * 100,
      color: "bg-orange-500",
    },
    {
      label: "Uber Eats",
      value: (kpis.ubereat / kpis.grossSales) * 100,
      color: "bg-teal-500",
    },
    {
      label: "Deliveroo",
      value: (kpis.deliveroo / kpis.grossSales) * 100,
      color: "bg-sky-500",
    },
  ];

  return (
    <div className="flex flex-wrap gap-2 mt-4">
      {channels.map((c) => (
        <div
          key={c.label}
          className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-full px-3 py-1"
        >
          <span className={`w-2 h-2 rounded-full ${c.color}`} />
          <span className="text-xs font-medium text-slate-600">{c.label}</span>
          <span className="text-xs font-bold text-slate-800">
            {isFinite(c.value) ? c.value.toFixed(1) : "0.0"}%
          </span>
        </div>
      ))}
    </div>
  );
};

// ─── Exports ─────────────────────────────────────────────────────────────────

interface Props {
  kpis: KpiTotals;
}

const AnalyticsChannelCharts = ({ kpis }: Props) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <CostBreakdownDonut kpis={kpis} />
      <ChannelBar kpis={kpis} />
    </div>
    <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 mb-1">Channel Mix</h3>
      <p className="text-xs text-slate-400">Revenue share by channel</p>
      <ChannelMixBadges kpis={kpis} />
    </div>
  </div>
);

export default AnalyticsChannelCharts;
