import { useState, useEffect } from "react";
import { apiFetch } from "../lib/api";
import type { DailySummary } from "@flowstation/types";
import { groupSummariesByFuelType } from "../utils/groupSummaryData";
import type { GroupedFuelSummary } from "../utils/groupSummaryData";

export default function Reports() {
  useEffect(() => {
    document.title = "Reports / FlowStation";
  }, []);
  const [tab, setTab] = useState<"summary" | "charts">("summary");
  const [data, setData] = useState<DailySummary[] | []>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  return (
    <div>
      <div className='topBar'>
        <div
          className='header'
          style={{ display: "flex", justifyContent: "space-between" }}
        >
          <div>
            <h1>Reports</h1>
            <p>Revenue trends and performance analytics</p>
          </div>
        </div>
        <div className='tabs'>
          <button
            className={`tab ${tab === "summary" ? "tabActive" : ""}`}
            onClick={() => setTab("summary")}
          >
            Daily History
          </button>
          <button
            className={`tab ${tab === "charts" ? "tabActive" : ""}`}
            onClick={() => setTab("charts")}
          >
            Charts
          </button>
        </div>
      </div>

      {error && (
        <p className='loginError' style={{ marginBottom: 12 }}>
          {error}
        </p>
      )}

      {/* KPI row */}

      {/* Tab: Summary — Attendant performance table */}
      {tab === "summary" && (
        <>
          {/* <div className="card">
            <h2>Attendant Performance</h2>
            {loading ? (
              <div className="empty">
                <p>Loading...</p>
              </div>
            ) : !data || data.attendantPerformance.length === 0 ? (
              <div className="empty">
                <p>
                  No sales recorded yet. Attendant performance will appear here
                  once transactions are logged.
                </p>
              </div>
            ) : (
              <table className="table">
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
          <div className='card'>
            <h2>Summary History</h2>
            {loading ? (
              <div className='empty'>
                <p>Loading...</p>
              </div>
            ) : data?.length === 0 ? (
              <div className='empty'>
                <p>No History recorded yet.</p>
              </div>
            ) : (
              <table className='table'>
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
                          className={`badge ${["PETROL", "DIESEL", "KEROSENE"].includes(summary.fuelProduct?.type) ? `badge${summary.fuelProduct?.type}` : "badgeInfo"}`}
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
        <div className='card'>
          <h2>Revenue by Fuel Product</h2>
          {loading ? (
            <div className='empty'>
              <p>Loading...</p>
            </div>
          ) : !grouped || grouped.length === 0 ? (
            <div className='empty'>
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
                          className={`badge ${["PETROL", "DIESEL", "KEROSENE"].includes(r.fuelType) ? `badge${r.fuelType}` : "badgeInfo"}`}
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
                    <div className='bar'>
                      <div className='barFill' style={{ width: `${pct}%` }} />
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
