import {
  ArcElement,
  BarElement,
  CategoryScale,
  Chart as ChartJS,
  Filler,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  Title,
  Tooltip,
} from "chart.js";
import { Calendar, CircleHelp, ExternalLink } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Bar, Doughnut, Line } from "react-chartjs-2";
import api from "../../../config/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
);

type ComparisonNode = {
  current: number;
  previous: number;
  change: number;
  changePct: number;
};

type CompareModes = {
  revenue: ComparisonNode;
  profit: ComparisonNode;
  orders: ComparisonNode;
  averageOrderValue: ComparisonNode;
  channels: {
    justeat: ComparisonNode;
    ubereat: ComparisonNode;
    deliveroo: ComparisonNode;
    instore: ComparisonNode;
  };
};

type APIPayload = {
  report_type: string;
  view: string;
  compare: string;
  kpis: {
    revenue: number;
    profit: number;
    orders: number;
    averageOrderValue: number;
    channels: {
      justeat: number;
      ubereat: number;
      deliveroo: number;
      thirdParty: number;
      instore: number;
    };
  };
  comparisons: {
    wow?: CompareModes;
    yoy?: CompareModes;
  };
  charts: {
    growth: {
      current: any[];
      wow?: any[];
      yoy?: any[];
    };
    revenueByStore: any[];
    revenueByChannel: any;
    channelTotals: any;
  };
};

const formatNumber = (val: number) =>
  new Intl.NumberFormat("en-GB").format(val || 0);

const KpiCard = ({
  title,
  current,
  comparisonLabel,
  comparisonValue,
  changePct,
  prefix = "",
}: {
  title: string;
  current: number | string;
  comparisonLabel: string;
  comparisonValue: number | string;
  changePct: number;
  prefix?: string;
}) => {
  const isPositive = changePct >= 0;
  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm flex flex-col justify-between flex-1">
      <div className="flex items-center gap-1.5 mb-2 text-sm text-slate-600 font-medium tracking-tight">
        {prefix === "£" ? (
          <span className="text-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="4" width="20" height="16" rx="2" />
              <path d="M7 15h0M2 9.5h20" />
            </svg>
          </span>
        ) : (
          <span className="text-slate-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="6" width="20" height="12" rx="2" />
              <circle cx="12" cy="12" r="2" />
              <path d="M6 12h.01M18 12h.01" />
            </svg>
          </span>
        )}
        <span>{title}</span>
        <CircleHelp size={12} className="text-slate-300 ml-1" />
      </div>

      <div className="flex items-end gap-3 mb-1">
        <h3 className="text-[28px] font-bold text-slate-800 leading-none">
          {prefix}
          {current}
        </h3>
        <span
          className={`flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-md mb-1 ${
            isPositive
              ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
              : "bg-danger-50 text-danger-600 border border-danger-100"
          }`}
        >
          {isPositive ? "↑" : "↓"} {Math.abs(changePct)}%
        </span>
      </div>

      <div className="text-xs text-slate-400 font-medium">
        {comparisonLabel} : {prefix}
        {comparisonValue}{" "}
        <CircleHelp size={10} className="inline ml-0.5 opacity-50" />
      </div>
    </div>
  );
};

// Custom SVG Chart implementation drawing smooth curves
const SmoothLineChart = ({
  growthData,
}: {
  growthData: { current?: any[]; wow?: any[]; yoy?: any[] };
}) => {
  const chartData = useMemo(() => {
    if (!growthData?.current?.length) return;

    const labels = growthData.current?.map(
      (d: any) => d.label || d.periodKey || "",
    );

    const datasets: any[] = [
      {
        label: "Current",
        data: growthData.current?.map((d: any) => d.revenue ?? d),
        borderColor: "#1e293b",
        backgroundColor: "transparent",
        borderWidth: 2.5,
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      },
    ];

    if (growthData.wow?.length) {
      datasets.push({
        label: "PoP / WoW",
        data: growthData.wow.map((d: any) => d.revenue ?? d),
        borderColor: "#cbd5e1",
        backgroundColor: "transparent",
        borderWidth: 2,
        borderDash: [4, 4],
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      });
    }

    if (growthData.yoy?.length) {
      datasets.push({
        label: "YoY",
        data: growthData.yoy.map((d: any) => d.revenue ?? d),
        borderColor: "#94a3b8",
        backgroundColor: "transparent",
        borderWidth: 2,
        borderDash: [2, 2],
        tension: 0.4,
        pointRadius: 0,
        pointHoverRadius: 4,
      });
    }

    const chartData = {
      labels,
      datasets,
    };

    return chartData;
  }, [growthData]);

  if (!growthData?.current?.length)
    return (
      <div className="text-slate-400 text-sm py-10 text-center">
        No data available
      </div>
    );

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        mode: "index" as const,
        intersect: false,
      },
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: true,
        border: { display: false },
        grid: {
          color: "#f1f5f9",
        },
        ticks: {
          color: "#94a3b8",
          font: {
            size: 10,
          },
          callback: function (value: any) {
            return "£" + new Intl.NumberFormat("en-GB").format(value);
          },
        },
      },
    },
  };

  return (
    <div className="relative w-full mt-6" style={{ height: "200px" }}>
      {chartData && <Line data={chartData} options={options} />}
    </div>
  );
};

