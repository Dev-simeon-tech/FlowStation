import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import s from '../styles/shared.module.css';

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { document.title = 'Login / FlowStation'; }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !password) { setError('Enter email and password'); return; }
    setSubmitting(true);
    setError('');
    try {
      await login(email, password);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Login failed');
      }
    } finally {
      setSubmitting(false);
    }
  }

  let btnText;
  if (submitting) {
    btnText = 'Signing in...';
  } else {
    btnText = 'Sign in';
  }

  return (
    <div className={s.loginWrap}>
      <div className={s.loginCard}>
        <div className={s.loginLogo}>
          <img src="/favicon.png" alt="" width={40} height={40} />
        </div>
        <h1 className={s.loginTitle}>FlowStation</h1>
        <p className={s.loginSub}>Sign in to your station dashboard</p>

        <form onSubmit={handleSubmit} className={s.loginForm}>
          <div className={s.formGroup}>
            <label>Email</label>
            <input
              type="email"
              placeholder="admin@flowstation.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              autoFocus
            />
          </div>
          <div className={s.formGroup}>
            <label>Password</label>
            <input
              type="password"
              placeholder="••••••••"
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
          Don&apos;t have an account? <Link to="/register" style={{ color: 'var(--accent)' }}>Register your station</Link>
        </p>
      </div>
    </div>
  );
}
