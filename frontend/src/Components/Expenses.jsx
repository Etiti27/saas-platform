// ExpenseFormPro.jsx
import React, { useMemo, useState } from 'react';
import {
  CreditCard, Banknote, Wallet2, Landmark,
  AlertCircle, Check, X, Info, Building2, Tags
} from 'lucide-react';
import axios from 'axios';

/* ── Primitives ───────────────────────────────────────── */
const Input = (props) => (
  <input
    {...props}
    className={`w-full rounded-xl border border-[#224765]/20 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-1 ring-transparent focus:ring-2 focus:ring-[#224765] ${props.className || ''}`}
  />
);

const Select = (props) => (
  <select
    {...props}
    className="w-full rounded-xl border border-[#224765]/20 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-1 ring-transparent focus:ring-2 focus:ring-[#224765]"
  />
);

const Textarea = (props) => (
  <textarea
    {...props}
    className="w-full rounded-xl border border-[#224765]/20 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-1 ring-transparent focus:ring-2 focus:ring-[#224765] resize-y"
  />
);

const Card = ({ title, subtitle, right, children, className = '' }) => (
  <section className={`bg-white p-6 rounded-2xl shadow-xl ring-1 ring-[#224765]/10 ${className}`}>
    {(title || subtitle || right) && (
      <div className="mb-4 flex items-end justify-between gap-3 min-w-0">
        <div className="min-w-0">
          {title && <h3 className="text-base font-semibold text-[#224765] break-words">{title}</h3>}
          {subtitle && <div className="text-xs text-[#224765]/70 break-words">{subtitle}</div>}
        </div>
        {right ? <div className="shrink-0">{right}</div> : null}
      </div>
    )}
    {children}
  </section>
);

const SectionTitle = ({ children }) => (
  <div className="text-xs font-semibold tracking-wide uppercase text-[#224765]/70">{children}</div>
);

const Field = ({ label, hint, error, children }) => (
  <div className="py-3">
    <div className="flex items-baseline justify-between">
      <div className="text-sm font-medium text-[#224765]">{label}</div>
      {hint && <div className="text-xs text-[#224765]/70">{hint}</div>}
    </div>
    <div className="mt-2">{children}</div>
    {error ? (
      <div className="mt-1 inline-flex items-center gap-1 text-xs text-red-600">
        <AlertCircle className="h-3.5 w-3.5" /> {error}
      </div>
    ) : null}
  </div>
);

const Segmented = ({ value, onChange, options }) => (
  <div className="inline-flex flex-wrap gap-1 rounded-xl border border-[#224765]/20 bg-white p-1 shadow-sm">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition min-w-0 ${
          value === o.value ? 'bg-[#D3E2FD] text-[#224765]' : 'text-[#224765] hover:bg-[#D3E2FD]/40'
        }`}
      >
        {o.icon ? <o.icon className="h-4 w-4 shrink-0" /> : null}
        <span className="break-words">{o.label}</span>
      </button>
    ))}
  </div>
);

const ChipGroup = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {options.map((o) => {
      const active = o.value === value || o.value === value?.value;
      return (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition min-w-0 break-words ${
            active ? 'bg-[#224765] text-white' : 'bg-[#D3E2FD] text-[#224765] hover:bg-[#D3E2FD]/70'
          }`}
        >
          {o.label}
        </button>
      );
    })}
  </div>
);

const MiniTile = ({ label, value, icon: Icon }) => (
  <div className="rounded-xl border border-[#224765]/10 bg-[#D3E2FD]/30 p-3">
    <div className="flex items-center gap-2 text-xs text-[#224765]/70">
      {Icon ? <Icon className="h-3.5 w-3.5" /> : null}
      {label}
    </div>
    <div className="text-sm font-semibold text-[#224765]">{value ?? '—'}</div>
  </div>
);

