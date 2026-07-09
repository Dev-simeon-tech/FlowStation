import { useState, useEffect } from 'react';
import { apiFetch } from '../lib/api';
import s from '../styles/shared.module.css';

interface DashboardKPIs {
  todayRevenue: number;
  todaySalesCount: number;
  productCount: number;
  lowStockCount: number;
  topFuelType: string | null;
  totalLitresToday: number;
}

export default function Dashboard() {
  useEffect(() => { document.title = 'dashboard'; }, []);
  const [kpis, setKpis] = useState<DashboardKPIs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<DashboardKPIs>('/api/dashboard')
      .then(setKpis)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n: number) => n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  return (
    <div>
      <div className={s.header}>
        <h1>Dashboard</h1>
        <p>Overview of station operations - {new Date().toLocaleDateString('en-NG', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {error && <p className={s.loginError} style={{ marginBottom: 16 }}>{error}</p>}

      <div className={s.kpiGrid}>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Today&apos;s Revenue</div>
          <div className={s.kpiValue}>
            {loading ? '...' : `₦${fmt(kpis?.todayRevenue ?? 0)}`}
          </div>
          <div className={s.kpiSub}>
            {loading ? '' : kpis?.todaySalesCount === 0 ? 'No sales recorded today' : `${kpis?.todaySalesCount} transaction${kpis?.todaySalesCount !== 1 ? 's' : ''} today`}
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Litres Sold Today</div>
          <div className={s.kpiValue}>
            {loading ? '...' : `${(kpis?.totalLitresToday ?? 0).toLocaleString()} L`}
          </div>
          <div className={s.kpiSub}>
            {loading ? '' : kpis?.topFuelType ? `Top: ${kpis.topFuelType}` : 'No sales yet'}
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Fuel Products</div>
          <div className={s.kpiValue}>
            {loading ? '...' : kpis?.productCount ?? 0}
          </div>
          <div className={s.kpiSub}>
            {loading ? '' : kpis?.productCount === 0 ? 'No products set up' : 'active products'}
          </div>
        </div>

        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Low Stock Alerts</div>
          <div className={s.kpiValue} style={{ color: (kpis?.lowStockCount ?? 0) > 0 ? 'var(--danger)' : 'var(--text)' }}>
            {loading ? '...' : kpis?.lowStockCount ?? 0}
          </div>
          <div className={s.kpiSub}>
            {loading ? '' : (kpis?.lowStockCount ?? 0) === 0 ? 'All levels OK' : 'products running low'}
          </div>
        </div>
      </div>

      {!loading && kpis?.productCount === 0 && (
        <div className={s.empty}>
          <p>No data yet. Set up fuel products and start recording sales to populate the dashboard.</p>
        </div>
      )}
    </div>
  );
}
