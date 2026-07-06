import { useState, useEffect } from 'react';
import type { Supplier } from '../types';
import { apiFetch } from '../lib/api';
import s from '../styles/shared.module.css';

export default function Suppliers() {
  useEffect(() => { document.title = 'Suppliers / FlowStation'; }, []);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [editing, setEditing] = useState<Supplier | null>(null);
  const [form, setForm] = useState({ companyName: '', contactPerson: '', phone: '', email: '', address: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<Supplier[]>('/api/suppliers')
      .then(setSuppliers)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setForm({ companyName: '', contactPerson: '', phone: '', email: '', address: '' });
    setEditing(null);
    setError('');
  }

  function handleEdit(p: Supplier) {
    setEditing(p);
    setForm({ companyName: p.companyName, contactPerson: p.contactPerson, phone: p.phone, email: p.email || '', address: p.address || '' });
    setError('');
  }

  async function handleSubmit() {
    if (!form.companyName || !form.contactPerson || !form.phone) return;
    setSubmitting(true);
    setError('');
    try {
      if (editing) {
        const updated = await apiFetch<Supplier>(`/api/suppliers/${editing.id}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
        setSuppliers(prev => prev.map(p => p.id === editing.id ? updated : p));
      } else {
        const created = await apiFetch<Supplier>('/api/suppliers', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        setSuppliers(prev => [...prev, created]);
      }
      resetForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save supplier');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div>
      <div className={s.header}>
        <h1>Supplier Management</h1>
        <p>Add and edit fuel suppliers</p>
      </div>

      <div className={s.card}>
        <h2>{editing ? 'Edit Supplier' : 'Add Supplier'}</h2>
        <div className={s.formGrid}>
          <div className={s.formGroup}><label>Company Name</label><input type="text" placeholder="e.g. Oando PLC" value={form.companyName} onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))} /></div>
          <div className={s.formGroup}><label>Contact Person</label><input type="text" placeholder="Full name" value={form.contactPerson} onChange={e => setForm(f => ({ ...f, contactPerson: e.target.value }))} /></div>
          <div className={s.formGroup}><label>Phone</label><input type="text" placeholder="0803-XXX-XXXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
          <div className={s.formGroup}><label>Email</label><input type="email" placeholder="email@company.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} /></div>
          <div className={s.formGroup}><label>Address</label><input type="text" placeholder="Office address" value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))} /></div>
        </div>
        {error && <p className={s.loginError} style={{ marginTop: 8 }}>{error}</p>}
        <div className={s.formActions}>
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : editing ? 'Update Supplier' : 'Add Supplier'}
          </button>
          {editing && <button className={`${s.btn} ${s.btnDanger}`} onClick={resetForm}>Cancel</button>}
        </div>
      </div>

      <div className={s.card}>
        <h2>Suppliers</h2>
        {loading ? (
          <div className={s.empty}><p>Loading...</p></div>
        ) : suppliers.length === 0 ? (
          <div className={s.empty}><p>No suppliers yet.</p></div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr><th>Company</th><th>Contact</th><th>Phone</th><th>Email</th><th>Address</th><th>Added</th><th></th></tr>
            </thead>
            <tbody>
              {suppliers.map(p => (
                <tr key={p.id}>
                  <td>{p.companyName}</td><td>{p.contactPerson}</td><td>{p.phone}</td>
                  <td>{p.email || '-'}</td><td>{p.address || '-'}</td><td>{p.createdAt?.slice(0, 10)}</td>
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
