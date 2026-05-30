import React, { useEffect, useState } from 'react';
import { vesselsApi, ratesApi } from '../api';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

interface Vessel { id: number; name: string; region: number; region_name: string; }

export default function DataEntry() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [form, setForm] = useState({ vessel: '', region: '', date: new Date().toISOString().split('T')[0], hire_rate: '', market_rate: '', hs_code: '', notes: '' });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user?.is_admin) { nav('/dashboard'); return; }
    vesselsApi.list().then(r => { setVessels(r.data); if (r.data.length) setForm(f => ({ ...f, vessel: r.data[0].id.toString(), region: r.data[0].region.toString() })); });
  }, [user, nav]);

  const handleVesselChange = (id: string) => {
    const v = vessels.find(v => v.id.toString() === id);
    setForm(f => ({ ...f, vessel: id, region: v?.region.toString() || '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setSaving(true); setMessage(null);
    try {
      await ratesApi.create({ vessel: parseInt(form.vessel), region: parseInt(form.region), date: form.date, hire_rate: parseFloat(form.hire_rate), market_rate: parseFloat(form.market_rate), hs_code: form.hs_code, notes: form.notes });
      setMessage({ type: 'success', text: `✓ Rate saved for ${vessels.find(v => v.id.toString() === form.vessel)?.name} on ${form.date}` });
      setForm(f => ({ ...f, hire_rate: '', market_rate: '', hs_code: '', notes: '' }));
    } catch (err: any) {
      const detail = err.response?.data ? JSON.stringify(err.response.data) : 'Failed to save. Check for duplicate entries.';
      setMessage({ type: 'error', text: detail });
    } finally { setSaving(false); }
  };

  const inputStyle = { width: '100%' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' };

  return (
    <div style={{ padding: '32px 36px', maxWidth: 700 }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Data Entry</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Add daily market rate and hire rate records. Only Admins can enter data.</p>
      </div>

      {message && (
        <div style={{ background: message.type === 'success' ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.08)', border: `1px solid ${message.type === 'success' ? 'rgba(16,185,129,0.25)' : 'rgba(239,68,68,0.25)'}`, borderRadius: 10, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: message.type === 'success' ? '#6ee7b7' : '#fca5a5' }}>
          {message.text}
        </div>
      )}

      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 28 }}>
        <form onSubmit={handleSubmit}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '18px 24px', marginBottom: 20 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Vessel</label>
              <select value={form.vessel} onChange={e => handleVesselChange(e.target.value)} style={inputStyle}>
                {vessels.map(v => <option key={v.id} value={v.id}>{v.name} ({v.region_name})</option>)}
              </select>
            </div>
            <div>
              <label style={labelStyle}>Date</label>
              <input type="date" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} style={inputStyle} required />
            </div>
            <div>
              <label style={labelStyle}>HS Code</label>
              <input value={form.hs_code} onChange={e => setForm(f => ({ ...f, hs_code: e.target.value }))} style={inputStyle} placeholder="e.g. HS1_38" />
            </div>
            <div>
              <label style={labelStyle}>Hire Rate (USD/day)</label>
              <input type="number" step="0.01" value={form.hire_rate} onChange={e => setForm(f => ({ ...f, hire_rate: e.target.value }))} style={inputStyle} placeholder="e.g. 108.50" required />
            </div>
            <div>
              <label style={labelStyle}>Market Rate (USD/day)</label>
              <input type="number" step="0.01" value={form.market_rate} onChange={e => setForm(f => ({ ...f, market_rate: e.target.value }))} style={inputStyle} placeholder="e.g. 109.00" required />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle}>Notes (optional)</label>
              <textarea value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} style={{ ...inputStyle, resize: 'vertical', minHeight: 72 }} placeholder="Any additional context..." />
            </div>
          </div>

          <button type="submit" disabled={saving} style={{ padding: '11px 28px', background: saving ? 'var(--border2)' : 'linear-gradient(135deg, var(--accent), #0096cc)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 14 }}>
            {saving ? 'Saving...' : 'Save Rate Entry'}
          </button>
        </form>
      </div>
    </div>
  );
}
