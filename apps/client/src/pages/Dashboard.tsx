import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";
import s from "../styles/shared.module.css";
import type { DailyRevenueBar, Summary } from "../utils/getLast7DaysRevenue";
import { getLast7DaysRevenue } from "../utils/getLast7DaysRevenue";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

type perFuelPropType = {
  fuelType: string;
  openingStock: string;
  totalLitresSold: number;
};

interface DashboardKPIs {
  perFuelType: perFuelPropType[];
  totals: {
    numberOfSales: number;
    totalLitresSold: number;
    totalRevenue: number;
  };
}
type TooltipBreakdownItem = {
  fuelType: string;
  fuelName: string;
  revenue: number;
};

type TooltipPayloadItem = {
  value?: number;
  payload?: {
    breakdown?: TooltipBreakdownItem[];
  };
};

type CustomTooltipProps = {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
};

export default function Dashboard() {
  useEffect(() => {
    document.title = "dashboard";
  }, []);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [chartData, setChartData] = useState<DailyRevenueBar[]>([]);

  useEffect(() => {
    apiFetch<Summary[]>("/api/summaries/history")
      .then((data) => setChartData(getLast7DaysRevenue(data)))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const today = new Date().toISOString();
    apiFetch<DashboardKPIs>(`/api/summaries?date=${today}`)
      .then(setKpis)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) =>
    n.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  return (
    <div>
      <div className={s.header}>
        <h1>Dashboard</h1>
        <p>
          Overview of station operations -{" "}
          {new Date().toLocaleDateString("en-NG", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {error && (
        <p className={s.loginError} style={{ marginBottom: 16 }}>
          {error}
        </p>
      )}

      <div className={s.kpiGrid}>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Today&apos;s Revenue</div>
          <div className={s.kpiValue}>
            {loading ? "..." : `₦ ${fmt(kpis?.totals.totalRevenue ?? 0)}`}
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Litres Sold Today</div>
          <div className={s.kpiValue}>
            {loading
              ? "..."
              : `${(kpis?.totals.totalLitresSold ?? 0).toLocaleString()} L`}
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Fuel Products</div>
          <div className={s.kpiValue}>
            {loading ? "..." : (kpis?.perFuelType.length ?? 0)}
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Number of Sales</div>
          <div className={s.kpiValue}>
            {loading ? "..." : (kpis?.totals.numberOfSales ?? 0)}
          </div>
        </div>
      </div>

      <div className={s.card}>
        <h2>Revenue Overview</h2>
        {chartData.length === 0 ? (
          <div className={s.empty}>
            <p>No revenue data available for the last 7 days.</p>
          </div>
        ) : (
          <ResponsiveContainer
            style={{
              outline: "0",
            }}
            width='100%'
            height={320}
          >
            <BarChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 10, bottom: 5 }}
              barCategoryGap={"20%"}
            >
              <XAxis dataKey='date' tick={{ fontSize: 13 }} />
              <YAxis
                tickFormatter={(v: number) => `₦${(v / 1000).toFixed(0)}k`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar
                dataKey='totalRevenue'
                barSize={45}
                fill='#5C4BC2'
                radius={[6, 6, 0, 0]}
                background={false}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (!active || !payload?.length) return null;
  const breakdown = payload[0]?.payload?.breakdown ?? [];
  return (
    <div
      style={{
        background: "white",
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        padding: "10px 14px",
      }}
    >
      <p style={{ fontWeight: "bold", marginBottom: 6 }}>{label}</p>
      {breakdown.map((b) => (
        <p key={b.fuelType} style={{ fontSize: 13, color: "#555" }}>
          {b.fuelName}: ₦{b.revenue.toLocaleString()}
        </p>
      ))}
      <p
        style={{
          fontWeight: "bold",
          marginTop: 6,
          borderTop: "1px solid #eee",
          paddingTop: 6,
          color: "black",
        }}
      >
        Total: ₦{payload[0].value?.toLocaleString()}
      </p>
    </div>
  );
};
