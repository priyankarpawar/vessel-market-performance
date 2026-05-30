import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { performanceApi } from '../api';

interface Summary { total_vessels: number; total_regions: number; total_entries: number; latest_entry_date: string | null; }

const StatCard = ({ label, value, icon, color }: { label: string; value: string | number; icon: string; color: string }) => (
  <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '20px 24px', position: 'relative', overflow: 'hidden' }}>
    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: color }} />
    <div style={{ fontSize: 22, marginBottom: 8 }}>{icon}</div>
    <div style={{ fontSize: 28, fontWeight: 700, lineHeight: 1, marginBottom: 6 }}>{value}</div>
    <div style={{ fontSize: 13, color: 'var(--text2)' }}>{label}</div>
  </div>
);

export default function Dashboard() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [summary, setSummary] = useState<Summary | null>(null);

  useEffect(() => {
    performanceApi.summary().then(r => setSummary(r.data)).catch(() => {});
  }, []);

  return (
    <div style={{ padding: '32px 36px', maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
          <h1 style={{ fontSize: 26, fontWeight: 700 }}>Market Dashboard</h1>
          <span style={{ padding: '3px 10px', background: user?.is_admin ? 'rgba(0,194,255,0.1)' : 'var(--bg3)', border: `1px solid ${user?.is_admin ? 'rgba(0,194,255,0.3)' : 'var(--border)'}`, borderRadius: 20, fontSize: 11, fontFamily: 'DM Mono, monospace', color: user?.is_admin ? 'var(--accent)' : 'var(--text3)' }}>
            {user?.is_admin ? 'ADMIN' : 'OFFICE USER'}
          </span>
        </div>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Welcome back, {user?.username}. Here's your vessel market overview.</p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 }}>
        <StatCard label="Active Vessels" value={summary?.total_vessels ?? '—'} icon="🚢" color="var(--accent)" />
        <StatCard label="Regions Tracked" value={summary?.total_regions ?? '—'} icon="🌏" color="var(--accent2)" />
        <StatCard label="Total Entries" value={summary?.total_entries ?? '—'} icon="📊" color="var(--accent3)" />
        <StatCard label="Latest Entry" value={summary?.latest_entry_date ?? '—'} icon="📅" color="#8b5cf6" />
      </div>

      {/* Quick Actions */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: 'var(--text2)' }}>Quick Actions</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {[
            { label: 'View Vessel Performance', sub: 'Hire vs Market rate per vessel with HS codes', icon: '📈', path: '/vessel-performance', adminOnly: false },
            { label: 'Aggregated Performance', sub: 'All vessels combined — no HS codes shown', icon: '🌐', path: '/aggregated', adminOnly: false },
            { label: 'Enter Market Data', sub: 'Add daily hire & market rates (Admin only)', icon: '✏️', path: '/data-entry', adminOnly: true },
            { label: 'Manage Vessels & Regions', sub: 'Configure fleet and region settings', icon: '⚙️', path: '/manage', adminOnly: true },
          ].filter(a => !a.adminOnly || user?.is_admin).map(action => (
            <button key={action.path} onClick={() => nav(action.path)}
              style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 12, padding: '18px 20px', textAlign: 'left', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onMouseOver={e => (e.currentTarget.style.borderColor = 'var(--border2)')}
              onMouseOut={e => (e.currentTarget.style.borderColor = 'var(--border)')}>
              <div style={{ fontSize: 20, marginBottom: 8 }}>{action.icon}</div>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>{action.label}</div>
              <div style={{ fontSize: 12, color: 'var(--text3)' }}>{action.sub}</div>
            </button>
          ))}
        </div>
      </div>

      {!user?.is_admin && (
        <div style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 10, padding: '14px 18px', fontSize: 13, color: '#fcd34d' }}>
          ℹ️ You are signed in as a read-only Office User. Data entry and management features require Admin access.
        </div>
      )}
    </div>
  );
}