const ButtonGhost = ({ children, onClick, icon: Icon }) => (
  <button
    type="button"
    onClick={onClick}
    className="inline-flex items-center justify-center rounded-xl border border-[#224765]/30 bg-white px-4 py-2 text-sm text-[#224765] shadow-sm hover:bg-[#D3E2FD]/40"
  >
    {Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
    {children}
  </button>
);

const ButtonPrimary = ({ children, disabled, type = 'button', icon: Icon }) => (
  <button
    type={type}
    disabled={disabled}
    className="inline-flex items-center justify-center rounded-xl bg-[#224765] px-4 py-2 text-white shadow hover:bg-[#1a3a56] disabled:opacity-50"
  >
    {Icon ? <Icon className="mr-2 h-4 w-4" /> : null}
    {children}
  </button>
);

const fmt = (n, c = 'USD') => {
  const num = Number(n);
  if (!Number.isFinite(num)) return '—';
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: c }).format(num);
};

const APIURL = import.meta.env.VITE_API_URL;

/* ── ExpenseFormPro ───────────────────────────────────── */
export function ExpenseFormPro({
  user,
  currency = 'USD',
  categories = [
    { value: 'supplies', label: 'Supplies' },
    { value: 'utilities', label: 'Utilities' },
    { value: 'rent', label: 'Rent' },
    { value: 'logistics', label: 'Logistics' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'other', label: 'Other' },
  ],
  vendors = [],
  defaultValues = {},
  onSubmit,
  onCancel,
  apiUrl = `${APIURL}/expenses/add_expenses`,
}) {
  const schema = user?.tenant?.schema_name;
  const todayISO = new Date().toISOString().slice(0, 10);

  const [form, setForm] = useState({
    date: defaultValues.date || todayISO,
    vendor_name: defaultValues.vendor_name || '',
    vendor_id: defaultValues.vendor_id || '',
    category: defaultValues.category || 'supplies',
    description: defaultValues.description || '',
    amount: defaultValues.amount ?? '',
    taxMode: defaultValues.taxMode || 'exclusive', // 'exclusive' | 'inclusive' | 'none'
    taxRate: defaultValues.taxRate ?? 7.5,        // %
    method: defaultValues.method || 'Bank Transfer',
    reference: defaultValues.reference || '',
    cost_center: defaultValues.cost_center || '',
    notes: defaultValues.notes || '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);
  const [serverOk, setServerOk] = useState(null);

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const errors = useMemo(() => {
    const e = {};
    const amt = Number(form.amount);
    if (!form.date) e.date = 'Required';
    if (!form.category) e.category = 'Pick a category';
    if (!Number.isFinite(amt) || amt <= 0) e.amount = 'Enter a valid amount';
    if (form.taxMode !== 'none' && (!Number.isFinite(Number(form.taxRate)) || Number(form.taxRate) < 0))
      e.taxRate = 'Invalid tax rate';
    if (!form.vendor_id && !form.vendor_name) e.vendor = 'Select a vendor or type a name';
    return e;
  }, [form]);

  const valid = Object.keys(errors).length === 0;

  const totals = useMemo(() => {
    const amt = Number(form.amount) || 0;
    const rate = (Number(form.taxRate) || 0) / 100;
    if (form.taxMode === 'none') return { base: amt, tax: 0, total: amt };
    if (form.taxMode === 'exclusive') return { base: amt, tax: amt * rate, total: amt + amt * rate };
    // inclusive
    const base = rate > 0 ? amt / (1 + rate) : amt;
    return { base, tax: amt - base, total: amt };
  }, [form.amount, form.taxRate, form.taxMode]);

  const headersBase = schema ? { 'Tenant-Schema': schema } : {};

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (submitting) return;

    // quick guard
    if (!valid) {
      setServerError('Please fix validation errors.');
      return;
    }

    setSubmitting(true);
    setServerError(null);
    setServerOk(null);

    try {
      // map to your Sequelize model fields
      const payload = {
        date:        form.date,
        vendor_name: form.vendor_id ? undefined : form.vendor_name, // allow either id or name
        vendor_id:   form.vendor_id || undefined,

        category:    form.category,
        description: form.description || '',
        amount:      Number(form.amount),

        tax_mode:    form.taxMode,
        tax_rate:    Number(form.taxRate),

        total_net:   Number(totals.base),
        total_tax:   Number(totals.tax),
        total_gross: Number(totals.total),

        currency, // from props
        method:      form.method,
        reference:   form.reference || '',
        cost_center: form.cost_center || '',
        notes:       form.notes || '',
      };
      console.log(payload);

      const res = await axios.post(apiUrl, payload, {
        headers: { ...headersBase, 'Content-Type': 'application/json' },
      });

      if (res.status === 200 || res.status === 201) {
        setServerOk('Expense saved successfully.');
        onSubmit?.(res.data ?? payload);
        // reset
        setForm({
          date: new Date().toISOString().slice(0, 10),
          vendor_name: '',
          vendor_id: '',
          category: 'supplies',
          description: '',
          amount: '',
          taxMode: 'exclusive',
          taxRate: 7.5,
          method: 'Bank Transfer',
          reference: '',
          cost_center: '',
          notes: '',
        });
      } else {
        setServerError(`Unexpected response: ${res.status}`);
      }
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save expense. Please try again.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  /* ── UI ─────────────────────────────────────────────── */
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D3E2FD] via-white to-[#D3E2FD]">
      <div className="mx-auto max-w-6xl px-4 py-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Form */}
          <div className="lg:col-span-8">
            <Card
              title="Record Expense"
              subtitle="Log company expenses with tax handling, categories and metadata"
              right={<Info className="h-5 w-5 text-[#224765]" />}
            >
              {serverOk && (
                <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                  {serverOk}
                </div>
              )}
              {serverError && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                  {serverError}
                </div>
              )}

              <form onSubmit={handleSubmit} noValidate>
                {/* Section: Basics */}
                <div className="mb-2"><SectionTitle>Basics</SectionTitle></div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Date" error={errors.date}>
                    <Input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
                  </Field>

                  <Field label="Vendor" hint={vendors.length ? 'Select from list' : 'Type name'} error={errors.vendor}>
                    {vendors.length ? (
                      <Select value={form.vendor_id} onChange={(e) => set('vendor_id', e.target.value)}>
                        <option value="">Select vendor…</option>
                        {vendors.map((v) => (
                          <option key={v.id} value={v.id}>{v.name}</option>
                        ))}
                      </Select>
                    ) : (
                      <div className="flex gap-2">
                        <Input
                          placeholder="Vendor name"
                          value={form.vendor_name}
                          onChange={(e) => set('vendor_name', e.target.value)}
                        />
                        <span className="inline-flex items-center text-[#224765]/60 text-sm">
                          <Building2 className="h-4 w-4 mr-1" /> Manual
                        </span>
                      </div>
                    )}
                  </Field>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Category" error={errors.category}>
                    <ChipGroup
                      value={form.category}
                      onChange={(v) => set('category', v)}
                      options={categories}
                    />
                  </Field>

                  <Field label="Description" hint="What is this expense for?">
                    <Input
                      placeholder="e.g., Nitrile gloves bulk order"
                      value={form.description}
                      onChange={(e) => set('description', e.target.value)}
                    />
                  </Field>
                </div>

                {/* Section: Amounts & Tax */}
                <div className="mt-4 mb-2"><SectionTitle>Amounts & Tax</SectionTitle></div>
                <Field label="Amount" error={errors.amount}>
                  <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[#224765]/70">
                        {currency}
                      </span>
                      <Input
                        className="pl-12"
                        type="number"
                        step="0.01"
                        min="0"
                        value={form.amount}
                        onChange={(e) => set('amount', e.target.value)}
                      />
                    </div>

                    <Segmented
                      value={form.taxMode}
                      onChange={(v) => set('taxMode', v)}
                      options={[
                        { value: 'exclusive', label: 'Tax exclusive' },
                        { value: 'inclusive', label: 'Tax inclusive' },
                        { value: 'none', label: 'No tax' },
                      ]}
                    />

                    <div className="flex items-center gap-2">
                      <span className="text-sm text-[#224765]/70">Tax rate %</span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        className="max-w-[140px]"
                        value={form.taxRate}
                        onChange={(e) => set('taxRate', e.target.value)}
                      />
                    </div>
                  </div>
                  {errors.taxRate && (
                    <div className="mt-1 inline-flex items-center gap-1 text-xs text-red-600">
                      <AlertCircle className="h-3.5 w-3.5" /> {errors.taxRate}
                    </div>
                  )}
                  <div className="mt-2 text-xs text-[#224765]/70">
                    {form.taxMode === 'exclusive'
                      ? 'Total = Amount + (Amount × Tax %)'
                      : form.taxMode === 'inclusive'
                      ? 'Amount includes tax; Net = Amount ÷ (1 + Tax %)'
                      : 'No tax applied.'}
                  </div>
                </Field>

                {/* Section: Payment & Meta */}
                <div className="mt-4 mb-2"><SectionTitle>Payment & Meta</SectionTitle></div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <Field label="Payment method">
                    <Segmented
                      value={form.method}
                      onChange={(v) => set('method', v)}
                      options={[
                        { value: 'Card', label: 'Card', icon: CreditCard },
                        { value: 'Cash', label: 'Cash', icon: Banknote },
                        { value: 'Online', label: 'Online', icon: Wallet2 },
                        { value: 'Bank Transfer', label: 'Bank', icon: Landmark },
                      ]}
                    />
                  </Field>

                  <Field label="Reference & Cost center" hint="Optional">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <Input
                        placeholder="Reference (e.g., INV-4921)"
                        value={form.reference}
                        onChange={(e) => set('reference', e.target.value)}
                      />
                      <Input
                        placeholder="Cost center (e.g., Clinic-A)"
                        value={form.cost_center}
                        onChange={(e) => set('cost_center', e.target.value)}
                      />
                    </div>
                  </Field>
                </div>

                {/* Section: Notes */}
                <div className="mt-4 mb-2"><SectionTitle>Notes</SectionTitle></div>
                <Field label="Notes">
                  <Textarea
                    rows={4}
                    placeholder="Internal notes…"
                    value={form.notes}
                    onChange={(e) => set('notes', e.target.value)}
                  />
                </Field>

                {/* Sticky actions */}
                <div className="sticky bottom-4 z-10 mt-6">
                  <div className="rounded-xl border border-[#224765]/10 bg-white/90 backdrop-blur p-3 shadow-lg flex flex-wrap items-center justify-end gap-2">
                    <ButtonGhost icon={X} onClick={onCancel}>Cancel</ButtonGhost>
                    <ButtonPrimary type="submit" disabled={!valid || submitting} icon={Check}>
                      {submitting ? 'Saving…' : 'Save Expense'}
                    </ButtonPrimary>
                  </div>
                </div>
              </form>
            </Card>
          </div>

          {/* Right: Summary */}
          <div className="lg:col-span-4">
            <Card title="Summary" subtitle="Quick view of computed totals">
              <div className="grid grid-cols-1 gap-3">
                <MiniTile label="Net (before tax)" value={fmt(totals.base, currency)} icon={Tags} />
                <MiniTile label="Tax" value={fmt(totals.tax, currency)} icon={Info} />
                <MiniTile label="Total (payable)" value={fmt(totals.total, currency)} icon={Wallet2} />
              </div>
              <div className="mt-4 grid grid-cols-1 gap-3">
                <MiniTile label="Date" value={form.date || '—'} />
                <MiniTile
                  label="Vendor"
                  value={
                    form.vendor_id
                      ? (vendors.find(v => v.id === form.vendor_id)?.name || form.vendor_id)
                      : (form.vendor_name || '—')
                  }
                />
                <MiniTile
                  label="Category"
                  value={categories.find(c => c.value === form.category)?.label || form.category}
                />
                <MiniTile label="Method" value={form.method} />
                <MiniTile label="Reference" value={form.reference || '—'} />
                <MiniTile label="Cost center" value={form.cost_center || '—'} />
              </div>
              <div className="mt-4 rounded-xl border border-[#224765]/10 bg-white p-3 text-xs text-[#224765]/80">
                Tip: attach invoices/receipts in your accounting export.
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ExpenseFormPro;
