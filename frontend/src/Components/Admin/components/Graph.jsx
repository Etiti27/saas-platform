// TimeSeriesChart.jsx (hardened)
import React from 'react';

import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  Legend,
  Tooltip,
  CartesianGrid,
  BarChart,
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
  series = [],                 // [{ key, name?, kind?: 'line'|'area'|'bar'|'barchart', color? }]
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

  const barSeries = series
    .map((s, i) => ({ ...s, color: s.color || COLORS[i % COLORS.length] }))
    .filter(s => (s.kind || 'line') === 'bar');

  const barChartSeries = series
    .map((s, i) => ({ ...s, color: s.color || COLORS[i % COLORS.length] }))
    .filter(s => (s.kind || 'line') === 'barchart');

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
              {/* Gradient for area */}
              {areaSeries.map((s, idx) => (
                <linearGradient key={`g-${s.key}-${idx}`} id={`g-${s.key}-${idx}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={s.color} stopOpacity={0.35} />
                  <stop offset="95%" stopColor={s.color} stopOpacity={0.02} />
                </linearGradient>
              ))}
              {/* Gradient for bars (so they’re not black) */}
              {barSeries.map((s, idx) => (
                <linearGradient key={`gb-${s.key}-${idx}`} id={`gb-${s.key}-${idx}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={s.color} stopOpacity={0.95} />
                  <stop offset="100%" stopColor={s.color} stopOpacity={0.35} />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke={tone === 'dark' ? '#233043' : '#e5edf9'} />
            <XAxis dataKey={xKey} tick={{ fontSize: 12 }} stroke={tone === 'dark' ? '#93a4bf' : '#9bb1d6'} />
            <YAxis tickFormatter={yFormat} tick={{ fontSize: 12 }} stroke={tone === 'dark' ? '#93a4bf' : '#9bb1d6'} />
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

            {/* ✅ Bars now use your palette + gradient; added barSize and rounded top */}
            {barSeries.map((s, idx) => (
              <Bar
                key={`bar-${s.key}-${idx}`}
                dataKey={s.key}
                name={s.name || s.key}
                fill={`url(#gb-${s.key}-${idx})`}
                stroke={s.color}
                barSize={28}
                radius={[6, 6, 0, 0]}
                isAnimationActive={false}
                background={{ fill: tone === 'dark' ? '#0f172a' : '#eef4ff' }}
              />
            ))}

            {/* Keeping your 'barchart' branch as-is (not used for normal 'bar') */}
            {barChartSeries.map((s, idx) => (
              <BarChart
                key={`bar-${s.key}-${idx}`}
                // NOTE: <BarChart> is not typically nested inside <ComposedChart>.
                // Left intact to avoid changing your behavior if you're using 'barchart'.
              />
            ))}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
