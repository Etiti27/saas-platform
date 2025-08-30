import React, { useMemo, useState, useEffect } from 'react';
import {
  LineChart, Line, PieChart, Pie, Cell,
  BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { DollarSign, ShoppingCart, Package, Users, AlertTriangle, Download, Activity, CalendarDays, RotateCcw } from 'lucide-react';

import { ChipBtn } from "./ChipBtn";

export const Progress = ({ value, tone='light' }) => (
    <div className={`h-2 w-48 overflow-hidden rounded-full ${tone==='dark' ? 'bg-slate-700' : 'bg-[#224765]/10'}`}>
      <div className={`h-full ${tone==='dark' ? 'bg-slate-200' : 'bg-[#224765]'} transition-all`} style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
    </div>
  );
  
  export const Toolbar = ({ timeframe, setTimeframe, enableDownloads, onExportCSV, toggles, setToggles, tone='light' }) => (
    <div className="flex flex-wrap items-center gap-2">
      {/* <ChipBtn tone={tone} active={timeframe==='7d'} onClick={() => setTimeframe('7d')}>7d</ChipBtn> */}
      {/* <ChipBtn tone={tone} active={timeframe==='30d'} onClick={() => setTimeframe('30d')}>30d</ChipBtn> */}
      {/* <ChipBtn tone={tone} active={timeframe==='ytd'} onClick={() => setTimeframe('ytd')}>YTD</ChipBtn> */}
      <div className="mx-2 h-4 w-px bg-black/10 dark:bg-white/20" />
      {/* <ChipBtn tone={tone} active={toggles.sma} onClick={() => setToggles(v => ({...v, sma: !v.sma}))}>SMA</ChipBtn> */}
      {/* <ChipBtn tone={tone} active={toggles.comparePrev} onClick={() => setToggles(v => ({...v, comparePrev: !v.comparePrev}))}>Compare</ChipBtn> */}
      {enableDownloads && (
        <button
          onClick={onExportCSV}
          className={`ml-2 inline-flex items-center gap-2 rounded-lg border px-3 py-1.5 text-xs ${
            tone==='dark' ? 'border-slate-600 text-slate-100 hover:bg-slate-800' : 'border-[#224765]/20 text-[#224765] hover:bg-[#D3E2FD]/40'
          }`}
        >
          <Download className="h-3.5 w-3.5" /> Export CSV
        </button>
      )}
    </div>
  );
  
  export const DateRangeInline = ({ value, onChange, tone='light' }) => (
    <div className="flex items-center gap-2 text-sm">
      <CalendarDays className={`h-4 w-4 ${tone==='dark' ? 'text-slate-200' : 'text-[#224765]'}`} />
      <input
        type="date"
        className={`rounded-lg border px-2 py-1 ${tone==='dark' ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-[#224765]/20'}`}
        value={value?.from || ''}
        onChange={(e) => onChange?.({ ...value, from: e.target.value })}
      />
      <span className={tone==='dark' ? 'text-slate-300' : 'text-[#224765]/60'}>to</span>
      <input
        type="date"
        className={`rounded-lg border px-2 py-1 ${tone==='dark' ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-[#224765]/20'}`}
        value={value?.to || ''}
        onChange={(e) => onChange?.({ ...value, to: e.target.value })}
      />
      <button
        type="button"
        className={`ml-1 inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs ${
          tone==='dark' ? 'border-slate-600 text-slate-100 hover:bg-slate-800' : 'border-[#224765]/20 text-[#224765] hover:bg-[#D3E2FD]/40'
        }`}
        onClick={() => onChange?.({ from: '', to: '' })}
        title="Clear"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Reset
      </button>
    </div>
  );

  export const Section = ({ title, subtitle, right, children, tone='light' }) => (
    <section className={`rounded-2xl border ${tone==='dark' ? 'border-slate-700 bg-slate-800 text-slate-100' : 'border-[#224765]/10 bg-white text-[#224765]'} p-5 shadow-sm`}>
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          {title && <h2 className="text-base font-semibold">{title}</h2>}
          {subtitle && <p className={`${tone==='dark' ? 'text-slate-300' : 'text-[#224765]/70'} text-xs`}>{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );

  export const KPICard = ({ icon: Icon, label, value, tone = 'light', className = '' }) => {
    const isDark = tone === 'dark';
    return (
      <div
        className={[
          'h-full w-full',
          'flex flex-col items-center justify-center gap-3',
          'rounded-2xl p-4 shadow-sm',
          isDark ? 'border border-slate-700 bg-slate-800' : 'border border-[#224765]/10 bg-white',
          className,
        ].join(' ')}
      >
        <div
          className={[
            'grid h-12 w-12 place-content-center rounded-xl ring-1',
            isDark ? 'ring-slate-600 bg-slate-700' : 'ring-[#224765]/20 bg-[#D3E2FD]/50',
          ].join(' ')}
        >
          {Icon ? <Icon className={['h-6 w-6', isDark ? 'text-slate-200' : 'text-[#224765]'].join(' ')} /> : null}
        </div>
  
        <div className="min-w-0 text-center">
          <div className={['text-xs', isDark ? 'text-slate-300' : 'text-[#224765]/70'].join(' ')}>{label}</div>
          <div className={['truncate text-lg font-semibold', isDark ? 'text-white' : 'text-[#224765]'].join(' ')}>
            {value}
          </div>
        </div>
      </div>
    );
  };
  
  

  export const Card = ({ title, subtitle, children, right }) => (
    <section className="rounded-2xl border border-[#224765]/10 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          {title && <h2 className="text-base font-semibold text-[#224765]">{title}</h2>}
          {subtitle && <p className="text-xs text-[#224765]/70">{subtitle}</p>}
        </div>
        {right}
      </div>
      {children}
    </section>
  );
  export const fmtMoney = (n, currency = 'USD') => {
    const f = new Intl.NumberFormat(undefined, { style: 'currency', currency });
    const num = Number(n);
    return Number.isFinite(num) ? f.format(num) : '—';
  };
  

  export const SimpleTable = ({ columns, rows, empty = 'No data', tone='light' }) => (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className={`border-b ${tone==='dark' ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-[#224765]/10 bg-[#D3E2FD]/30 text-[#224765]'}`}>
            {columns.map((c) => (
              <th key={c.key || c.header} className="px-3 py-2 font-medium">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows?.length ? rows.map((r, i) => (
            <tr key={i} className={`border-b ${tone==='dark' ? 'border-slate-700 hover:bg-slate-800/60' : 'border-[#224765]/10 hover:bg-[#D3E2FD]/10'}`}>
              {columns.map((c) => (
                <td key={c.key || c.header} className="px-3 py-2">
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          )) : (
            <tr><td colSpan={columns.length} className={`px-3 py-6 text-center ${tone==='dark' ? 'text-slate-400' : 'text-[#224765]/60'}`}>{empty}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );