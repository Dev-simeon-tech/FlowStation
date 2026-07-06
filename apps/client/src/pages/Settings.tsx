import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { apiFetch } from '../lib/api';
import s from '../styles/shared.module.css';

interface SystemConfig {
  currencySymbol: string;
  lowStockThreshold: number;
  requireShiftHandover: boolean;
}

export default function Settings() {
  const { user, updateUserOrg } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  
  let activeTab = 'profile';
  if (searchParams.get('tab') === 'system') {
    activeTab = 'system';
  }

  useEffect(() => {
    document.title = 'Settings / FlowStation';
  }, []);

  // Profile Form State
  let initialName = '';
  let initialEmail = '';
  let initialPhone = '';
  let initialAddress = '';
  let initialLogo = '';

  if (user) {
    if (user.org) {
      initialName = user.org.name;
      initialEmail = user.org.email;
      if (user.org.phone) {
        initialPhone = user.org.phone;
      }
      if (user.org.address) {
        initialAddress = user.org.address;
      }
      if (user.org.logo) {
        initialLogo = user.org.logo;
      }
    }
  }

  const [orgForm, setOrgForm] = useState({
    name: initialName,
    email: initialEmail,
    phone: initialPhone,
    address: initialAddress,
    logo: initialLogo,
  });

  // Keep state in sync with context updates
  useEffect(() => {
    if (user) {
      if (user.org) {
        let nameVal = user.org.name;
        let emailVal = user.org.email;
        let phoneVal = '';
        let addressVal = '';
        let logoVal = '';

        if (user.org.phone) {
          phoneVal = user.org.phone;
        }
        if (user.org.address) {
          addressVal = user.org.address;
        }
        if (user.org.logo) {
          logoVal = user.org.logo;
        }

        setOrgForm({
          name: nameVal,
          email: emailVal,
          phone: phoneVal,
          address: addressVal,
          logo: logoVal,
        });
      }
    }
  }, [user]);

  // System Settings State
  const [sysForm, setSysForm] = useState<SystemConfig>({
    currencySymbol: '₦',
    lowStockThreshold: 1000,
    requireShiftHandover: true,
  });

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load current settings
  useEffect(() => {
    if (activeTab === 'system') {
      setLoading(true);
      setError('');
      apiFetch<SystemConfig>('/api/settings')
        .then(data => {
          setSysForm(data);
        })
        .catch(e => {
          console.warn('Could not fetch settings from API, using local fallback:', e.message);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [activeTab]);

  // Handle Logo Upload
  function handleLogoClick() {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    let file;
    if (e.target.files) {
      file = e.target.files[0];
    }
    if (!file) {
      return;
    }

    // Validate size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setError('Image must be smaller than 2MB');
      return;
    }

    // Validate format
    if (file.type !== 'image/jpeg') {
      if (file.type !== 'image/png') {
        if (file.type !== 'image/svg+xml') {
          setError('Supported formats: JPG, PNG, SVG');
          return;
        }
      }
    }

    setError('');
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setOrgForm(prev => {
          let updated = { ...prev, logo: reader.result as string };
          return updated;
        });
      }
    };
    reader.readAsDataURL(file);
  }

  // Submit Profile Info
  async function handleProfileSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await apiFetch<{ message: string; org: typeof orgForm }>('/api/organization', {
        method: 'PUT',
        body: JSON.stringify(orgForm),
      });

      // Update global context
      updateUserOrg(orgForm);
      setSuccess('Organization profile updated successfully');
    } catch (err: any) {
      let errMsg = 'Failed to update profile. Server code may be missing, local preview updated.';
      if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
      // Graceful fallback for frontend-only testing
      updateUserOrg(orgForm);
    } finally {
      setSubmitting(false);
    }
  }

  // Submit System Settings
  async function handleSystemSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSubmitting(true);

    try {
      await apiFetch('/api/settings', {
        method: 'PUT',
        body: JSON.stringify(sysForm),
      });
      setSuccess('System settings updated successfully');
    } catch (err: any) {
      let errMsg = 'Failed to save settings. Server code may be missing.';
      if (err.message) {
        errMsg = err.message;
      }
      setError(errMsg);
    } finally {
      setSubmitting(false);
    }
  }

  function setTab(tabName: 'profile' | 'system') {
    setSearchParams({ tab: tabName });
    setError('');
    setSuccess('');
  }

  // Resolve dynamic tab classnames
  let profileTabClass = s.tab;
  if (activeTab === 'profile') {
    profileTabClass = `${s.tab} ${s.tabActive}`;
  }

  let systemTabClass = s.tab;
  if (activeTab === 'system') {
    systemTabClass = `${s.tab} ${s.tabActive}`;
  }

  // Resolve dynamic alert states
  let errorDisplay = null;
  if (error) {
    errorDisplay = <p className={s.loginError} style={{ marginBottom: 16 }}>{error}</p>;
  }

  let successDisplay = null;
  if (success) {
    successDisplay = <p className={s.successMsg} style={{ marginBottom: 16, color: 'var(--success)' }}>{success}</p>;
  }

  // Resolve dynamic logo image style
  let logoBg = undefined;
  if (orgForm.logo) {
    logoBg = `url(${orgForm.logo})`;
  }

  // Resolve initials fallback
  let initials = '';
  if (!orgForm.logo) {
    if (orgForm.name) {
      initials = orgForm.name[0].toUpperCase();
    }
  }

  // Resolve body content dynamically
  let tabBodyContent;
  if (activeTab === 'profile') {
    tabBodyContent = (
      <div className={s.card}>
        <form onSubmit={handleProfileSubmit}>
          {/* Logo/PFP Section */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28, gap: 12 }}>
            <div 
              onClick={handleLogoClick}
              style={{
                width: 80,
                height: 80,
                borderRadius: '50%',
                background: 'var(--accent)',
                color: 'var(--accent-text)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                fontSize: 32,
                fontWeight: 600,
                boxShadow: 'var(--shadow)',
                overflow: 'hidden',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                backgroundImage: logoBg,
                transition: 'opacity 0.2s',
              }}
              title="Click to upload logo"
            >
              {initials}
            </div>
            <button 
              type="button" 
              className={`${s.btn} ${s.btnDanger}`} 
              onClick={handleLogoClick}
              style={{ padding: '6px 14px', fontSize: 12 }}
            >
              Upload Logo
            </button>
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept="image/*" 
              style={{ display: 'none' }} 
            />
            <span style={{ fontSize: 11, color: 'var(--text-secondary)' }}>JPG, PNG or SVG. Max 2MB.</span>
          </div>

          <div className={s.formGrid}>
            <div className={s.formGroup}>
              <label>Organization Name</label>
              <input 
                type="text" 
                value={orgForm.name} 
                onChange={e => setOrgForm(prev => { return { ...prev, name: e.target.value }; })} 
                required 
              />
            </div>
            <div className={s.formGroup}>
              <label>Email Address</label>
              <input 
                type="email" 
                value={orgForm.email} 
                onChange={e => setOrgForm(prev => { return { ...prev, email: e.target.value }; })} 
                required 
              />
            </div>
            <div className={s.formGroup}>
              <label>Phone Number</label>
              <input 
                type="text" 
                value={orgForm.phone} 
                onChange={e => setOrgForm(prev => { return { ...prev, phone: e.target.value }; })} 
              />
            </div>
            <div className={s.formGroup}>
              <label>Address</label>
              <input 
                type="text" 
                value={orgForm.address} 
                onChange={e => setOrgForm(prev => { return { ...prev, address: e.target.value }; })} 
              />
            </div>
          </div>

          <div className={s.formActions} style={{ justifyContent: 'center', marginTop: 28 }}>
            <button type="submit" className={`${s.btn} ${s.btnPrimary}`} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    );
  } else {
    let settingsContent;
    if (loading) {
      settingsContent = <div className={s.empty}><p>Loading settings...</p></div>;
    } else {
      settingsContent = (
        <form onSubmit={handleSystemSubmit}>
          <div className={s.formGrid}>
            <div className={s.formGroup}>
              <label>Base Currency Symbol</label>
              <select 
                value={sysForm.currencySymbol} 
                onChange={e => setSysForm(prev => { return { ...prev, currencySymbol: e.target.value }; })}
              >
                <option value="₦">Naira (₦)</option>
                <option value="$">Dollar ($)</option>
                <option value="€">Euro (€)</option>
                <option value="£">Pound (£)</option>
              </select>
            </div>
            <div className={s.formGroup}>
              <label>Low Stock Alarm Limit (Litres)</label>
              <input 
                type="number" 
                min="1" 
                value={sysForm.lowStockThreshold} 
                onChange={e => setSysForm(prev => { return { ...prev, lowStockThreshold: parseInt(e.target.value) || 0 }; })} 
              />
            </div>
            <div className={s.formGroup} style={{ justifyContent: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', marginTop: 24 }}>
                <input 
                  type="checkbox" 
                  checked={sysForm.requireShiftHandover} 
                  onChange={e => setSysForm(prev => { return { ...prev, requireShiftHandover: e.target.checked }; })} 
                />
                Require shift handover logs
              </label>
            </div>
          </div>

          <div className={s.formActions} style={{ justifyContent: 'center', marginTop: 28 }}>
            <button type="submit" className={`${s.btn} ${s.btnPrimary}`} disabled={submitting}>
              {submitting ? 'Saving...' : 'Save Settings'}
            </button>
          </div>
        </form>
      );
    }

    tabBodyContent = (
      <div className={s.card}>
        {settingsContent}
      </div>
    );
  }

  return (
    <div>
      <div className={s.topBar}>
        <div className={s.header}>
          <h1>Settings</h1>
          <p>Configure organization profile and system preferences</p>
        </div>
        <div className={s.tabs}>
          <button className={profileTabClass} onClick={() => setTab('profile')}>Organization Profile</button>
          <button className={systemTabClass} onClick={() => setTab('system')}>System Settings</button>
        </div>
      </div>

      {errorDisplay}
      {successDisplay}

      {tabBodyContent}
    </div>
  );
}
