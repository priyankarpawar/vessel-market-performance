import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';

const NavItem = ({ to, icon, label }: { to: string; icon: string; label: string }) => (
  <NavLink to={to} style={({ isActive }) => ({
    display: 'flex', alignItems: 'center', gap: 10, padding: '9px 12px',
    borderRadius: 8, fontSize: 14, fontWeight: 500, textDecoration: 'none',
    color: isActive ? 'var(--accent)' : 'var(--text2)',
    background: isActive ? 'rgba(0,194,255,0.08)' : 'transparent',
    transition: 'all 0.15s',
  })}>
    <span style={{ fontSize: 16 }}>{icon}</span>{label}
  </NavLink>
);

export default function Layout({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const nav = useNavigate();

  const handleLogout = () => { logout(); nav('/login'); };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {/* Sidebar */}
      <aside style={{ width: 220, background: 'var(--bg2)', borderRight: '1px solid var(--border)', display: 'flex', flexDirection: 'column', flexShrink: 0 }}>
        {/* Brand */}
        <div style={{ padding: '20px 16px 16px', borderBottom: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{ width: 30, height: 30, borderRadius: 7, background: 'linear-gradient(135deg, var(--accent), var(--accent2))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 }}>⚓</div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, lineHeight: 1 }}>VesselIQ</div>
              <div style={{ fontSize: 10, color: 'var(--text3)', fontFamily: 'DM Mono, monospace', marginTop: 2 }}>MARKET INTEL</div>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex: 1, padding: '12px 8px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          <NavItem to="/dashboard" icon="◼" label="Dashboard" />
          <NavItem to="/vessel-performance" icon="📈" label="Vessel View" />
          <NavItem to="/aggregated" icon="🌐" label="Aggregated" />
          {user?.is_admin && <NavItem to="/data-entry" icon="✏️" label="Data Entry" />}
          {user?.is_admin && <NavItem to="/manage" icon="⚙️" label="Manage" />}
        </nav>

        {/* User */}
        <div style={{ padding: '12px 16px', borderTop: '1px solid var(--border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9, marginBottom: 10 }}>
            <div style={{ width: 30, height: 30, borderRadius: '50%', background: user?.is_admin ? 'linear-gradient(135deg, var(--accent), var(--accent2))' : 'var(--border2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, flexShrink: 0 }}>
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 13, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user?.username}</div>
              <div style={{ fontSize: 10, fontFamily: 'DM Mono, monospace', color: user?.is_admin ? 'var(--accent)' : 'var(--text3)' }}>
                {user?.is_admin ? 'ADMIN' : 'USER'}
              </div>
            </div>
          </div>
          <button onClick={handleLogout} style={{ width: '100%', padding: '7px 0', background: 'transparent', border: '1px solid var(--border)', borderRadius: 7, color: 'var(--text3)', fontSize: 12, transition: 'all 0.15s' }}
            onMouseOver={e => { (e.target as HTMLButtonElement).style.borderColor = 'var(--danger)'; (e.target as HTMLButtonElement).style.color = '#fca5a5'; }}
            onMouseOut={e => { (e.target as HTMLButtonElement).style.borderColor = 'var(--border)'; (e.target as HTMLButtonElement).style.color = 'var(--text3)'; }}>
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: 'auto', background: 'var(--bg)' }}>
        {children}
      </main>
    </div>
  );
}
