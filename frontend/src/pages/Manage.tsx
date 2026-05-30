import React, { useEffect, useState } from 'react';
import { regionsApi, vesselsApi } from '../api';
import { useAuth } from '../AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Manage() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [regions, setRegions] = useState<any[]>([]);
  const [vessels, setVessels] = useState<any[]>([]);
  const [tab, setTab] = useState<'regions' | 'vessels'>('vessels');
  const [regionForm, setRegionForm] = useState({ name: '', code: '', description: '' });
  const [vesselForm, setVesselForm] = useState({ name: '', imo_number: '', vessel_type: '', region: '' });
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => { if (!user?.is_admin) nav('/dashboard'); }, [user, nav]);

  const loadData = () => {
    regionsApi.list().then(r => setRegions(r.data));
    vesselsApi.list().then(r => setVessels(r.data));
  };
  useEffect(() => { loadData(); }, []);

  const saveRegion = async (e: React.FormEvent) => {
    e.preventDefault();
    await regionsApi.create(regionForm);
    setMsg('Region created!'); setRegionForm({ name: '', code: '', description: '' }); loadData();
  };

  const saveVessel = async (e: React.FormEvent) => {
    e.preventDefault();
    await vesselsApi.create({ ...vesselForm, region: parseInt(vesselForm.region) });
    setMsg('Vessel created!'); setVesselForm({ name: '', imo_number: '', vessel_type: '', region: '' }); loadData();
  };

  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' };

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Manage</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Configure vessels and regions. Admin-only.</p>
      </div>

      {msg && <div style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', borderRadius: 8, padding: '10px 14px', marginBottom: 20, fontSize: 13, color: '#6ee7b7' }} onClick={() => setMsg(null)}>✓ {msg}</div>}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {(['vessels', 'regions'] as const).map(t => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '7px 18px', background: tab === t ? 'var(--card2)' : 'transparent', border: `1px solid ${tab === t ? 'var(--border2)' : 'transparent'}`, borderRadius: 7, color: tab === t ? 'var(--text)' : 'var(--text2)', fontWeight: tab === t ? 600 : 400, fontSize: 13, transition: 'all 0.15s', textTransform: 'capitalize' }}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Form */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>Add New {tab === 'vessels' ? 'Vessel' : 'Region'}</h3>
          {tab === 'regions' ? (
            <form onSubmit={saveRegion} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={labelStyle}>Region Name</label><input value={regionForm.name} onChange={e => setRegionForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%' }} required /></div>
              <div><label style={labelStyle}>Code</label><input value={regionForm.code} onChange={e => setRegionForm(f => ({ ...f, code: e.target.value }))} style={{ width: '100%' }} placeholder="e.g. EA" required /></div>
              <div><label style={labelStyle}>Description</label><input value={regionForm.description} onChange={e => setRegionForm(f => ({ ...f, description: e.target.value }))} style={{ width: '100%' }} /></div>
              <button type="submit" style={{ padding: '10px 0', background: 'linear-gradient(135deg, var(--accent), #0096cc)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 13 }}>Add Region</button>
            </form>
          ) : (
            <form onSubmit={saveVessel} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div><label style={labelStyle}>Vessel Name</label><input value={vesselForm.name} onChange={e => setVesselForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%' }} required /></div>
              <div><label style={labelStyle}>IMO Number</label><input value={vesselForm.imo_number} onChange={e => setVesselForm(f => ({ ...f, imo_number: e.target.value }))} style={{ width: '100%' }} /></div>
              <div><label style={labelStyle}>Vessel Type</label><input value={vesselForm.vessel_type} onChange={e => setVesselForm(f => ({ ...f, vessel_type: e.target.value }))} style={{ width: '100%' }} placeholder="e.g. Bulk Carrier" /></div>
              <div><label style={labelStyle}>Region</label>
                <select value={vesselForm.region} onChange={e => setVesselForm(f => ({ ...f, region: e.target.value }))} style={{ width: '100%' }} required>
                  <option value="">Select region</option>
                  {regions.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <button type="submit" style={{ padding: '10px 0', background: 'linear-gradient(135deg, var(--accent), #0096cc)', border: 'none', borderRadius: 8, color: '#fff', fontWeight: 600, fontSize: 13 }}>Add Vessel</button>
            </form>
          )}
        </div>

        {/* List */}
        <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: 24 }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 18 }}>Existing {tab === 'vessels' ? 'Vessels' : 'Regions'}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 360, overflowY: 'auto' }}>
            {(tab === 'vessels' ? vessels : regions).map((item: any) => (
              <div key={item.id} style={{ padding: '10px 14px', background: 'var(--bg3)', borderRadius: 8, border: '1px solid var(--border)', fontSize: 13 }}>
                <div style={{ fontWeight: 600 }}>{item.name}</div>
                <div style={{ color: 'var(--text3)', fontSize: 11, fontFamily: 'DM Mono, monospace', marginTop: 2 }}>
                  {tab === 'vessels' ? `Region: ${item.region_name}` : `Code: ${item.code} · ${item.vessel_count} vessels`}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
