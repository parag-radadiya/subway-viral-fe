import {
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Tooltip,
} from "chart.js";
import { Line } from "react-chartjs-2";
import type { TrendData } from "./analytics.types";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Filler,
  Legend,
  Tooltip,
);

const COLORS = [
  { border: "#3b82f6", bg: "rgba(59,130,246,0.08)" },
  { border: "#10b981", bg: "rgba(16,185,129,0.08)" },
  { border: "#f59e0b", bg: "rgba(245,158,11,0.08)" },
  { border: "#8b5cf6", bg: "rgba(139,92,246,0.08)" },
];

const METRIC_LABELS: Record<string, string> = {
  grossSales: "Gross Sales",
  netSales: "Net Sales",
  labour: "Labour",
  labourPercent: "Labour %",
  foodCost: "Food Cost",
  foodCostPercent: "Food Cost %",
};

interface Props {
  data: TrendData | null;
  metrics: string[];
  title?: string;
}

const AnalyticsTrendChart = ({
  data,
  metrics,
  title = "Revenue Trend",
}: Props) => {
  if (!data?.total?.series?.length) {
    return (
      <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
        <h3 className="text-sm font-bold text-slate-800 mb-4">{title}</h3>
        <div className="flex items-center justify-center h-48 text-slate-400 text-sm">
          No trend data available
        </div>
      </div>
    );
  }

  const labels = data.total.series.map((p) => p.label);

  const datasets = metrics.map((metric, i) => {
    const color = COLORS[i % COLORS.length];
    const series =
      data.group_by === "shop" && data.shops?.length
        ? data.shops[0].series
        : data.total.series;

    return {
      label: METRIC_LABELS[metric] ?? metric,
      data: series.map((p) => p[metric] ?? 0),
      borderColor: color.border,
      backgroundColor: color.bg,
      borderWidth: 2,
      tension: 0.4,
      fill: metrics.length === 1,
      pointRadius: 0,
      pointHoverRadius: 4,
    };
  });

  const chartData = { labels, datasets };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: { mode: "index" as const, intersect: false },
    plugins: {
      legend: {
        display: datasets.length > 1,
        position: "top" as const,
        labels: { boxWidth: 12, font: { size: 11 } },
      },
      tooltip: {
        callbacks: {
          label: (ctx: any) => {
            const val = ctx.parsed.y;
            const metric = metrics[ctx.datasetIndex];
            const isPct = metric?.endsWith("Percent") || metric?.endsWith("Pct");
            return ` ${ctx.dataset.label}: ${isPct ? val.toFixed(1) + "%" : "£" + new Intl.NumberFormat("en-GB").format(val)}`;
          },
        },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: "#94a3b8", font: { size: 10 }, maxRotation: 45 },
      },
      y: {
        border: { display: false },
        grid: { color: "#f1f5f9" },
        ticks: {
          color: "#94a3b8",
          font: { size: 10 },
          callback: (val: any) =>
            metrics[0]?.endsWith("Percent")
              ? val.toFixed(1) + "%"
              : "£" + new Intl.NumberFormat("en-GB").format(val),
        },
      },
    },
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
      <h3 className="text-sm font-bold text-slate-800 mb-4">{title}</h3>
      <div style={{ height: "220px" }}>
        <Line data={chartData} options={options} />
      </div>
    </div>
  );
};

export default AnalyticsTrendChart;
