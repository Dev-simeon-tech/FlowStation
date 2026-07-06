import { useState, useEffect } from 'react';
import { FUEL_TYPES } from '../constants';
import type { FuelProduct } from '../types';
import { apiFetch } from '../lib/api';
import s from '../styles/shared.module.css';

export default function Products() {
  useEffect(() => { document.title = 'fuel products'; }, []);
  const [products, setProducts] = useState<FuelProduct[]>([]);
  const [editing, setEditing] = useState<FuelProduct | null>(null);
  const [form, setForm] = useState({ name: '', type: 'PETROL', pricePerLitre: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<FuelProduct[]>('/api/products')
      .then(setProducts)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setForm({ name: '', type: 'PETROL', pricePerLitre: '' });
    setEditing(null);
    setError('');
  }

  function handleEdit(p: FuelProduct) {
    setEditing(p);
    setForm({ name: p.name, type: p.type, pricePerLitre: String(p.pricePerLitre) });
    setError('');
  }

  async function handleSubmit() {
    if (!form.name || !form.pricePerLitre) return;
    const price = parseFloat(form.pricePerLitre);
    if (isNaN(price) || price <= 0) return;
    setSubmitting(true);
    setError('');
    try {
      if (editing) {
        const updated = await apiFetch<FuelProduct>(`/api/products/${editing.id}`, {
          method: 'PUT',
          body: JSON.stringify({ name: form.name, type: form.type, pricePerLitre: price }),
        });
        setProducts(prev => prev.map(p => p.id === editing.id ? updated : p));
      } else {
        const created = await apiFetch<FuelProduct>('/api/products', {
          method: 'POST',
          body: JSON.stringify({ name: form.name, type: form.type, pricePerLitre: price }),
        });
        setProducts(prev => [...prev, created]);
      }
      resetForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save product');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className={s.header}>
        <h1>Fuel Product Setup</h1>
        <p>Add and edit fuel types and prices</p>
      </div>

      <div className={s.card}>
        <h2>{editing ? 'Edit Product' : 'Add Product'}</h2>
        <div className={s.formGrid}>
          <div className={s.formGroup}>
            <label>Name</label>
            <input type="text" placeholder="e.g. Premium Motor Spirit" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
          </div>
          <div className={s.formGroup}>
            <label>Fuel Type</label>
            <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
              {FUEL_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className={s.formGroup}>
            <label>Price per Litre (&#8358;)</label>
            <input type="number" step="0.01" min="0" placeholder="0.00" value={form.pricePerLitre} onChange={e => setForm(f => ({ ...f, pricePerLitre: e.target.value }))} />
          </div>
        </div>
        {error && <p className={s.loginError} style={{ marginTop: 8 }}>{error}</p>}
        <div className={s.formActions}>
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}
          </button>
          {editing && <button className={`${s.btn} ${s.btnDanger}`} onClick={resetForm}>Cancel</button>}
        </div>
      </div>

      <div className={s.card}>
        <h2>Products</h2>
        {loading ? (
          <div className={s.empty}><p>Loading...</p></div>
        ) : products.length === 0 ? (
          <div className={s.empty}><p>No products yet. Add one above.</p></div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr><th>Name</th><th>Type</th><th>Price/Litre</th><th>Unit</th><th>Created</th><th></th></tr>
            </thead>
            <tbody>
              {products.map(p => (
                <tr key={p.id}>
                  <td>{p.name}</td>
                  <td><span className={`${s.badge} ${s['badge' + p.type] ?? s.badgeInfo}`}>{p.type}</span></td>
                  <td>&#8358;{p.pricePerLitre.toFixed(2)}</td>
                  <td>{p.unit}</td>
                  <td>{p.createdAt?.slice(0, 10)}</td>
                  <td><button className={`${s.btn} ${s.btnPrimary}`} onClick={() => handleEdit(p)}>Edit</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
