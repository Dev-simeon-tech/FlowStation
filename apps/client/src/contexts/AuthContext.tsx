import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface Org {
  id: number;
  name: string;
  email: string;
  address?: string;
  phone?: string;
  logo?: string;
}

interface User {
  token: string;
  role: string;
  org: Org;
}

interface AuthCtx {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  updateUserOrg: (org: Partial<Org>) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthCtx>(null!);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try { return JSON.parse(stored); } catch { return null; }
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    let mounted = true;
    if (!user) { setLoading(false); return; }
    fetch('/api/auth/me', { headers: { Authorization: `Bearer ${user.token}` } })
      .then(r => { if (r.ok) return r.json(); return null; })
      .then(data => {
        if (!mounted) return;
        if (data) {
          const updated = { ...user, role: data.role, org: { id: data.id, name: data.name, email: data.email, address: data.address, phone: data.phone, logo: data.logo } };
          setUser(updated);
          localStorage.setItem('user', JSON.stringify(updated));
        } else {
          localStorage.removeItem('user');
          setUser(null);
        }
      })
      .catch(() => { if (mounted) { localStorage.removeItem('user'); setUser(null); } })
      .finally(() => { if (mounted) setLoading(false); });
    return () => { mounted = false; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  function storeUser(data: { token: string; role: string; org: Org }) {
    const u: User = { token: data.token, role: data.role, org: data.org };
    localStorage.setItem('user', JSON.stringify(u));
    setUser(u);
  }

  async function login(email: string, password: string) {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Login failed');
    }
    const data = await res.json();
    storeUser(data);
  }

  async function register(name: string, email: string, password: string) {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || 'Registration failed');
    }
    const data = await res.json();
    storeUser(data);
  }

  function logout() {
    localStorage.removeItem('user');
    setUser(null);
  }

  function updateUserOrg(orgUpdate: Partial<Org>) {
    if (!user) return;
    const updated = { ...user, org: { ...user.org, ...orgUpdate } };
    localStorage.setItem('user', JSON.stringify(updated));
    setUser(updated);
  }

  return (
    <AuthContext.Provider value={{ user, login, register, logout, updateUserOrg, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
