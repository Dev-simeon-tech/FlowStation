import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import s from '../styles/shared.module.css';

interface ReportData {
  totalRevenue: number;
  totalLitresSold: number;
  totalTransactions: number;
  avgPerSale: number;
  revenueByProduct: { name: string; type: string; revenue: number; litres: number }[];
  revenueByDay: { date: string; revenue: number; petrol?: number; diesel?: number; kerosene?: number }[];
  attendantPerformance: { fullName: string; employeeId: string; salesCount: number; totalRevenue: number; totalLitres: number }[];
}

export default function Reports() {
  useEffect(() => { document.title = 'Reports / FlowStation'; }, []);
  const [tab, setTab] = useState<'summary' | 'charts'>('summary');
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<ReportData>('/api/reports')
      .then(setData)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div className={s.topBar}>
        <div className={s.header}>
          <h1>Reports</h1>
          <p>Revenue trends and performance analytics</p>
        </div>
        <div className={s.tabs}>
          <button className={`${s.tab} ${tab === 'summary' ? s.tabActive : ''}`} onClick={() => setTab('summary')}>Daily Summary</button>
          <button className={`${s.tab} ${tab === 'charts' ? s.tabActive : ''}`} onClick={() => setTab('charts')}>Charts</button>
        </div>
      </div>

      {error && <p className={s.loginError} style={{ marginBottom: 12 }}>{error}</p>}

      {/* KPI row */}
      <div className={s.kpiGrid}>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Total Revenue</div>
          <div className={s.kpiValue}>{loading ? '...' : `₦${fmt(data?.totalRevenue ?? 0)}`}</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Total Litres Sold</div>
          <div className={s.kpiValue}>{loading ? '...' : `${(data?.totalLitresSold ?? 0).toLocaleString()} L`}</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Total Transactions</div>
          <div className={s.kpiValue}>{loading ? '...' : (data?.totalTransactions ?? 0)}</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Avg. per Sale</div>
          <div className={s.kpiValue}>{loading ? '...' : `₦${fmt(data?.avgPerSale ?? 0)}`}</div>
        </div>
      </div>

      {/* Tab: Summary — Attendant performance table */}
      {tab === 'summary' && (
        <>
          <div className={s.card}>
            <h2>Attendant Performance</h2>
            {loading ? (
              <div className={s.empty}><p>Loading...</p></div>
            ) : !data || data.attendantPerformance.length === 0 ? (
              <div className={s.empty}><p>No sales recorded yet. Attendant performance will appear here once transactions are logged.</p></div>
            ) : (
              <table className={s.table}>
                <thead>
                  <tr><th>Attendant</th><th>Employee ID</th><th>Sales</th><th>Litres</th><th>Revenue</th></tr>
                </thead>
                <tbody>
                  {data.attendantPerformance
                    .slice()
                    .sort((a, b) => b.totalRevenue - a.totalRevenue)
                    .map(a => (
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
          </div>

          <div className={s.card}>
            <h2>Revenue by Fuel Product</h2>
            {loading ? (
              <div className={s.empty}><p>Loading...</p></div>
            ) : !data || data.revenueByProduct.length === 0 ? (
              <div className={s.empty}><p>No data yet.</p></div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {data.revenueByProduct.map(r => {
                  const maxRev = Math.max(...data.revenueByProduct.map(x => x.revenue));
                  const pct = maxRev > 0 ? (r.revenue / maxRev) * 100 : 0;
                  return (
                    <div key={r.name}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                        <span>{r.name} <span className={`${s.badge} ${s.badgeInfo}`} style={{ marginLeft: 6 }}>{r.type}</span></span>
                        <span>&#8358;{r.revenue.toLocaleString()} &middot; {r.litres.toLocaleString()} L</span>
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
        </>
      )}

      {/* Tab: Charts — revenue-by-day SVG bar chart */}
      {tab === 'charts' && (
        <div className={s.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
            <h2 style={{ margin: 0 }}>Revenue Trend (Last 30 Days)</h2>
            <div style={{ display: 'flex', gap: 16, fontSize: 11, color: 'var(--text-secondary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'rgba(129, 140, 248, 0.25)', border: '1.5px solid #818cf8' }} />
                <span>Petrol</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'rgba(167, 139, 250, 0.25)', border: '1.5px solid #a78bfa' }} />
                <span>Diesel</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: 'rgba(251, 146, 60, 0.25)', border: '1.5px solid #fb923c' }} />
                <span>Kerosene</span>
              </div>
            </div>
          </div>
          {loading ? (
            <div className={s.empty}><p>Loading...</p></div>
          ) : !data || data.revenueByDay.length === 0 ? (
            <div className={s.empty}><p>No data yet. Record sales to see charts.</p></div>
          ) : (
            <RevenueBarChart data={data.revenueByDay} />
          )}
        </div>
      )}
    </div>
  );
}

interface ChartSegment {
  y: number;
  height: number;
  stroke: string;
  fill: string;
}

/* ─── Pure-SVG stacked bar chart (Premium Design) ──────────────────────────── */
function RevenueBarChart({ data }: { data: { date: string; revenue: number; petrol?: number; diesel?: number; kerosene?: number }[] }) {
  const W = 700;
  const H = 240;
  const PAD = { top: 20, right: 16, bottom: 40, left: 64 };
  const chartW = W - PAD.left - PAD.right;
  const chartH = H - PAD.top - PAD.bottom;

  const maxRev = Math.max(...data.map(d => d.revenue), 1);
  const barW = Math.max(8, chartW / data.length - 4);

  const yTicks = 4;
  const yStep = maxRev / yTicks;

  return (
    <div style={{ overflowX: 'auto' }}>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', maxWidth: W, display: 'block', background: 'transparent' }}
        aria-label="Revenue bar chart"
      >
        {/* Y-axis grid + labels */}
        {Array.from({ length: yTicks + 1 }, (_, i) => {
          const val = yStep * i;
          const y = PAD.top + chartH - (val / maxRev) * chartH;
          return (
            <g key={i}>
              <line x1={PAD.left} x2={PAD.left + chartW} y1={y} y2={y} stroke="var(--border)" strokeWidth={1} />
              <text x={PAD.left - 12} y={y + 4} textAnchor="end" fontSize={9} fontFamily="inherit" fill="var(--text-secondary)">
                {val === 0 ? '₦0' : val >= 1000 ? `₦${(val / 1000).toFixed(0)}k` : `₦${val.toFixed(0)}`}
              </text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((d, i) => {
          const x = PAD.left + i * (chartW / data.length) + (chartW / data.length - barW) / 2;
          const label = d.date.slice(5).replace('-', '/'); // MM/DD
          
          const segments: ChartSegment[] = [];
          const hasBreakdown = d.petrol !== undefined || d.diesel !== undefined || d.kerosene !== undefined;

          if (hasBreakdown) {
            const p = d.petrol ?? 0;
            const ds = d.diesel ?? 0;
            const k = d.kerosene ?? 0;
            let currentY = PAD.top + chartH;

            // Petrol (Indigo)
            if (p > 0) {
              const h = (p / maxRev) * chartH;
              segments.push({
                y: currentY - h,
                height: Math.max(1, h - 2),
                stroke: '#818cf8',
                fill: 'rgba(129, 140, 248, 0.12)',
              });
              currentY -= h;
            }
            // Diesel (Purple)
            if (ds > 0) {
              const h = (ds / maxRev) * chartH;
              segments.push({
                y: currentY - h,
                height: Math.max(1, h - 2),
                stroke: '#a78bfa',
                fill: 'rgba(167, 139, 250, 0.12)',
              });
              currentY -= h;
            }
            // Kerosene (Orange)
            if (k > 0) {
              const h = (k / maxRev) * chartH;
              segments.push({
                y: currentY - h,
                height: Math.max(1, h - 2),
                stroke: '#fb923c',
                fill: 'rgba(251, 146, 60, 0.12)',
              });
            }
          } else {
            // Fallback: Default Single Bar (Indigo)
            const h = (d.revenue / maxRev) * chartH;
            segments.push({
              y: PAD.top + chartH - h,
              height: Math.max(1, h),
              stroke: '#818cf8',
              fill: 'rgba(129, 140, 248, 0.12)',
            });
          }

          return (
            <g key={d.date}>
              {segments.map((seg, idx) => (
                <rect
                  key={idx}
                  x={x}
                  y={seg.y}
                  width={barW}
                  height={seg.height}
                  rx={2}
                  fill={seg.fill}
                  stroke={seg.stroke}
                  strokeWidth={1.5}
                />
              ))}

              {/* x-axis label — show labels with clean intervals */}
              {(data.length <= 14 || i % Math.ceil(data.length / 10) === 0) && (
                <g transform={`translate(${x + barW / 2}, ${PAD.top + chartH + 16})`}>
                  <text
                    x={0}
                    y={0}
                    textAnchor="middle"
                    fontSize={9}
                    fontFamily="inherit"
                    fill="var(--text-secondary)"
                  >
                    {label}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
