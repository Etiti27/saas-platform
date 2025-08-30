import React, { useMemo, useState } from 'react';
import {
  CreditCard, Banknote, Wallet2, Landmark, FileDown,
  AlertCircle, Check, X, Info, Building2, Tags
} from 'lucide-react';
import axios from 'axios';

/* ────────────────────────────────────────────────────────────
   PRIMITIVES (brand-styled)
   ──────────────────────────────────────────────────────────── */
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

const Field = ({ label, hint, error, children }) => (
  <div className="py-3 grid grid-cols-1 gap-2 md:grid-cols-12 md:gap-6">
    <div className="md:col-span-4 min-w-0">
      <div className="text-sm font-medium text-[#224765] break-words">{label}</div>
      {hint && <div className="text-xs text-[#224765]/70 break-words">{hint}</div>}
    </div>
    <div className="md:col-span-8 min-w-0">
      {children}
      {error ? (
        <div className="mt-1 inline-flex items-center gap-1 text-xs text-red-600 break-words">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </div>
      ) : null}
    </div>
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
      const active = o.value === value;
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

const Dropzone = ({ file, onFile, onClear }) => (
  <div className="flex items-center gap-3">
    <label className="block cursor-pointer rounded-xl border border-dashed border-[#224765]/30 bg-white/70 px-3 py-3 text-center text-sm text-[#224765] hover:bg-[#D3E2FD]/30 flex-1">
      <div className="flex items-center justify-center gap-2 flex-wrap">
        <FileDown className="h-4 w-4" />
        <span className="break-words">
          {file ? 'Change file (image/PDF)' : 'Drop file or click to upload (image/PDF)'}
        </span>
      </div>
      <input
        type="file"
        className="hidden"
        accept="image/*,.pdf"
        onChange={(e) => onFile?.(e.target.files?.[0] || null)}
      />
    </label>
    {file ? (
      <>
        <span className="text-xs text-[#224765]/80 truncate max-w-[12rem]">{file.name}</span>
        <button
          type="button"
          onClick={onClear}
          className="rounded-xl border border-[#224765]/30 bg-white px-3 py-2 text-sm text-[#224765] shadow-sm hover:bg-[#D3E2FD]/40"
        >
          Clear
        </button>
      </>
    ) : null}
  </div>
);

const MiniTile = ({ label, value, icon: Icon }) => (
  <div className="rounded-xl border border-[#224765]/10 bg-[#D3E2FD]/30 p-3 min-w-0">
    <div className="flex items-center gap-2 text-xs text-[#224765]/70">
      {Icon ? <Icon className="h-3.5 w-3.5 shrink-0" /> : null}
      <span className="break-words">{label}</span>
    </div>
    <div className="text-sm font-semibold text-[#224765] break-words">{value ?? '—'}</div>
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

/* ────────────────────────────────────────────────────────────
   EXPENSE FORM (Pro) — file upload fixed (FormData)
   ──────────────────────────────────────────────────────────── */
/**
 * props:
 * - currency
 * - categories: [{ value, label }]
 * - vendors: [{ id, name }]
 * - defaultValues
 * - onSubmit(payload)   // optional callback after API success
 * - onCancel()          // optional
 * - apiUrl              // optional override (default local)
 * - schema              // optional tenant header
 */
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
  apiUrl = 'http://localhost:3001/expenses/add_expenses',
  
}) {
const schema=user?.tenant?.schema_name;
console.log(schema);
  const todayISO = new Date().toISOString().slice(0, 10);
  const [form, setForm] = useState({
    date: defaultValues.date || todayISO,
    vendor_name: defaultValues.vendor_name || '',
    category: defaultValues.category || 'supplies',
    description: defaultValues.description || '',
    amount: defaultValues.amount ?? '',
    taxMode: defaultValues.taxMode || 'exclusive', // 'exclusive' | 'inclusive' | 'none'
    taxRate: defaultValues.taxRate ?? 7.5, // %
    method: defaultValues.method || 'Bank Transfer',
    reference: defaultValues.reference || '',
    cost_center: defaultValues.cost_center || '',
    // attachment: null, // File | null
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
    return e;
  }, [form]);

  const valid = Object.keys(errors).length === 0;

  // Totals: 'amount' is base input; how it behaves depends on taxMode
  const totals = useMemo(() => {
    const amt = Number(form.amount) || 0;
    const rate = (Number(form.taxRate) || 0) / 100;

    if (form.taxMode === 'none') {
      return { base: amt, tax: 0, total: amt };
    }
    if (form.taxMode === 'exclusive') {
      const tax = amt * rate;
      return { base: amt, tax, total: amt + tax };
    }
    // inclusive
    const base = rate > 0 ? amt / (1 + rate) : amt;
    const tax = amt - base;
    return { base, tax, total: amt };
  }, [form.amount, form.taxRate, form.taxMode]);

  const headersBase = {};
  if (schema) headersBase['Tenant-Schema'] = schema;

  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!valid || submitting) return;

    setSubmitting(true);
    setServerError(null);
    setServerOk(null);

    try {
      // Build payload
      const payload = {
        ...form,
        amount: Number(form.amount),
        taxRate: Number(form.taxRate),
        totals,
        currency,
      };

      
        // JSON body without file
       const res = await axios.post(apiUrl, payload, {
          headers: { ...headersBase, 'Content-Type': 'application/json' },
        });
      

      if (res.status === 201 || res.status === 200) {
        setServerOk('Expense saved successfully.');
        onSubmit?.(payload);
        setForm({
            date: todayISO,
            vendor_name: '',
            category: defaultValues.category || 'supplies',
            description: defaultValues.description || '',
            amount: defaultValues.amount ?? '',
            taxMode: defaultValues.taxMode || 'exclusive', // 'exclusive' | 'inclusive' | 'none'
            taxRate: defaultValues.taxRate ?? 7.5, // %
            method: defaultValues.method || 'Bank Transfer',
            reference: defaultValues.reference || '',
            cost_center: defaultValues.cost_center || '',
    // attachment: null, // File | null
            notes: defaultValues.notes || '',
        })
        // Optionally reset form after success:
        // setForm((p) => ({ ...p, amount: '', reference: '', notes: '', attachment: null }));
      } else {
        setServerError(`Unexpected response: ${res.status}`);
      }
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        'Failed to save expense. Please try again.';
      setServerError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D3E2FD] via-white to-[#D3E2FD]">
      <main className="min-h-screen w-full p-6 flex items-center justify-center">
        <div className="w-full max-w-5xl">
          <Card
            title="Record Expense"
            subtitle="Log company expenses with tax handling, categories, and attachments"
            right={<Info className="h-5 w-5 text-[#224765]" />}
          >
            {/* Alerts */}
            {serverOk ? (
              <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                {serverOk}
              </div>
            ) : null}
            {serverError ? (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                {serverError}
              </div>
            ) : null}

            {/* Summary */}
            <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <MiniTile label="Net (before tax)" value={fmt(totals.base, currency)} icon={Tags} />
              <MiniTile label="Tax" value={fmt(totals.tax, currency)} icon={Info} />
              <MiniTile label="Total (payable)" value={fmt(totals.total, currency)} icon={Wallet2} />
            </div>

            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field label="Date" error={errors.date}>
                  <Input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
                </Field>

                <Field label="Vendor" hint="Select from list or type a name">
                  {vendors.length ? (
                    <Select value={form.vendor_id} onChange={(e) => set('vendor_id', e.target.value)}>
                      <option value="">Select vendor…</option>
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>
                          {v.name}
                        </option>
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
                  <ChipGroup value={form.category} onChange={(v) => set('category', v)} options={categories} />
                </Field>

                <Field label="Description" hint="What is this expense for?">
                  <Input
                    placeholder="e.g., Nitrile gloves bulk order"
                    value={form.description}
                    onChange={(e) => set('description', e.target.value)}
                  />
                </Field>
              </div>

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

                <Field label="Reference & Cost center" hint="Optional metadata">
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

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* <Field label="Attachment" hint="Receipt / invoice (optional)">
                  <Dropzone
                    file={form.attachment}
                    onFile={(f) => set('attachment', f)}
                    onClear={() => set('attachment', null)}
                  />
                </Field> */}
                <Field label="Notes">
                  <Textarea
                    rows={4}
                    placeholder="Internal notes…"
                    value={form.notes}
                    onChange={(e) => set('notes', e.target.value)}
                  />
                </Field>
              </div>

              {/* Sticky actions */}
              <div className="sticky bottom-4 z-10">
                <div className="mx-auto w-[min(100%,_64rem)] rounded-xl border border-[#224765]/10 bg-white/90 backdrop-blur p-3 shadow-lg flex flex-wrap items-center justify-end gap-2">
                  <ButtonGhost icon={X} onClick={onCancel}>
                    Cancel
                  </ButtonGhost>
                  <ButtonPrimary type="submit" disabled={!valid || submitting} icon={Check}>
                    {submitting ? 'Saving…' : 'Save Expense'}
                  </ButtonPrimary>
                </div>
              </div>
            </form>
          </Card>
        </div>
      </main>
    </div>
  );
}

export default ExpenseFormPro;
