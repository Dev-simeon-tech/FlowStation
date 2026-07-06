import { useState, useEffect } from 'react';
import type { Attendant } from '../types';
import { apiFetch } from '../lib/api';
import s from '../styles/shared.module.css';

export default function Attendants() {
  useEffect(() => { document.title = 'attendants'; }, []);
  const [attendants, setAttendants] = useState<Attendant[]>([]);
  const [editing, setEditing] = useState<Attendant | null>(null);
  const [form, setForm] = useState({ fullName: '', employeeId: '', pumpAssigned: '', phone: '' });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    apiFetch<Attendant[]>('/api/attendants')
      .then(setAttendants)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  function resetForm() {
    setForm({ fullName: '', employeeId: '', pumpAssigned: '', phone: '' });
    setEditing(null);
    setError('');
  }

  function handleEdit(a: Attendant) {
    setEditing(a);
    setForm({ fullName: a.fullName, employeeId: a.employeeId, pumpAssigned: a.pumpAssigned || '', phone: a.phone });
    setError('');
  }

  async function handleSubmit() {
    if (!form.fullName || !form.employeeId || !form.phone) return;
    setSubmitting(true);
    setError('');
    try {
      if (editing) {
        const updated = await apiFetch<Attendant>(`/api/attendants/${editing.id}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
        setAttendants(prev => prev.map(a => a.id === editing.id ? updated : a));
      } else {
        const created = await apiFetch<Attendant>('/api/attendants', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        setAttendants(prev => [...prev, created]);
      }
      resetForm();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to save attendant');
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(a: Attendant) {
    try {
      const updated = await apiFetch<Attendant>(`/api/attendants/${a.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !a.isActive }),
      });
      setAttendants(prev => prev.map(x => x.id === a.id ? updated : x));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update status');
    }
  }

  return (
    <div>
      <div className={s.header}>
        <h1>Attendant Registration</h1>
        <p>Register and manage pump staff</p>
      </div>

      <div className={s.card}>
        <h2>{editing ? 'Edit Attendant' : 'Register Attendant'}</h2>
        <div className={s.formGrid}>
          <div className={s.formGroup}><label>Full Name</label><input type="text" placeholder="Full name" value={form.fullName} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} /></div>
          <div className={s.formGroup}><label>Employee ID</label><input type="text" placeholder="e.g. ATT-004" value={form.employeeId} onChange={e => setForm(f => ({ ...f, employeeId: e.target.value }))} /></div>
          <div className={s.formGroup}><label>Pump Assigned</label><input type="text" placeholder="e.g. Pump 4" value={form.pumpAssigned} onChange={e => setForm(f => ({ ...f, pumpAssigned: e.target.value }))} /></div>
          <div className={s.formGroup}><label>Phone</label><input type="text" placeholder="0804-XXX-XXXX" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} /></div>
        </div>
        {error && <p className={s.loginError} style={{ marginTop: 8 }}>{error}</p>}
        <div className={s.formActions}>
          <button className={`${s.btn} ${s.btnPrimary}`} onClick={handleSubmit} disabled={submitting}>
            {submitting ? 'Saving...' : editing ? 'Update Attendant' : 'Register Attendant'}
          </button>
          {editing && <button className={`${s.btn} ${s.btnDanger}`} onClick={resetForm}>Cancel</button>}
        </div>
      </div>

      <div className={s.card}>
        <h2>Attendants</h2>
        {loading ? (
          <div className={s.empty}><p>Loading...</p></div>
        ) : attendants.length === 0 ? (
          <div className={s.empty}><p>No attendants registered yet.</p></div>
        ) : (
          <table className={s.table}>
            <thead>
              <tr><th>Name</th><th>Employee ID</th><th>Pump</th><th>Phone</th><th>Hire Date</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              {attendants.map(a => (
                <tr key={a.id} style={{ opacity: a.isActive ? 1 : 0.5 }}>
                  <td>{a.fullName}</td>
                  <td>{a.employeeId}</td>
                  <td>{a.pumpAssigned || '-'}</td>
                  <td>{a.phone}</td>
                  <td>{a.hireDate?.slice(0, 10)}</td>
                  <td>
                    <span className={`${s.badge} ${a.isActive ? s.badgeSuccess : s.badgeDanger}`}>
                      {a.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    {/* FIX: was btnDanger — Edit should be the primary action */}
                    <button className={`${s.btn} ${s.btnPrimary}`} style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => handleEdit(a)}>Edit</button>
                    <button className={`${s.btn} ${s.btnDanger}`} style={{ fontSize: 12, padding: '4px 10px' }} onClick={() => toggleActive(a)}>
                      {a.isActive ? 'Deactivate' : 'Activate'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
