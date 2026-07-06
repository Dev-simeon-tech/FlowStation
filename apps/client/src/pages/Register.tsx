import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import s from '../styles/shared.module.css';

export default function Register() {
  const { register } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { document.title = 'Register / FlowStation'; }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name || !email || !password) {
      setError('All fields are required');
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      await register(name, email, password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Registration failed');
      }
    } finally {
      setSubmitting(false);
    }
  }

  let btnText;
  if (submitting) {
    btnText = 'Creating account...';
  } else {
    btnText = 'Register';
  }

  return (
    <div className={s.loginWrap}>
      <div className={s.loginCard}>
        <div className={s.loginLogo}>
          <img src="/favicon.png" alt="" width={40} height={40} />
        </div>
        <h1 className={s.loginTitle}>FlowStation</h1>
        <p className={s.loginSub}>Register your station</p>

        <form onSubmit={handleSubmit} className={s.loginForm}>
          <div className={s.formGroup}>
            <label>Station Name</label>
            <input
              type="text"
              placeholder="e.g. Total Energies GRA"
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </div>
          <div className={s.formGroup}>
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@station.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
          </div>
          <div className={s.formGroup}>
            <label>Password</label>
            <input
              type="password"
              placeholder="Choose a password"
              value={password}
              onChange={e => setPassword(e.target.value)}
            />
          </div>
          {error && <p className={s.loginError}>{error}</p>}
          <button className={`${s.btn} ${s.btnPrimary}`} type="submit" disabled={submitting} style={{ width: '100%', marginTop: 8 }}>
            {btnText}
          </button>
        </form>

        <p className={s.loginSub} style={{ marginTop: 16, textAlign: 'center' }}>
          Already have an account? <Link to="/login" style={{ color: 'var(--accent)' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
