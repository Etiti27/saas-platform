// SettingsPage.jsx
import React, { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  Cog, Monitor, Palette, Database, Bell, Shield,
  Save, RotateCcw, ChevronRight, Check, Loader2
} from 'lucide-react';

import { Card } from './Services';

/* ===========================
   Small UI helpers
   =========================== */

const Row = ({ label, hint, children }) => (
  <div className="grid grid-cols-1 gap-2 sm:grid-cols-3 sm:gap-6 py-3">
    <div>
      <div className="text-sm font-medium text-[#224765]">{label}</div>
      {hint && <div className="text-xs text-[#224765]/70">{hint}</div>}
    </div>
    <div className="sm:col-span-2">{children}</div>
  </div>
);

const Toggle = ({ checked, onChange, label }) => (
  <label className="group inline-flex items-center gap-3 cursor-pointer">
    <span
      className={`relative h-6 w-10 rounded-full transition ${
        checked ? 'bg-[#224765]' : 'bg-gray-300'
      }`}
      onClick={() => onChange(!checked)}
    >
      <span
        className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white shadow transition ${
          checked ? 'translate-x-4' : ''
        }`}
      />
    </span>
    <span className="text-sm text-[#224765]">{label}</span>
  </label>
);

const Input = (props) => (
  <input
    {...props}
    className={
      'w-full rounded-xl border border-[#224765]/20 bg-white px-3 py-2 text-sm outline-none ring-1 ring-transparent focus:ring-2 focus:ring-[#224765] ' +
      (props.className || '')
    }
  />
);

const Select = ({ value, onChange, children }) => (
  <select
    value={value}
    onChange={(e) => onChange?.(e.target.value)}
    className="w-full rounded-xl border border-[#224765]/20 bg-white px-3 py-2 text-sm outline-none ring-1 ring-transparent focus:ring-2 focus:ring-[#224765]"
  >
    {children}
  </select>
);

const SectionLabel = ({ icon: Icon, children }) => (
  <div className="flex items-center gap-2 text-xs uppercase tracking-wide text-[#224765]/70">
    <Icon className="h-3.5 w-3.5" />
    {children}
  </div>
);

const Btn = ({ tone = 'primary', icon: Icon, children, ...rest }) => {
  const base =
    'inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm transition shadow-sm';
  const tones = {
    primary: 'bg-[#224765] text-white hover:bg-[#1b3951]',
    ghost:
      'border border-[#224765]/30 text-[#224765] hover:bg-[#D3E2FD]/40 bg-white',
    danger:
      'bg-red-600 text-white hover:bg-red-700',
  };
  return (
    <button {...rest} className={`${base} ${tones[tone]}`}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
};

const Divider = () => <div className="my-4 h-px bg-[#224765]/10" />;

/* ===========================
   Defaults & Merge helpers
   =========================== */
const defaultPrefs = {
  theme: 'light', // 'light' | 'dark' | 'system'
  density: 'comfortable', // 'compact' | 'comfortable'
  currency: 'USD',
  timezone: 'Africa/Lagos',
  defaultRange: { from: '', to: '' },
  notifications: { email: true, inApp: true, sms: false, weeklyDigest: true },
  sections: {
    revenueTrend: true,
    payments: false,
    ordersTrend: true,
    revenueByCategory: true,
    customerSegments: true,
    topProducts: true,
    lowStock: true,
    employeeLeaderboard: true,
    recommendations: true,
    profitByDate: true,
    salesOnDate: true,
    refunds: true,
  },
  security: { sessionTimeoutMin: 60, require2FA: false },
};

const deepMerge = (a, b) => {
  if (Array.isArray(a) || Array.isArray(b)) return b ?? a;
  if (typeof a === 'object' && typeof b === 'object') {
    const out = { ...a };
    for (const k of Object.keys(b)) out[k] = deepMerge(a?.[k], b[k]);
    return out;
  }
  return b ?? a;
};

/* ===========================
   API helpers
   =========================== */
async function apiGetSettings({ baseUrl, schema, userId, signal }) {
  // try user-specific first; fallback to org defaults if your API exposes it
  const { data } = await axios.get(`${baseUrl}/api/user-prefs/${userId}`, {
    headers: { 'Tenant-Schema': schema },
    signal,
  });
  return data; // entire row { user_id, value, version, ... }
}

async function apiUpsertSettings({ baseUrl, schema, userId, value }) {
  // choose PUT to replace or PATCH to merge; here we replace whole doc
  const { data } = await axios.put(
    `${baseUrl}/api/user-prefs/${userId}`,
    { value },
    { headers: { 'Tenant-Schema': schema } }
  );
  return data;
}




export const ShowSetting = ({ user, setSettingPrev, baseUrl = 'http://localhost:3001' }) => {
  const schema = user?.tenant?.schema_name;
  const userId = user?.id;

  const [tab, setTab] = useState('general'); // 'general' | 'dashboard' | 'notifications' | 'advanced'
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [prefs, setPrefs] = useState(defaultPrefs);
  const [serverRow, setServerRow] = useState(null);

  // Load settings
  useEffect(() => {
    if (!schema || !userId) return;
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const row = await apiGetSettings({ baseUrl, schema, userId, signal: controller.signal });
        const merged = deepMerge(defaultPrefs, row?.value || {});
        setPrefs(merged);
        setServerRow(row);
      } catch (e) {
        if (e.code !== 'ERR_CANCELED') setError(e);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [schema, userId, baseUrl]);

  const onSave = async () => {
    try {
      setSaving(true);
      const row = await apiUpsertSettings({ baseUrl, schema, userId, value: prefs });
      setServerRow(row);
    } catch (e) {
      setError(e);
    } finally {
      setSaving(false);
    }
  };

  const onReset = () => setPrefs(defaultPrefs);

  const SectionToggle = ({ k, label }) => (
    <Toggle
      checked={!!prefs.sections[k]}
      onChange={(v) => setPrefs((p) => ({ ...p, sections: { ...p.sections, [k]: v } }))}
      label={label}
    />
  );

  const saveBar = (
    <div className="sticky bottom-0 z-10 -mx-5 -mb-5 border-t border-[#224765]/10 bg-white/80 backdrop-blur p-4 flex items-center justify-end gap-2">
      <Btn tone="ghost" icon={RotateCcw} onClick={onReset}>Reset to defaults</Btn>
      <Btn tone="primary" icon={saving ? Loader2 : Save} onClick={onSave} disabled={saving}>
        {saving ? 'Saving…' : 'Save changes'}
      </Btn>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 p-4 sm:p-6 md:p-8 flex items-center justify-center">
      <div className="relative w-full max-w-6xl rounded-2xl bg-white shadow-xl">
        {/* Close */}
        <div className='p-2'>
        <button
          onClick={() => { setSettingPrev(false); window.location.reload(); }}
          className="absolute top-3 right-3 text-gray-500 hover:text-red-500"
          data-html2canvas-ignore="true"
          aria-label="Close settings"
        >
          ✕
        </button>
        </div>

        {/* Scrollable content container */}
        <div className="max-h-[90vh] overflow-y-auto p-6 rounded-2xl">
          {/* Optional soft backdrop inside the card */}
          <div className="w-full rounded-xl bg-gradient-to-br from-[#D3E2FD] via-white to-[#D3E2FD] p-0">
            <div className="mx-auto max-w-7xl p-0">
              {/* Header */}
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-bold tracking-tight text-[#224765]">Settings</h1>
                  <p className="text-sm text-[#224765]/70">Personalize your experience and defaults.</p>
                </div>
                {/* Show save bar on all sizes now */}
                <div>{saveBar}</div>
              </div>

              {/* Layout */}
              <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* Sidebar */}
                <aside className="lg:col-span-3">
                  <nav className="rounded-2xl border border-[#224765]/10 bg-white p-3 shadow-sm">
                    <SidebarItem active={tab === 'general'}       onClick={() => setTab('general')}       icon={Palette} label="General" />
                    <SidebarItem active={tab === 'dashboard'}     onClick={() => setTab('dashboard')}     icon={Monitor} label="Dashboard" />
                    <SidebarItem active={tab === 'notifications'} onClick={() => setTab('notifications')} icon={Bell}    label="Notifications" />
                    <SidebarItem active={tab === 'advanced'}      onClick={() => setTab('advanced')}      icon={Shield}  label="Advanced" />
                  </nav>

                  <div className="mt-4 rounded-2xl border border-[#224765]/10 bg-white p-4 text-xs text-[#224765]/70 shadow-sm">
                    <SectionLabel icon={Database}>Storage</SectionLabel>
                    <div className="mt-2 space-y-1">
                      <div>Tenant: <span className="font-medium text-[#224765]">{schema || '—'}</span></div>
                      <div>User ID: <span className="font-medium text-[#224765]">{userId || '—'}</span></div>
                      <div>Version: <span className="font-medium text-[#224765]">{serverRow?.version ?? '—'}</span></div>
                    </div>
                  </div>
                </aside>

                {/* Content */}
                <main className="lg:col-span-9">
                  {loading ? (
                    <div className="grid h-64 place-content-center text-[#224765]">
                      <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                  ) : error ? (
                    <Card title="Error" subtitle="Could not load settings">
                      <div className="text-sm text-red-600">{String(error.message || error)}</div>
                    </Card>
                  ) : (
                    <>
                      {tab === 'general' && (
                        <Card title="General" subtitle="Theme, density, currency, timezone" right={<Cog className="h-4 w-4 text-[#224765]" />}>
                          <Row label="Theme" hint="Appearance across dashboard">
                            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                              <RadioTile checked={prefs.theme === 'light'}  onChange={() => setPrefs(p => ({ ...p, theme: 'light' }))}  title="Light"  hint="Bright surfaces" />
                              <RadioTile checked={prefs.theme === 'dark'}   onChange={() => setPrefs(p => ({ ...p, theme: 'dark' }))}   title="Dark"   hint="Low-light friendly" />
                              <RadioTile checked={prefs.theme === 'system'} onChange={() => setPrefs(p => ({ ...p, theme: 'system' }))} title="System" hint="Follow OS" />
                            </div>
                          </Row>

                          <Divider />

                          <Row label="Density" hint="Control spacing and compactness">
                            <div className="flex gap-3">
                              <Toggle
                                checked={prefs.density === 'compact'}
                                onChange={(v) => setPrefs(p => ({ ...p, density: v ? 'compact' : 'comfortable' }))}
                                label={prefs.density === 'compact' ? 'Compact' : 'Comfortable'}
                              />
                            </div>
                          </Row>

                          <Row label="Currency" hint="Display for monetary values">
                            <div className="max-w-xs">
                              <Select value={prefs.currency} onChange={(v) => setPrefs(p => ({ ...p, currency: v }))}>
                                {['USD','EUR','GBP','NGN','KES','ZAR'].map((c) => (
                                  <option key={c} value={c}>{c}</option>
                                ))}
                              </Select>
                            </div>
                          </Row>

                          <Row label="Timezone" hint="Impacts date rendering & reports">
                            <Input
                              value={prefs.timezone}
                              onChange={(e) => setPrefs(p => ({ ...p, timezone: e.target.value }))}
                              placeholder="e.g., Africa/Lagos"
                            />
                          </Row>

                          <Row label="Default date range" hint="Used across reports when none selected">
                            <div className="flex flex-wrap items-center gap-2">
                              <Input
                                type="date"
                                value={prefs.defaultRange.from || ''}
                                onChange={(e) => setPrefs(p => ({ ...p, defaultRange: { ...p.defaultRange, from: e.target.value } }))}
                                className="max-w-xs"
                              />
                              <span className="text-[#224765]/60">to</span>
                              <Input
                                type="date"
                                value={prefs.defaultRange.to || ''}
                                onChange={(e) => setPrefs(p => ({ ...p, defaultRange: { ...p.defaultRange, to: e.target.value } }))}
                                className="max-w-xs"
                              />
                            </div>
                          </Row>

                          <div className="mt-4">{saveBar}</div>
                        </Card>
                      )}

                      {tab === 'dashboard' && (
                        <Card title="Dashboard Sections" subtitle="Choose what appears on your home dashboard">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <SectionToggle k="revenueTrend" label="Revenue Trend" />
                            <SectionToggle k="ordersTrend" label="Orders Trend" />
                            <SectionToggle k="payments" label="Payments Breakdown" />
                            <SectionToggle k="revenueByCategory" label="Revenue by Category" />
                            <SectionToggle k="customerSegments" label="Customer Segments" />
                            <SectionToggle k="topProducts" label="Top Products" />
                            <SectionToggle k="lowStock" label="Low Stock" />
                            <SectionToggle k="employeeLeaderboard" label="Sales by Employee" />
                            <SectionToggle k="recommendations" label="Recommendations" />
                            <SectionToggle k="profitByDate" label="Profit by Date (filterable)" />
                            <SectionToggle k="salesOnDate" label="Sales on Specific Date" />
                            <SectionToggle k="refunds" label="Refunds Panel" />
                          </div>
                          <div className="mt-4">{saveBar}</div>
                        </Card>
                      )}

                      {tab === 'notifications' && (
                        <Card title="Notifications" subtitle="Where and how often you get notified">
                          <Row label="Channels" hint="Pick how we reach you">
                            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                              <Toggle checked={!!prefs.notifications.email}    onChange={(v)=> setPrefs(p => ({ ...p, notifications: { ...p.notifications, email: v } }))} label="Email" />
                              <Toggle checked={!!prefs.notifications.inApp}    onChange={(v)=> setPrefs(p => ({ ...p, notifications: { ...p.notifications, inApp: v } }))} label="In-app" />
                              <Toggle checked={!!prefs.notifications.sms}      onChange={(v)=> setPrefs(p => ({ ...p, notifications: { ...p.notifications, sms: v } }))} label="SMS" />
                            </div>
                          </Row>
                          <Row label="Digest" hint="Periodic summary of key metrics">
                            <Toggle
                              checked={!!prefs.notifications.weeklyDigest}
                              onChange={(v)=> setPrefs(p => ({ ...p, notifications: { ...p.notifications, weeklyDigest: v } }))}
                              label="Weekly digest"
                            />
                          </Row>
                          <div className="mt-4">{saveBar}</div>
                        </Card>
                      )}

                      {tab === 'advanced' && (
                        <Card title="Advanced" subtitle="Security & session preferences">
                          <Row label="Session timeout" hint="Auto sign-out after inactivity (minutes)">
                            <div className="max-w-xs">
                              <Input
                                type="number"
                                min={5}
                                value={prefs.security.sessionTimeoutMin}
                                onChange={(e)=> setPrefs(p => ({ ...p, security: { ...p.security, sessionTimeoutMin: Number(e.target.value || 0) } }))}
                              />
                            </div>
                          </Row>
                          <Row label="Two-factor auth (2FA)" hint="Require 2FA for sign-in">
                            <Toggle
                              checked={!!prefs.security.require2FA}
                              onChange={(v)=> setPrefs(p => ({ ...p, security: { ...p.security, require2FA: v } }))}
                              label={prefs.security.require2FA ? 'Required' : 'Optional'}
                            />
                          </Row>
                          <div className="mt-4">{saveBar}</div>
                        </Card>
                      )}
                    </>
                  )}
                </main>
              </div>
            </div>
          </div>
        </div>
        {/* /scrollable content */}
      </div>
    </div>
  );
};



/* ===========================
   Sidebar item & Radio tile
   =========================== */
   function SidebarItem({ active, icon: Icon, label, onClick }) {
    return (
      <button
        onClick={onClick}
        className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-sm ${
          active
            ? 'bg-[#D3E2FD] text-[#224765] font-medium'
            : 'text-[#224765] hover:bg-[#D3E2FD]/40'
        }`}
      >
        <span className="inline-flex items-center gap-2">
          <Icon className="h-4 w-4" />
          {label}
        </span>
        <ChevronRight className="h-4 w-4 opacity-60" />
      </button>
    );
  }
  
  function RadioTile({ checked, onChange, title, hint }) {
    return (
      <label
        className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
          checked
            ? 'border-[#224765] bg-[#D3E2FD]/40'
            : 'border-[#224765]/20 hover:bg-[#D3E2FD]/20'
        }`}
        onClick={() => onChange?.(true)}
      >
        <span
          className={`grid h-5 w-5 place-content-center rounded-full ring-1 ${
            checked ? 'bg-[#224765] ring-[#224765]' : 'bg-white ring-[#224765]/40'
          }`}
        >
          {checked ? <Check className="h-3 w-3 text-white" /> : null}
        </span>
        <div>
          <div className="text-sm font-medium text-[#224765]">{title}</div>
          {hint && <div className="text-xs text-[#224765]/70">{hint}</div>}
        </div>
      </label>
    );
  }
  
