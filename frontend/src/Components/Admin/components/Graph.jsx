// TimeSeriesChart.jsx (hardened)
import React from 'react';
import {
  ResponsiveContainer, ComposedChart, Area, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

const COLORS = ['#224765','#4C7DB5','#7FA4D0','#A9C0E0','#C8D6EE','#92AECC'];

function pickArray(src) {
  if (Array.isArray(src)) return src;
  if (Array.isArray(src?.rows)) return src.rows;
  if (Array.isArray(src?.data)) return src.data;
  return [];
}

export function TimeSeriesChart({
  title,
  subtitle,
  data,
  xKey = 'date',
  series = [],                 // [{ key, name?, kind?: 'line'|'area', color? }]
  height = 260,
  yFormat = (n) => String(n),
  tone = 'light',
  className = '',
}) {
  // normalize: pick array and coerce numeric series keys
  const raw = pickArray(data);
  const numericKeys = series.map(s => s.key);
  const safeData = raw.map(row => {
    const out = { ...row };
    for (const k of numericKeys) out[k] = Number(row?.[k]) || 0;
    return out;
  });

  const areaSeries = series
    .map((s, i) => ({ ...s, color: s.color || COLORS[i % COLORS.length] }))
    .filter(s => (s.kind || 'line') === 'area');

  const lineSeries = series
    .map((s, i) => ({ ...s, color: s.color || COLORS[i % COLORS.length] }))
    .filter(s => (s.kind || 'line') === 'line');

  return (
    <section className={`bg-white p-5 rounded-2xl shadow-xl ring-1 ring-[#224765]/10 ${className}`}>
      {(title || subtitle) && (
        <div className="mb-3">
          {title && <h3 className="text-base font-semibold text-[#224765]">{title}</h3>}
          {subtitle && <div className="text-xs text-[#224765]/70">{subtitle}</div>}
        </div>
      )}
      

      <div style={{ width: '100%', height }}>
        <ResponsiveContainer>
          <ComposedChart data={safeData}>
            <defs>
              {areaSeries.map((s, idx) => (
                <linearGradient key={`g-${s.key}-${idx}`} id={`g-${s.key}-${idx}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={tone==='dark' ? '#233043' : '#e5edf9'} />
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke={tone==='dark' ? '#93a4bf' : '#9bb1d6'} />
            <YAxis tickFormatter={yFormat} tick={{ fontSize: 12 }} stroke={tone==='dark' ? '#93a4bf' : '#9bb1d6'} />
            <Tooltip formatter={(v) => Number.isFinite(+v) ? yFormat(+v) : v} />
            <Legend />

            {areaSeries.map((s, idx) => (
              <Area
                key={`area-${s.key}-${idx}`}
                type="monotone"
                dataKey={s.key}
                name={s.name || s.key}
                stroke={s.color}
                fill={`url(#g-${s.key}-${idx})`}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}

            {lineSeries.map((s, idx) => (
              <Line
                key={`line-${s.key}-${idx}`}
                type="monotone"
                dataKey={s.key}
                name={s.name || s.key}
                stroke={s.color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
