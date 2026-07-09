import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";
import s from "../styles/shared.module.css";
import type { DailySummary } from "../types";
import { groupSummariesByFuelType } from "../utils/groupSummaryData";
import type { GroupedFuelSummary } from "../utils/groupSummaryData";

// attendantPerformance: { fullName: string; employeeId: string; salesCount: number; totalRevenue: number; totalLitres: number }[];

export default function Reports() {
  useEffect(() => {
    document.title = "Reports / FlowStation";
  }, []);
  const [tab, setTab] = useState<"summary" | "charts">("summary");
  const [data, setData] = useState<DailySummary[] | []>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [grouped, setGrouped] = useState<GroupedFuelSummary[]>([]);

  useEffect(() => {
    apiFetch<DailySummary[]>("/api/summaries/history")
      .then((data) => {
        setData(data);
        setGrouped(groupSummariesByFuelType(data));
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  // const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const handleGenerateSummary = async () => {
    try {
      const today = new Date().toISOString();
      const res = await apiFetch<{ message: "" }>("/api/summaries/generate", {
        method: "POST",
        body: JSON.stringify({ today }),
      });

      setMessage(res.message);
      setTimeout(() => setMessage(""), 5000);
    } catch (error) {
      console.error(error);
    }
  };
  return (
    <div>
      <div className={s.topBar}>
        {message && (
          <div
            className={s.card}
            style={{
              background: "#0d2817",
              border: "1px solid var(--accent)",
              marginBottom: 12,
            }}
          >
            <p
              style={{ color: "#3ecf8e" }}
              dangerouslySetInnerHTML={{ __html: message }}
            />
          </div>
        )}
        <div
          className={s.header}
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <div>
            <h1>Reports</h1>
            <p>Revenue trends and performance analytics</p>
          </div>
          <button
            className={`${s.btn} ${s.btnPrimary}`}
            style={{ fontSize: 16, height: 45 }}
            onClick={handleGenerateSummary}
          >
            Generate Daily Summary
          </button>
        </div>
        <div className={s.tabs}>
          <button
            className={`${s.tab} ${tab === "summary" ? s.tabActive : ""}`}
            onClick={() => setTab("summary")}
          >
            Daily History
          </button>
          <button
            className={`${s.tab} ${tab === "charts" ? s.tabActive : ""}`}
            onClick={() => setTab("charts")}
          >
            Charts
          </button>
        </div>
      </div>

      {error && (
        <p className={s.loginError} style={{ marginBottom: 12 }}>
          {error}
        </p>
      )}

      {/* KPI row */}

      {/* Tab: Summary — Attendant performance table */}
      {tab === "summary" && (
        <>
          {/* <div className={s.card}>
            <h2>Attendant Performance</h2>
            {loading ? (
              <div className={s.empty}>
                <p>Loading...</p>
              </div>
            ) : !data || data.attendantPerformance.length === 0 ? (
              <div className={s.empty}>
                <p>
                  No sales recorded yet. Attendant performance will appear here
                  once transactions are logged.
                </p>
              </div>
            ) : (
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Attendant</th>
                    <th>Employee ID</th>
                    <th>Sales</th>
                    <th>Litres</th>
                    <th>Revenue</th>
                  </tr>
                </thead>
                <tbody>
                  {data.attendantPerformance
                    .slice()
                    .sort((a, b) => b.totalRevenue - a.totalRevenue)
                    .map((a) => (
                      <tr key={a.employeeId}>
                        <td>{a.fullName}</td>
                        <td>{a.employeeId}</td>
                        <td>{a.salesCount}</td>
                        <td>{a.totalLitres.toLocaleString()} L</td>
                        <td>&#8358;{a.totalRevenue.toLocaleString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            )}
          </div> */}
          <div className={s.card}>
            <h2>Summary History</h2>
            {loading ? (
              <div className={s.empty}>
                <p>Loading...</p>
              </div>
            ) : data?.length === 0 ? (
              <div className={s.empty}>
                <p>No History recorded yet.</p>
              </div>
            ) : (
              <table className={s.table}>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product Name</th>
                    <th>Product Type</th>
                    <th>Total Revenue</th>
                    <th>Total Litres</th>
                    <th>Opening Stock</th>
                    <th>Closing Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((summary) => (
                    <tr key={summary.id}>
                      <td>
                        {new Date(summary.summaryDate).toLocaleDateString(
                          "en-GB",
                        )}
                      </td>
                      <td>{summary.fuelProduct?.name}</td>
                      <td>
                        <span
                          className={`${s.badge} ${s["badge" + summary.fuelProduct?.type] ?? s.badgeInfo}`}
                        >
                          {summary.fuelProduct?.type}
                        </span>
                      </td>
                      <td>&#8358;{summary.totalRevenue.toLocaleString()}</td>
                      <td>{summary.totalLitresSold}</td>
                      <td>{summary.openingStock}</td>
                      <td>{summary.closingStock}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {/* Tab: Charts — revenue-by-day SVG bar chart */}
      {tab === "charts" && (
        <div className={s.card}>
          <h2>Revenue by Fuel Product</h2>
          {loading ? (
            <div className={s.empty}>
              <p>Loading...</p>
            </div>
          ) : !grouped || grouped.length === 0 ? (
            <div className={s.empty}>
              <p>No data yet.</p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {grouped.map((r) => {
                const maxRev = Math.max(...grouped.map((x) => x.totalRevenue));
                const pct = maxRev > 0 ? (r.totalRevenue / maxRev) * 100 : 0;
                return (
                  <div key={r.fuelProductName}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        fontSize: 12,
                        color: "var(--text-secondary)",
                        marginBottom: 10,
                      }}
                    >
                      <span>
                        {r.fuelProductName}{" "}
                        <span
                          className={`${s.badge} ${s["badge" + r.fuelType] ?? s.badgeInfo}`}
                          style={{ marginLeft: 6 }}
                        >
                          {r.fuelType}
                        </span>
                      </span>
                      <span>
                        &#8358;{r.totalRevenue.toLocaleString()} &middot;{" "}
                        {r.totalLitresSold.toLocaleString()} L
                      </span>
                    </div>
                    <div className={s.bar}>
                      <div className={s.barFill} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