const RevenueByStoreChart = ({ data }: { data: any[] }) => {
  const chartData = useMemo(() => {
    if (!data?.length) return null;
    return {
      labels: data.map((d) => d.shopName),
      datasets: [
        {
          label: "Revenue",
          data: data.map((d) => d.revenue),
          backgroundColor: "#3b82f6",
          borderRadius: 4,
        },
      ],
    };
  }, [data]);

  if (!chartData)
    return (
      <div className="text-slate-400 text-sm py-10 text-center">
        No data available
      </div>
    );

  return (
    <div className="relative w-full mt-4 flex-1" style={{ minHeight: "250px" }}>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: {
              ticks: {
                callback: (val: any) =>
                  "£" + new Intl.NumberFormat("en-GB").format(val),
              },
              grid: { color: "#f1f5f9" },
            },
            x: { grid: { display: false } },
          },
        }}
      />
    </div>
  );
};

const RevenueByChannelChart = ({ data }: { data: any }) => {
  const chartData = useMemo(() => {
    if (!data || Object.keys(data).length === 0) return null;
    const mappedKeys = ["instore", "justeat", "ubereat", "deliveroo"];
    const labels = ["In Store", "Just Eat", "Uber Eats", "Deliveroo"];
    const colors = ["#10b981", "#f97316", "#14b8a6", "#0ea5e9"];

    return {
      labels,
      datasets: [
        {
          data: mappedKeys.map((k) => data[k] || 0),
          backgroundColor: colors,
          borderWidth: 0,
        },
      ],
    };
  }, [data]);

  if (!chartData)
    return (
      <div className="text-slate-400 text-sm py-10 text-center">
        No data available
      </div>
    );

  return (
    <div className="relative w-full mt-4 flex-1" style={{ minHeight: "250px" }}>
      <Doughnut
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { position: "right" as const } },
        }}
      />
    </div>
  );
};

const ChannelTotalsGroupChart = ({
  data,
  compareMode,
}: {
  data: any;
  compareMode: string;
}) => {
  const chartData = useMemo(() => {
    if (!data?.current) return null;
    const mappedKeys = ["instore", "justeat", "ubereat", "deliveroo"];
    const labels = ["In Store", "Just Eat", "Uber Eats", "Deliveroo"];

    const datasets: any[] = [
      {
        label: "Current",
        data: mappedKeys.map((k) => data.current[k] || 0),
        backgroundColor: "#1e293b",
        borderRadius: 4,
      },
    ];

    if (data[compareMode]) {
      datasets.push({
        label: compareMode === "yoy" ? "YoY" : "WoW / PoP",
        data: mappedKeys.map((k) =>
          data[compareMode] && data[compareMode][k] ? data[compareMode][k] : 0,
        ),
        backgroundColor: "#cbd5e1",
        borderRadius: 4,
      });
    }

    return { labels, datasets };
  }, [data, compareMode]);

  if (!chartData)
    return (
      <div className="text-slate-400 text-sm py-10 text-center">
        No data available
      </div>
    );

  return (
    <div className="relative w-full mt-4 flex-1" style={{ minHeight: "250px" }}>
      <Bar
        data={chartData}
        options={{
          responsive: true,
          maintainAspectRatio: false,
          scales: {
            y: {
              ticks: {
                callback: (val: any) =>
                  "£" + new Intl.NumberFormat("en-GB").format(val),
              },
              grid: { color: "#f1f5f9" },
            },
            x: { grid: { display: false } },
          },
        }}
      />
    </div>
  );
};

