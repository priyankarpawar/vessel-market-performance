import React, { useEffect, useState, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { vesselsApi, ratesApi } from '../api';
import { useAuth } from '../AuthContext';

interface Vessel { id: number; name: string; region_name: string; }
interface Rate { date: string; hire_rate: string; market_rate: string; hs_code?: string; }

const CustomTooltip = ({ active, payload, label, isAdmin }: any) => {
  if (!active || !payload?.length) return null;
  const hire = payload.find((p: any) => p.dataKey === 'hire_rate');
  const market = payload.find((p: any) => p.dataKey === 'market_rate');
  return (
    <div style={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 10, padding: '12px 16px', fontSize: 13 }}>
      <div style={{ fontFamily: 'DM Mono, monospace', color: 'var(--text2)', marginBottom: 8, fontSize: 11 }}>{label}</div>
      {hire && <div style={{ color: 'var(--hire-color)', marginBottom: 4 }}>Hire Rate: <strong>{Number(hire.value).toFixed(2)}</strong></div>}
      {market && <div style={{ color: 'var(--market-color)' }}>Market Rate: <strong>{Number(market.value).toFixed(2)}</strong></div>}
      {isAdmin && hire && payload[0]?.payload?.hs_code && (
        <div style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border)', color: 'var(--text3)', fontSize: 11, fontFamily: 'DM Mono, monospace' }}>
          HS Code: {payload[0].payload.hs_code}
        </div>
      )}
    </div>
  );
};

export default function VesselPerformance() {
  const { user } = useAuth();
  const [vessels, setVessels] = useState<Vessel[]>([]);
  const [selectedVessel, setSelectedVessel] = useState('');
  const [dateFrom, setDateFrom] = useState('2025-05-01');
  const [dateTo, setDateTo] = useState('2025-09-30');
  const [rates, setRates] = useState<Rate[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    vesselsApi.list().then(r => {
      setVessels(r.data);
      if (r.data.length) setSelectedVessel(r.data[0].id.toString());
    });
  }, []);

  const fetchRates = useCallback(() => {
    if (!selectedVessel) return;
    setLoading(true);
    ratesApi.list({ vessel: selectedVessel, date_from: dateFrom, date_to: dateTo })
      .then(r => setRates(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [selectedVessel, dateFrom, dateTo]);

  useEffect(() => { fetchRates(); }, [fetchRates]);

  const chartData = rates.map(r => ({
    date: r.date,
    hire_rate: parseFloat(r.hire_rate),
    market_rate: parseFloat(r.market_rate),
    hs_code: r.hs_code,
  }));

  const vessel = vessels.find(v => v.id.toString() === selectedVessel);

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Vessel Performance</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>Hire Rate vs Market Rate — {user?.is_admin ? 'HS Codes visible on hover' : 'Read-only view'}</p>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap', alignItems: 'flex-end' }}>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Select Vessel</label>
          <select value={selectedVessel} onChange={e => setSelectedVessel(e.target.value)} style={{ minWidth: 200 }}>
            {vessels.map(v => <option key={v.id} value={v.id}>{v.name}</option>)}
          </select>
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>From Date</label>
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
        </div>
        <div>
          <label style={{ display: 'block', fontSize: 11, color: 'var(--text3)', marginBottom: 5, textTransform: 'uppercase', letterSpacing: '0.5px' }}>To Date</label>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
        </div>
      </div>

      {/* Chart */}
      <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 14, padding: '24px 24px 16px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>
              {vessel?.name} — Hire vs Market Rate
              {user?.is_admin && <span style={{ marginLeft: 10, fontSize: 11, fontFamily: 'DM Mono, monospace', color: 'var(--accent)', background: 'rgba(0,194,255,0.08)', padding: '2px 8px', borderRadius: 20 }}>Hover to see HS Code</span>}
            </h2>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{vessel?.region_name} · {rates.length} data points</div>
          </div>
          {loading && <div style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>Loading...</div>}
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text3)', fontSize: 11, fontFamily: 'DM Mono, monospace' }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip isAdmin={user?.is_admin} />} />
              <Legend wrapperStyle={{ fontSize: 13, paddingTop: 12 }} />
              <Line type="monotone" dataKey="hire_rate" stroke="var(--hire-color)" strokeWidth={2} dot={false} name="Hire Rate" />
              <Line type="monotone" dataKey="market_rate" stroke="var(--market-color)" strokeWidth={2} dot={false} name="Market Rate" strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)', fontSize: 14 }}>
            {loading ? 'Fetching data...' : 'No data for selected filters.'}
          </div>
        )}
      </div>
    </div>
  );
}
