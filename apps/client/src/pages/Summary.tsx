import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";
import s from "../styles/shared.module.css";

type SummaryType = {
  perFuelType: SummaryRow[];
  totals: {
    totalLitresSold: number;
    totalRevenue: number;
  };
};

interface SummaryRow {
  fuelProductId: number;
  fuelProductName: string;
  fuelType: string;
  openingStock: string;
  totalLitresSold: number;
  closingStock: number;
  totalRevenue: number;
}

export default function Summary() {
  useEffect(() => {
    document.title = "Daily Summary / FlowStation";
  }, []);
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [rows, setRows] = useState<SummaryRow[]>([]);
  const [summary, setSummary] = useState<SummaryType | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function load(d: string, signal?: AbortSignal) {
    setLoading(true);
    setError("");
    apiFetch<SummaryType>(`/api/summaries?date=${d}`)
      .then((data) => {
        if (!signal?.aborted) {
          setRows(data.perFuelType);
          setSummary(data);
        }
      })
      .catch((e) => {
        if (!signal?.aborted) setError(e.message);
      })
      .finally(() => {
        if (!signal?.aborted) setLoading(false);
      });
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const ctrl = new AbortController();
    load(today, ctrl.signal);
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  return (
    <div>
      <div className={s.header}>
        <h1>Daily Sales Summary</h1>
        <p>Auto-generated daily totals per fuel product</p>
      </div>

      {/* Date picker */}
      <div className={s.card}>
        <h2>Select Date</h2>
        <div className={s.formGrid}>
          <div className={s.formGroup}>
            <label>Date</label>
            <input
              type='date'
              value={date}
              max={today}
              onChange={(e) => {
                setDate(e.target.value);
                load(e.target.value);
              }}
            />
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className={s.kpiGrid}>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Total Revenue</div>
          <div className={s.kpiValue}>
            &#8358; {summary?.totals?.totalRevenue.toLocaleString()}
          </div>
          <div className={s.kpiSub}>{date}</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Total Litres Sold</div>
          <div className={s.kpiValue}>
            {summary?.totals?.totalLitresSold.toLocaleString()} L
          </div>
          <div className={s.kpiSub}>
            {rows.length} product{rows.length !== 1 ? "s" : ""}
          </div>
        </div>
      </div>

      {error && (
        <p className={s.loginError} style={{ marginBottom: 12 }}>
          {error}
        </p>
      )}

      {/* Breakdown table */}
      <div className={s.card}>
        <h2>Breakdown by Fuel Product</h2>
        {loading ? (
          <div className={s.empty}>
            <p>Loading...</p>
          </div>
        ) : rows.length === 0 ? (
          <div className={s.empty}>
            <p>No sales recorded for {date}.</p>
          </div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr>
                <th>Product</th>
                <th>Type</th>
                <th>Litres Sold</th>
                <th>Revenue</th>
                <th>Opening Stock</th>
                <th>Closing Stock</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.fuelProductId}>
                  <td>{r.fuelProductName}</td>
                  <td>
                    <span
                      className={`${s.badge} ${s["badge" + r.fuelType] ?? s.badgeInfo}`}
                    >
                      {r.fuelType}
                    </span>
                  </td>
                  <td>{r.totalLitresSold.toLocaleString()} L</td>
                  <td>&#8358;{r.totalRevenue.toLocaleString()}</td>
                  <td>{r.openingStock.toLocaleString()} L</td>
                  <td>{r.closingStock.toLocaleString()} L</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Revenue bar chart (pure CSS) */}
      {rows.length > 0 && summary?.totals && (
        <div className={s.card}>
          <h2>Revenue by Product</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {rows.map((r) => {
              const pct =
                summary?.totals?.totalRevenue > 0
                  ? (r.totalRevenue / summary?.totals?.totalRevenue) * 100
                  : 0;
              return (
                <div key={r.fuelProductId}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 12,
                      color: "var(--text-secondary)",
                      marginBottom: 4,
                    }}
                  >
                    <span>{r.fuelProductName}</span>
                    <span>
                      &#8358;{r.totalRevenue.toLocaleString()} ({pct.toFixed(1)}
                      %)
                    </span>
                  </div>
                  <div className={s.bar}>
                    <div className={s.barFill} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
