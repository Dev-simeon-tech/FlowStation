import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import s from '../styles/shared.module.css';

interface SummaryRow {
  fuelProductId: number;
  fuelProduct: { name: string; type: string };
  totalLitresSold: number;
  totalRevenue: number;
  openingStock: number;
  closingStock: number;
}

export default function Summary() {
  useEffect(() => { document.title = 'Daily Summary / FlowStation'; }, []);
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [rows, setRows] = useState<SummaryRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  function load(d: string, signal?: AbortSignal) {
    setLoading(true);
    setError('');
    apiFetch<SummaryRow[]>(`/api/summary?date=${d}`)
      .then(data => { if (!signal?.aborted) setRows(data); })
      .catch(e => { if (!signal?.aborted) setError(e.message); })
      .finally(() => { if (!signal?.aborted) setLoading(false); });
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const ctrl = new AbortController();
    load(today, ctrl.signal);
    return () => ctrl.abort();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  const totalRevenue = rows.reduce((sum, r) => sum + r.totalRevenue, 0);
  const totalLitres = rows.reduce((sum, r) => sum + r.totalLitresSold, 0);

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
              type="date"
              value={date}
              max={today}
              onChange={e => { setDate(e.target.value); load(e.target.value); }}
            />
          </div>
        </div>
      </div>

      {/* KPI strip */}
      <div className={s.kpiGrid}>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Total Revenue</div>
          <div className={s.kpiValue}>&#8358;{totalRevenue.toLocaleString()}</div>
          <div className={s.kpiSub}>{date}</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Total Litres Sold</div>
          <div className={s.kpiValue}>{totalLitres.toLocaleString()} L</div>
          <div className={s.kpiSub}>{rows.length} product{rows.length !== 1 ? 's' : ''}</div>
        </div>
      </div>

      {error && <p className={s.loginError} style={{ marginBottom: 12 }}>{error}</p>}

      {/* Breakdown table */}
      <div className={s.card}>
        <h2>Breakdown by Fuel Product</h2>
        {loading ? (
          <div className={s.empty}><p>Loading...</p></div>
        ) : rows.length === 0 ? (
          <div className={s.empty}><p>No sales recorded for {date}.</p></div>
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
              {rows.map(r => (
                <tr key={r.fuelProductId}>
                  <td>{r.fuelProduct.name}</td>
                  <td><span className={`${s.badge} ${s['badge' + r.fuelProduct.type] ?? s.badgeInfo}`}>{r.fuelProduct.type}</span></td>
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
      {rows.length > 0 && (
        <div className={s.card}>
          <h2>Revenue by Product</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {rows.map(r => {
              const pct = totalRevenue > 0 ? (r.totalRevenue / totalRevenue) * 100 : 0;
              return (
                <div key={r.fuelProductId}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: 'var(--text-secondary)', marginBottom: 4 }}>
                    <span>{r.fuelProduct.name}</span>
                    <span>&#8358;{r.totalRevenue.toLocaleString()} ({pct.toFixed(1)}%)</span>
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
