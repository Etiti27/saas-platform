// MinimalSettings.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { X, Save, Loader2 } from 'lucide-react';

const COUNTRIES = [
  'Nigeria','Ghana','Kenya','South Africa','United Kingdom','United States','Netherlands','Germany','France','Canada'
];
const CURRENCIES = ['USD','EUR','GBP','NGN','KES','ZAR','GHS','CAD'];

export function MinimalSettings({
  user,
  open = true,
  onClose = () => {},
  baseUrl = 'http://localhost:3001',
  changePasswordEndpoint, // optional override
}) {
  const schema = user?.tenant?.schema_name;
  const userId = user?.id;

  const [country, setCountry] = useState('');
  const [currency, setCurrency] = useState('USD');

  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');

  const [loading, setLoading] = useState(false);
  const [savingPrefs, setSavingPrefs] = useState(false);
  const [savingPw, setSavingPw] = useState(false);
  const [msg, setMsg] = useState(null);
  const [err, setErr] = useState(null);

  // stable endpoints computed inside render (primitives, not functions)
  const prefsUrl = userId ? `${baseUrl}/api/user-prefs/${userId}` : null;
  const changePwUrl = changePasswordEndpoint || `${baseUrl}/api/account/change-password`;

  // lock scroll when open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // fetch current prefs (country/currency)
  useEffect(() => {
    if (!open || !schema || !userId || !prefsUrl) return;
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoading(true); setErr(null);
        const { data } = await axios.get(prefsUrl, {
          headers: { 'Tenant-Schema': schema },
          signal: ctrl.signal,
        });
        const val = data?.value || {};
        if (val.country) setCountry(val.country);
        if (val.currency) setCurrency(val.currency);
      } catch (e) {
        if (e.code !== 'ERR_CANCELED') setErr(e?.message || 'Failed to load settings');
      } finally {
        setLoading(false);
      }
    })();
    return () => ctrl.abort();
    // ✅ no function deps here; stable primitives only
  }, [open, schema, userId, prefsUrl]);

  const savePrefs = async () => {
    try {
      setSavingPrefs(true); setMsg(null); setErr(null);
      await axios.put(
        prefsUrl,
        { value: { country, currency } },
        { headers: { 'Tenant-Schema': schema } }
      );
      setMsg('Preferences updated.');
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || 'Failed to save preferences');
    } finally {
      setSavingPrefs(false);
    }
  };

  const changePassword = async () => {
    setMsg(null); setErr(null);
    if (!currentPw || !newPw) return setErr('Enter current and new password.');
    if (newPw.length < 8) return setErr('New password must be at least 8 characters.');
    if (newPw !== confirmPw) return setErr('New passwords do not match.');

    try {
      setSavingPw(true);
      await axios.post(
        changePwUrl,
        { currentPassword: currentPw, newPassword: newPw },
        { headers: { 'Tenant-Schema': schema } }
      );
      setMsg('Password changed successfully.');
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || 'Failed to change password');
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className={`fixed inset-0 z-50 ${open ? 'pointer-events-auto' : 'pointer-events-none'}`} aria-hidden={!open}>
      <div className={`absolute inset-0 bg-black/40 transition-opacity ${open ? 'opacity-100' : 'opacity-0'}`} onClick={onClose} />
      <div className="absolute inset-y-0 right-0 flex max-w-full">
        <div className={`w-screen max-w-lg transform transition-transform duration-300 ease-out ${open ? 'translate-x-0' : 'translate-x-full'}`} role="dialog" aria-modal="true" aria-label="Settings">
          <div className="flex h-full flex-col bg-white shadow-xl ring-1 ring-[#224765]/10 rounded-l-2xl">
            <div className="relative bg-[#224765] text-white px-6 py-4 rounded-tl-2xl">
              <h2 className="text-lg font-semibold">Quick Settings</h2>
              <p className="text-xs opacity-90">Change password, country & currency</p>
              <button onClick={onClose} className="absolute top-3 right-3 rounded-lg bg-white/10 p-1 hover:bg-white/20" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {loading ? (
                <div className="grid h-40 place-content-center text-[#224765]">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : (
                <>
                  {msg && <div className="mb-3 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">{msg}</div>}
                  {err && <div className="mb-3 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{err}</div>}

                  <section className="mb-6">
                    <h3 className="text-sm font-semibold text-[#224765] mb-3">Profile</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#224765]">Country</label>
                        <select value={country} onChange={(e) => setCountry(e.target.value)} className="mt-1 w-full rounded-xl border border-[#224765]/20 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#224765]">
                          <option value="">Select country…</option>
                          {COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-[#224765]">Currency</label>
                        <select value={currency} onChange={(e) => setCurrency(e.target.value)} className="mt-1 w-full rounded-xl border border-[#224765]/20 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#224765]">
                          {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div className="flex justify-end">
                        <button type="button" onClick={savePrefs} disabled={savingPrefs} className="inline-flex items-center rounded-xl bg-[#224765] px-4 py-2 text-white shadow hover:bg-[#1b3a55] disabled:opacity-50">
                          {savingPrefs ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                          Save Preferences
                        </button>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-sm font-semibold text-[#224765] mb-3">Change Password</h3>
                    <div className="grid grid-cols-1 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-[#224765]">Current password</label>
                        <input type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} className="mt-1 w-full rounded-xl border border-[#224765]/20 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#224765]" />
                      </div>
                      <div className="grid sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-[#224765]">New password</label>
                          <input type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} className="mt-1 w-full rounded-xl border border-[#224765]/20 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#224765]" />
                          <p className="mt-1 text-xs text-[#224765]/70">Min 8 characters.</p>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-[#224765]">Confirm new password</label>
                          <input type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} className="mt-1 w-full rounded-xl border border-[#224765]/20 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#224765]" />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button type="button" onClick={changePassword} disabled={savingPw} className="inline-flex items-center rounded-xl bg-[#224765] px-4 py-2 text-white shadow hover:bg-[#1b3a55] disabled:opacity-50">
                          {savingPw ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                          Update Password
                        </button>
                      </div>
                    </div>
                  </section>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