const AnalyticsDashboard = () => {
  const [data, setData] = useState<APIPayload | null>(null);
  console.log("🚀 - AnalyticsDashboard - data:", data);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [datePreset, setDatePreset] = useState("Last Week");
  const [comparePreset, setComparePreset] = useState("The week before");
  const [compareType, setCompareType] = useState("both");
  const [channel, setChannel] = useState("");

  const formatD = (d: Date) => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const dd = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${dd}`;
  };

  const [customFrom, setCustomFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return formatD(d);
  });
  const [customTo, setCustomTo] = useState(() => formatD(new Date()));

  const [customWowFrom, setCustomWowFrom] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 14);
    return formatD(d);
  });
  const [customWowTo, setCustomWowTo] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return formatD(d);
  });

  const getComputedDates = () => {
    let from = customFrom;
    let to = customTo;

    if (datePreset !== "Custom") {
      const end = new Date();
      const start = new Date();
      if (datePreset === "Last Week") start.setDate(start.getDate() - 7);
      if (datePreset === "Last Month") start.setMonth(start.getMonth() - 1);
      if (datePreset === "Last Year")
        start.setFullYear(start.getFullYear() - 1);
      from = formatD(start);
      to = formatD(end);
    }

    let wow_from = customWowFrom;
    let wow_to = customWowTo;

    if (comparePreset !== "Custom") {
      const wStart = new Date(from);
      const wEnd = new Date(to);
      if (comparePreset === "The week before") {
        wStart.setDate(wStart.getDate() - 7);
        wEnd.setDate(wEnd.getDate() - 7);
      }
      if (comparePreset === "The Month Before") {
        wStart.setMonth(wStart.getMonth() - 1);
        wEnd.setMonth(wEnd.getMonth() - 1);
      }
      if (comparePreset === "The Year Before") {
        wStart.setFullYear(wStart.getFullYear() - 1);
        wEnd.setFullYear(wEnd.getFullYear() - 1);
      }
      wow_from = formatD(wStart);
      wow_to = formatD(wEnd);
    }
    return { from, to, wow_from, wow_to };
  };

  const computedDates = getComputedDates();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get("/store-reports/analytics/dashboard", {
          params: {
            view: "reconciled",
            report_type: "weekly_financial",
            from: computedDates.from,
            to: computedDates.to,
            compare: compareType,
            wow_from: computedDates.wow_from,
            wow_to: computedDates.wow_to,
            channels: channel || undefined,
          },
        });
        setData(res.data.data);
      } catch (err: any) {
        console.error("Dashboard fetch error:", err);
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [
    computedDates.from,
    computedDates.to,
    computedDates.wow_from,
    computedDates.wow_to,
    compareType,
    channel,
  ]);

  return (
    <div className="flex-1 w-full max-w-7xl mx-auto space-y-4">
      {/* Top Header */}
      <div className="flex items-center gap-4 mb-2">
        <h1 className="text-xl font-bold text-slate-800">Dashboard</h1>
      </div>

      {/* Ribbon / Toolbar */}
      <div className="flex flex-col justify-between gap-4 py-2">
        <div className="flex items-center flex-wrap gap-3">
          {/* Main Date Selection */}
          <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-sm font-medium text-slate-700 shadow-sm focus-within:ring-2 focus-within:ring-primary-500 overflow-hidden hover:bg-slate-50 cursor-pointer">
            <Calendar size={14} className="text-slate-400 shrink-0" />
            <select
              value={datePreset}
              onChange={(e) => {
                const val = e.target.value;
                setDatePreset(val);
                if (val === "Last Week") setComparePreset("The week before");
                if (val === "Last Month") setComparePreset("The Month Before");
                if (val === "Last Year") setComparePreset("The Year Before");
                if (val === "Custom") setComparePreset("Custom");
              }}
              className="bg-transparent border-none p-0 pr-6 text-sm focus:ring-0 outline-none cursor-pointer max-w-[235px] text-ellipsis whitespace-nowrap text-slate-700"
            >
              <option value="Last Week">Last Week</option>
              <option value="Last Month">Last Month</option>
              <option value="Last Year">Last Year</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          {datePreset === "Custom" && (
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-2 py-1.5 rounded-full text-sm font-medium text-slate-700 shadow-sm focus-within:ring-2 focus-within:ring-primary-500 overflow-hidden text-slate-400">
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                className="bg-transparent border-none p-0 text-xs focus:ring-0 cursor-pointer w-[105px] outline-none text-slate-700 min-w-0"
                style={{ colorScheme: "light" }}
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                className="bg-transparent border-none p-0 text-xs focus:ring-0 cursor-pointer w-[105px] outline-none text-slate-700 min-w-0"
                style={{ colorScheme: "light" }}
              />
            </div>
          )}

          <span className="text-sm text-slate-400 px-1 truncate">
            compared to
          </span>

          {/* Compare Selection */}
          <div
            className={`flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm overflow-hidden ${datePreset !== "Custom" ? "opacity-60 bg-slate-50 cursor-not-allowed" : "focus-within:ring-2 focus-within:ring-primary-500 hover:bg-slate-50 cursor-pointer"}`}
          >
            <Calendar size={14} className="text-slate-400 shrink-0" />
            <select
              disabled={datePreset !== "Custom"}
              value={comparePreset}
              onChange={(e) => setComparePreset(e.target.value)}
              className="bg-transparent border-none p-0 pr-6 text-sm focus:ring-0 outline-none cursor-pointer text-slate-700 disabled:bg-transparent max-w-[235px] text-ellipsis whitespace-nowrap"
            >
              <option value="The week before">The week before</option>
              <option value="The Month Before">The Month Before</option>
              <option value="The Year Before">The Year Before</option>
              <option value="Custom">Custom</option>
            </select>
          </div>

          {comparePreset === "Custom" && datePreset === "Custom" && (
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-2 py-1.5 rounded-full text-sm font-medium text-slate-700 shadow-sm focus-within:ring-2 focus-within:ring-primary-500 overflow-hidden text-slate-400">
              <input
                type="date"
                value={customWowFrom}
                onChange={(e) => setCustomWowFrom(e.target.value)}
                className="bg-transparent border-none p-0 text-xs focus:ring-0 cursor-pointer w-[105px] outline-none text-slate-700 min-w-0"
                style={{ colorScheme: "light" }}
              />
              <span className="text-xs text-slate-400">to</span>
              <input
                type="date"
                value={customWowTo}
                onChange={(e) => setCustomWowTo(e.target.value)}
                className="bg-transparent border-none p-0 text-xs focus:ring-0 cursor-pointer w-[105px] outline-none text-slate-700 min-w-0"
                style={{ colorScheme: "light" }}
              />
            </div>
          )}
        </div>
        <div className="flex  justify-between">
          <div className="flex gap-2 items-center">
            {/* Compare Type (Both/Wow/Yoy) */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm hover:bg-slate-50 focus-within:ring-2 focus-within:ring-primary-500 overflow-hidden cursor-pointer">
              <select
                value={compareType}
                onChange={(e) => setCompareType(e.target.value)}
                className="bg-transparent border-none p-0 pr-6 text-sm focus:ring-0 outline-none cursor-pointer text-slate-700 min-w-0"
              >
                <option value="both">Both</option>
                <option value="wow">WoW</option>
                <option value="yoy">YoY</option>
              </select>
            </div>
            {/* All channels */}
            <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-sm font-medium shadow-sm hover:bg-slate-50 focus-within:ring-2 focus-within:ring-primary-500 overflow-hidden cursor-pointer">
              <select
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
                className="bg-transparent border-none p-0 pr-6 text-sm focus:ring-0 outline-none cursor-pointer text-slate-700 min-w-0"
              >
                <option value="">All channels</option>
                <option value="justeat">Just Eat</option>
                <option value="ubereat">Uber Eats</option>
                <option value="deliveroo">Deliveroo</option>
                <option value="offline">Offline / POS</option>
              </select>
            </div>

            {/* Point of sale */}
            {/* <div className="flex items-center gap-2 bg-white border border-slate-200 px-3 py-1.5 rounded-full text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 cursor-pointer">
            Point of sale
            <ChevronDown size={14} className="text-slate-400" />
          </div> */}
          </div>

          {/* View Switch */}
          <div className="flex items-center bg-white border border-slate-200 rounded-full p-0.5 shadow-sm self-start xl:self-auto">
            <button className="px-4 py-1.5 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold">
              Actual figures
            </button>
            <button className="px-4 py-1.5 rounded-full text-slate-500 hover:text-slate-700 text-sm font-medium transition-colors">
              Comparable average
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <div className="py-20 flex justify-center items-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 text-red-600 p-4 rounded-xl border border-red-200">
          <p className="font-bold">Error loading dashboard</p>
          <p className="text-sm mt-1">{error}</p>
        </div>
      )}

      {!loading && !error && data && (
        <>
          {(() => {
            const mode =
              compareType === "yoy" && data?.comparisons?.yoy ? "yoy" : "wow";
            const comp =
              data.comparisons[mode] ||
              data.comparisons?.wow ||
              data.comparisons?.yoy;
            const compLabel =
              mode === "yoy" ? "The year before" : comparePreset;
            if (!comp) return null;

            return (
              <>
                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                  <KpiCard
                    title="Revenue"
                    prefix="£"
                    current={formatNumber(comp.revenue.current)}
                    comparisonLabel={compLabel}
                    comparisonValue={formatNumber(comp.revenue.previous)}
                    changePct={comp.revenue.changePct}
                  />
                  <KpiCard
                    title="Profits"
                    prefix="£"
                    current={formatNumber(comp.profit.current)}
                    comparisonLabel={compLabel}
                    comparisonValue={formatNumber(comp.profit.previous)}
                    changePct={comp.profit.changePct}
                  />
                  <KpiCard
                    title="Orders"
                    current={formatNumber(comp.orders.current)}
                    comparisonLabel={compLabel}
                    comparisonValue={formatNumber(comp.orders.previous)}
                    changePct={comp.orders.changePct}
                  />
                  <KpiCard
                    title="Average order value"
                    prefix="£"
                    current={comp.averageOrderValue.current.toFixed(2)}
                    comparisonLabel={compLabel}
                    comparisonValue={comp.averageOrderValue.previous.toFixed(2)}
                    changePct={comp.averageOrderValue.changePct}
                  />
                </div>

                {/* Channel Performance Cards */}
                {(!!comp.channels?.justeat?.current ||
                  !!comp.channels?.ubereat?.current ||
                  !!comp.channels?.deliveroo?.current ||
                  !!comp.channels?.instore?.current) && (
                  <div className="mt-8">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 tracking-tight">
                      Channel Performance
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                      {!!comp.channels?.justeat?.current && (
                        <KpiCard
                          title="Just Eat"
                          prefix="£"
                          current={formatNumber(comp.channels.justeat.current)}
                          comparisonLabel={compLabel}
                          comparisonValue={formatNumber(
                            comp.channels.justeat.previous,
                          )}
                          changePct={comp.channels.justeat.changePct}
                        />
                      )}
                      {!!comp.channels?.ubereat?.current && (
                        <KpiCard
                          title="Uber Eats"
                          prefix="£"
                          current={formatNumber(comp.channels.ubereat.current)}
                          comparisonLabel={compLabel}
                          comparisonValue={formatNumber(
                            comp.channels.ubereat.previous,
                          )}
                          changePct={comp.channels.ubereat.changePct}
                        />
                      )}
                      {!!comp.channels?.deliveroo?.current && (
                        <KpiCard
                          title="Deliveroo"
                          prefix="£"
                          current={formatNumber(
                            comp.channels.deliveroo.current,
                          )}
                          comparisonLabel={compLabel}
                          comparisonValue={formatNumber(
                            comp.channels.deliveroo.previous,
                          )}
                          changePct={comp.channels.deliveroo.changePct}
                        />
                      )}
                      {!!comp.channels?.instore?.current && (
                        <KpiCard
                          title="In Store / POS"
                          prefix="£"
                          current={formatNumber(comp.channels.instore.current)}
                          comparisonLabel={compLabel}
                          comparisonValue={formatNumber(
                            comp.channels.instore.previous,
                          )}
                          changePct={comp.channels.instore.changePct}
                        />
                      )}
                    </div>
                  </div>
                )}
              </>
            );
          })()}

          {/* Growth Chart Panel */}
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm mt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-800">Growth</h3>
                <span className="text-slate-300">|</span>
                <span className="text-sm font-medium text-primary-600">
                  Revenue of the last week
                </span>
              </div>
              <button className="text-slate-400 hover:text-slate-600 p-1">
                <ExternalLink size={16} />
              </button>
            </div>

            <div className="pl-8 pb-4">
              <SmoothLineChart growthData={data.charts?.growth || {}} />
            </div>
            {data.charts?.growth?.current?.length === 0 && (
              <div className="text-center text-sm font-medium text-slate-400 mt-2">
                (Simulated chart structure due to empty API data points)
              </div>
            )}
          </div>

          {/* Detailed Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
              <h3 className="text-base font-bold text-slate-800">
                Revenue by Store
              </h3>
              <RevenueByStoreChart data={data.charts?.revenueByStore || []} />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm flex flex-col">
              <h3 className="text-base font-bold text-slate-800">
                Revenue by Channel (Current)
              </h3>
              <RevenueByChannelChart
                data={data.charts?.revenueByChannel || {}}
              />
            </div>

            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm lg:col-span-2 flex flex-col">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-800">
                  Channel Trend Overview
                </h3>
              </div>
              <ChannelTotalsGroupChart
                data={data.charts?.channelTotals || {}}
                compareMode={
                  compareType === "yoy" && data?.comparisons?.yoy
                    ? "yoy"
                    : "wow"
                }
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
