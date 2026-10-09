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
import ChartDataLabels from "chartjs-plugin-datalabels";
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
          plugins={[ChartDataLabels]}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            cutout: "65%",
            plugins: {
              datalabels: {
                color: "#fff",
                font: { size: 10, weight: "bold" as const },
                formatter: (val: any) => (val > 0 ? fmt(val) : ""),
              },
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
          plugins={[ChartDataLabels]}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { top: 20 } },
            plugins: {
              datalabels: {
                align: "top" as const,
                anchor: "end" as const,
                color: "#64748b",
                font: { size: 10, weight: "bold" as const },
                formatter: (val: any) => (val > 0 ? fmt(val) : ""),
              },
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

// ─── Channel Comparison Bar ──────────────────────────────────────────────────
const ChannelComparisonBar = ({
  kpis,
  compareKpis,
}: {
  kpis: KpiTotals;
  compareKpis?: KpiTotals;
}) => {
  const data = {
    labels: ["In-Store", "Just Eat", "Uber Eats", "Deliveroo"],
    datasets: [
      {
        label: "Current",
        data: [kpis.instore, kpis.justeat, kpis.ubereat, kpis.deliveroo],
        backgroundColor: "#10b981", // Emerald
        borderRadius: 4,
      },
      {
        label: "Previous",
        data: [
          compareKpis?.instore || 0,
          compareKpis?.justeat || 0,
          compareKpis?.ubereat || 0,
          compareKpis?.deliveroo || 0,
        ],
        backgroundColor: "#94a3b8", // Slate
        borderRadius: 4,
      },
    ],
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 mb-4">
        Channel Comparison
      </h3>
      <div style={{ height: "220px" }}>
        <Bar
          data={data}
          plugins={[ChartDataLabels]}
          options={{
            responsive: true,
            maintainAspectRatio: false,
            layout: { padding: { top: 20 } },
            plugins: {
              datalabels: {
                align: "top" as const,
                anchor: "end" as const,
                color: "#64748b",
                font: { size: 9, weight: "bold" as const },
                formatter: (val: any) => (val > 0 ? fmt(val) : ""),
              },
              legend: {
                position: "top",
                labels: { boxWidth: 12, font: { size: 11 } },
              },
              tooltip: {
                callbacks: {
                  label: (ctx) =>
                    ` ${ctx.dataset.label}: ${fmt(ctx.parsed.y!)}`,
                },
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

// ─── Exports ─────────────────────────────────────────────────────────────────

interface Props {
  kpis: KpiTotals;
  compareKpis?: KpiTotals;
}

const AnalyticsChannelCharts = ({ kpis, compareKpis }: Props) => (
  <div className="space-y-4">
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <CostBreakdownDonut kpis={kpis} />
      <ChannelBar kpis={kpis} />
    </div>
    <ChannelComparisonBar kpis={kpis} compareKpis={compareKpis} />
  </div>
);

export default AnalyticsChannelCharts;
