import React, { useEffect, useState, useCallback } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { performanceApi } from '../api';

interface AggRow { date: string; hire_rate_sum: string; market_rate_sum: string; vessel_count: number; }

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: 'var(--card2)', border: '1px solid var(--border2)', borderRadius: 10, padding: '12px 16px', fontSize: 13 }}>
      <div style={{ fontFamily: 'DM Mono, monospace', color: 'var(--text2)', marginBottom: 8, fontSize: 11 }}>{label}</div>
      {payload.map((p: any) => (
        <div key={p.dataKey} style={{ color: p.stroke, marginBottom: 3 }}>{p.name}: <strong>{Number(p.value).toFixed(2)}</strong></div>
      ))}
    </div>
  );
};

export default function Aggregated() {
  const [dateFrom, setDateFrom] = useState('2025-05-01');
  const [dateTo, setDateTo] = useState('2025-09-30');
  const [data, setData] = useState<AggRow[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(() => {
    setLoading(true);
    performanceApi.aggregated({ date_from: dateFrom, date_to: dateTo })
      .then(r => setData(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [dateFrom, dateTo]);

  useEffect(() => { fetchData(); }, [fetchData]);

  const chartData = data.map(r => ({
    date: r.date,
    hire_rate_sum: parseFloat(r.hire_rate_sum),
    market_rate_sum: parseFloat(r.market_rate_sum),
    vessel_count: r.vessel_count,
  }));

  const lastRow = chartData[chartData.length - 1];

  return (
    <div style={{ padding: '32px 36px' }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 6 }}>Aggregated Performance</h1>
        <p style={{ color: 'var(--text2)', fontSize: 14 }}>All vessels combined — daily hire & market rate sums. HS codes are not shown in this view.</p>
      </div>

      {/* Stats */}
      {lastRow && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14, marginBottom: 28 }}>
          {[
            { label: 'Latest Hire Rate Sum', value: lastRow.hire_rate_sum?.toFixed(2), color: 'var(--hire-color)' },
            { label: 'Latest Market Rate Sum', value: lastRow.market_rate_sum?.toFixed(2), color: 'var(--market-color)' },
            { label: 'Vessels Tracked', value: lastRow.vessel_count, color: 'var(--accent3)' },
          ].map(s => (
            <div key={s.label} style={{ background: 'var(--card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: s.color }}>{s.value}</div>
              <div style={{ fontSize: 12, color: 'var(--text2)', marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div style={{ display: 'flex', gap: 16, marginBottom: 24, flexWrap: 'wrap' }}>
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>Aggregated Hire vs Market (All Vessels)</h2>
            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{data.length} days · HS codes excluded per policy</div>
          </div>
          {loading && <span style={{ fontSize: 12, color: 'var(--text3)', fontFamily: 'DM Mono, monospace' }}>Loading...</span>}
        </div>

        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={340}>
            <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
              <XAxis dataKey="date" tick={{ fill: 'var(--text3)', fontSize: 11, fontFamily: 'DM Mono, monospace' }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fill: 'var(--text3)', fontSize: 11 }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend wrapperStyle={{ fontSize: 13, paddingTop: 12 }} />
              <Line type="monotone" dataKey="hire_rate_sum" stroke="var(--hire-color)" strokeWidth={2} dot={false} name="Hire Rate Sum" />
              <Line type="monotone" dataKey="market_rate_sum" stroke="var(--market-color)" strokeWidth={2} dot={false} name="Market Rate Sum" strokeDasharray="4 2" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div style={{ height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text3)' }}>
            {loading ? 'Fetching data...' : 'No aggregated data for selected range.'}
          </div>
        )}
      </div>
    </div>
  );
}
