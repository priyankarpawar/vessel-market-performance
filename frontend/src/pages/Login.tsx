import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError(''); setLoading(true);
    try { await login(username, password); nav('/dashboard'); }
    catch { setError('Invalid credentials. Please try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)', position: 'relative', overflow: 'hidden' }}>
      <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(0,194,255,0.05) 0%, transparent 60%), radial-gradient(ellipse at 80% 50%, rgba(245,158,11,0.05) 0%, transparent 60%)', pointerEvents: 'none' }} />
      <div style={{ width: '100%', maxWidth: 400, padding: '0 24px' }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>⚓</div>
            <span style={{ fontSize: 20, fontWeight: 700 }}>VesselIQ</span>
          </div>
          <p style={{ color: 'var(--text3)', fontSize: 13, fontFamily: 'DM Mono, monospace' }}>Market Performance Platform</p>
        </div>
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 16, padding: 32 }}>
          <h2 style={{ fontSize: 20, fontWeight: 600, marginBottom: 6 }}>Sign in</h2>
          <p style={{ color: 'var(--text2)', fontSize: 13, marginBottom: 24 }}>Enter your credentials to access the dashboard</p>
          {error && <div style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#fca5a5' }}>{error}</div>}
          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Username</label>
              <input value={username} onChange={e => setUsername(e.target.value)} required style={{ width: '100%' }} placeholder="admin" />
            </div>
            <div style={{ marginBottom: 24 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 500, color: 'var(--text2)', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required style={{ width: '100%' }} placeholder="••••••••" />
            </div>
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '11px 0', background: loading ? 'var(--border2)' : 'linear-gradient(135deg, var(--accent), #0096cc)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 14 }}>
              {loading ? 'Signing in...' : 'Sign In →'}
            </button>
          </form>
          <div style={{ marginTop: 20, padding: 12, background: 'var(--bg3)', borderRadius: 8, fontSize: 12, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>
            <div>Admin: <span style={{ color: 'var(--accent)' }}>admin / admin123</span></div>
            <div style={{ marginTop: 4 }}>User: <span style={{ color: 'var(--text2)' }}>user / user123</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
