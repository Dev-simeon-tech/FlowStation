import { useState, useEffect } from 'react';
import type { FuelStock, FuelProduct, Supplier } from '../types';
import NumberInput from '../components/NumberInput';
import { apiFetch } from '../lib/api';
import s from '../styles/shared.module.css';

interface StockBalance {
  fuelProductId: number;
  fuelProduct: FuelProduct;
  totalDelivered: number;
  totalSold: number;
  balance: number;
}

export default function Stock() {
  useEffect(() => { document.title = 'Stock / FlowStation'; }, []);
  const [tab, setTab] = useState<'balance' | 'entry'>('balance');
  const [stocks, setStocks] = useState<FuelStock[]>([]);
  const [balances, setBalances] = useState<StockBalance[]>([]);
  const [products, setProducts] = useState<FuelProduct[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [form, setForm] = useState({
    fuelProductId: '',
    supplierId: '',
    quantityLitres: '',
    costPerLitre: '',
    invoiceNumber: '',
    deliveryDate: new Date().toISOString().slice(0, 10),
  });

  function loadAll(signal?: AbortSignal) {
    setLoading(true);
    Promise.all([
      apiFetch<FuelProduct[]>('/api/products'),
      apiFetch<Supplier[]>('/api/suppliers'),
      apiFetch<{ entries: FuelStock[]; balances: StockBalance[] }>('/api/stock'),
    ])
      .then(([prods, sups, stockData]) => {
        if (signal?.aborted) return;
        setProducts(prods);
        setSuppliers(sups);
        setStocks(stockData.entries ?? []);
        setBalances(stockData.balances ?? []);
      })
      .catch(e => { if (!signal?.aborted) setError(e.message); })
      .finally(() => { if (!signal?.aborted) setLoading(false); });
  }

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const ctrl = new AbortController();
    loadAll(ctrl.signal);
    return () => ctrl.abort();
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  async function handleSubmit() {
    if (!form.fuelProductId || !form.supplierId || !form.quantityLitres || !form.costPerLitre) return;
    const qty = parseFloat(form.quantityLitres);
    const cost = parseFloat(form.costPerLitre);
    if (isNaN(qty) || qty <= 0 || isNaN(cost) || cost <= 0) return;
    setSubmitting(true);
    setError('');
    try {
      await apiFetch('/api/stock', {
        method: 'POST',
        body: JSON.stringify({
          fuelProductId: parseInt(form.fuelProductId),
          supplierId: parseInt(form.supplierId),
          quantityLitres: qty,
          costPerLitre: cost,
          invoiceNumber: form.invoiceNumber || undefined,
          deliveryDate: form.deliveryDate,
        }),
      });
      setMessage(`Stock entry recorded: ${qty.toLocaleString()}L`);
      setForm({ fuelProductId: '', supplierId: '', quantityLitres: '', costPerLitre: '', invoiceNumber: '', deliveryDate: new Date().toISOString().slice(0, 10) });
      setTimeout(() => setMessage(''), 4000);
      loadAll();
      setTab('balance');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to record delivery');
    } finally {
      setSubmitting(false);
    }
  }

  const totalStock = balances.reduce((sum, b) => sum + b.balance, 0);

  return (
    <div>
      <div className={s.topBar}>
        <div className={s.header}>
          <h1>Stock</h1>
          <p>Current levels and delivery records</p>
        </div>
        <div className={s.tabs}>
          <button className={`${s.tab} ${tab === 'balance' ? s.tabActive : ''}`} onClick={() => setTab('balance')}>Balance</button>
          <button className={`${s.tab} ${tab === 'entry' ? s.tabActive : ''}`} onClick={() => setTab('entry')}>Entry</button>
        </div>
      </div>

      <div className={s.kpiGrid}>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Current Stock</div>
          <div className={s.kpiValue}>{totalStock.toLocaleString()} L</div>
          <div className={s.kpiSub}>{balances.length} product{balances.length !== 1 ? 's' : ''}</div>
        </div>
        <div className={s.kpiCard}>
          <div className={s.kpiLabel}>Deliveries</div>
          <div className={s.kpiValue}>{stocks.length}</div>
          <div className={s.kpiSub}>total recorded</div>
        </div>
      </div>

      {message && (
        <div className={s.card} style={{ background: '#0d2817', border: '1px solid var(--accent)', marginBottom: 12 }}>
          <p style={{ color: '#3ecf8e' }}>{message}</p>
        </div>
      )}
      {error && <p className={s.loginError} style={{ marginBottom: 12 }}>{error}</p>}

      {tab === 'balance' && (
        <>
          <div className={s.card}>
            <h2>Current Balances</h2>
            {loading ? (
              <div className={s.empty}><p>Loading...</p></div>
            ) : balances.length === 0 ? (
              <div className={s.empty}><p>No stock on record. Record a delivery first.</p></div>
            ) : (
              <table className={s.table}>
                <thead>
                  <tr><th>Product</th><th>Type</th><th>Delivered (L)</th><th>Sold (L)</th><th>Balance (L)</th></tr>
                </thead>
                <tbody>
                  {balances.map(b => (
                    <tr key={b.fuelProductId}>
                      <td>{b.fuelProduct?.name ?? `ID ${b.fuelProductId}`}</td>
                      <td><span className={`${s.badge} ${s['badge' + b.fuelProduct?.type] ?? s.badgeInfo}`}>{b.fuelProduct?.type}</span></td>
                      <td>{b.totalDelivered.toLocaleString()}</td>
                      <td>{b.totalSold.toLocaleString()}</td>
                      <td><strong>{b.balance.toLocaleString()}</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          <div className={s.card}>
            <h2>Recent Deliveries</h2>
            {loading ? (
              <div className={s.empty}><p>Loading...</p></div>
            ) : stocks.length === 0 ? (
              <div className={s.empty}><p>No deliveries recorded yet.</p></div>
            ) : (
              <table className={s.table}>
                <thead>
                  <tr><th>Date</th><th>Product</th><th>Supplier</th><th>Quantity (L)</th><th>Cost/L</th><th>Total Cost</th><th>Invoice</th></tr>
                </thead>
                <tbody>
                  {stocks.map(r => (
                    <tr key={r.id}>
                      <td>{new Date(r.deliveryDate).toLocaleDateString()}</td>
                      <td>{r.fuelProduct?.name ?? `ID ${r.fuelProductId}`}</td>
                      <td>{r.supplier?.companyName ?? `ID ${r.supplierId}`}</td>
                      <td>{r.quantityLitres.toLocaleString()}</td>
                      <td>&#8358;{r.costPerLitre.toFixed(2)}</td>
                      <td>&#8358;{(r.quantityLitres * r.costPerLitre).toLocaleString()}</td>
                      <td>{r.invoiceNumber || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}

      {tab === 'entry' && (
        <div className={s.card}>
          <h2>New Delivery</h2>
          <div className={s.formGrid}>
            <div className={s.formGroup}>
              <label>Fuel Product</label>
              <select value={form.fuelProductId} onChange={e => setForm(f => ({ ...f, fuelProductId: e.target.value }))}>
                <option value="">Select product...</option>
                {products.map(p => <option key={p.id} value={p.id}>{p.name} ({p.type})</option>)}
              </select>
            </div>
            <div className={s.formGroup}>
              <label>Supplier</label>
              <select value={form.supplierId} onChange={e => setForm(f => ({ ...f, supplierId: e.target.value }))}>
                <option value="">Select supplier...</option>
                {suppliers.map(p => <option key={p.id} value={p.id}>{p.companyName}</option>)}
              </select>
            </div>
            <NumberInput label="Quantity (Litres)" step="0.01" min="0" placeholder="0" value={form.quantityLitres} onChange={e => setForm(f => ({ ...f, quantityLitres: e.target.value }))} />
            <NumberInput label="Cost per Litre (&#8358;)" step="0.01" min="0" placeholder="0.00" value={form.costPerLitre} onChange={e => setForm(f => ({ ...f, costPerLitre: e.target.value }))} />
            <div className={s.formGroup}>
              <label>Invoice Number</label>
              <input type="text" placeholder="e.g. INV-005" value={form.invoiceNumber} onChange={e => setForm(f => ({ ...f, invoiceNumber: e.target.value }))} />
            </div>
            <div className={s.formGroup}>
              <label>Delivery Date</label>
              <input type="date" value={form.deliveryDate} onChange={e => setForm(f => ({ ...f, deliveryDate: e.target.value }))} />
            </div>
          </div>
          <div className={s.formActions}>
            <button className={`${s.btn} ${s.btnPrimary}`} onClick={handleSubmit} disabled={submitting}>
              {submitting ? 'Recording...' : 'Record Delivery'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
