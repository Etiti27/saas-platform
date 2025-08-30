// RefundFormPro.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  CreditCard, Banknote, Wallet2, Landmark, FileDown,
  AlertCircle, Check, X, Info
} from 'lucide-react';
import axios from 'axios';

/* ────────────────────────────────────────────────────────────
   Brand-styled primitives
   ──────────────────────────────────────────────────────────── */
const Input = (props) => (
  <input
    {...props}
    className={`w-full rounded-xl border border-[#224765]/20 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-1 ring-transparent focus:ring-2 focus:ring-[#224765] ${props.className||''}`}
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
    className="w-full rounded-xl border border-[#224765]/20 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-1 ring-transparent focus:ring-2 focus:ring-[#224765]"
  />
);

const Field = ({ label, hint, error, children }) => (
  <div className="py-3 grid grid-cols-1 gap-2 md:grid-cols-3 md:gap-6">
    <div>
      <div className="text-sm font-medium text-[#224765]">{label}</div>
      {hint && <div className="text-xs text-[#224765]/70">{hint}</div>}
    </div>
    <div className="md:col-span-2">
      {children}
      {error ? (
        <div className="mt-1 inline-flex items-center gap-1 text-xs text-red-600">
          <AlertCircle className="h-3.5 w-3.5" /> {error}
        </div>
      ) : null}
    </div>
  </div>
);

const Segmented = ({ value, onChange, options }) => (
  <div className="inline-flex rounded-xl border border-[#224765]/20 bg-white p-1 shadow-sm">
    {options.map(o => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        className={`flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm transition ${
          value === o.value ? 'bg-[#D3E2FD] text-[#224765]' : 'text-[#224765] hover:bg-[#D3E2FD]/40'
        }`}
      >
        {o.icon ? <o.icon className="h-4 w-4" /> : null}
        {o.label}
      </button>
    ))}
  </div>
);

const ChipGroup = ({ options, value, onChange }) => (
  <div className="flex flex-wrap gap-2">
    {options.map(o => {
      const active = o.value === value;
      return (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`rounded-full px-3 py-1.5 text-xs font-medium transition
            ${active ? 'bg-[#224765] text-white' : 'bg-[#D3E2FD] text-[#224765] hover:bg-[#D3E2FD]/70'}`}
        >
          {o.label}
        </button>
      );
    })}
  </div>
);

const Dropzone = ({ onFile }) => (
  <label className="block cursor-pointer rounded-xl border border-dashed border-[#224765]/30 bg-white/70 px-3 py-6 text-center text-sm text-[#224765] hover:bg-[#D3E2FD]/30">
    <div className="flex items-center justify-center gap-2">
      <FileDown className="h-4 w-4" />
      <span>Drop file or click to upload (image/PDF)</span>
    </div>
    <input
      type="file"
      className="hidden"
      accept="image/*,.pdf"
      onChange={(e) => onFile?.(e.target.files?.[0] || null)}
    />
  </label>
);

const Card = ({ title, subtitle, right, children, className='' }) => (
  <section className={`bg-white p-5 rounded-2xl shadow-xl ring-1 ring-[#224765]/10 ${className}`}>
    {(title || right || subtitle) && (
      <div className="mb-4 flex items-end justify-between gap-3">
        <div>
          {title && <h3 className="text-base font-semibold text-[#224765]">{title}</h3>}
          {subtitle && <div className="text-xs text-[#224765]/70">{subtitle}</div>}
        </div>
        {right}
      </div>
    )}
    {children}
  </section>
);

/* ────────────────────────────────────────────────────────────
   small helpers
   ──────────────────────────────────────────────────────────── */
const fmt = (n, c='USD') => {
  const num = Number(n); if (!Number.isFinite(num)) return '—';
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: c }).format(num);
};

/* ────────────────────────────────────────────────────────────
   RefundFormPro (full)
   ──────────────────────────────────────────────────────────── */
export function RefundFormPro({
  user, 
  employee,                 // expects { tenant: { schema_name } }
  currency = 'USD',
  employees = [],        // [{ id, name }]
  defaultValues = {},
  onSubmit,              // (payload) => void
  onCancel,              // () => void
}) {
  const schema = user?.tenant?.schema_name;
  const todayISO = new Date().toISOString().slice(0, 10);
  const makeInitialForm = () => ({
    date: todayISO,
    order_id: '',
    amount: '',
    method: 'Card',
    reason: 'Damaged',
    other_reason: '',
    employee_id: employee.id,
    notes: '',
    attachment: null,
  });
  console.log(employee);
  
  
  const [form, setForm] = useState(makeInitialForm());

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // orders + search
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchErr, setFetchErr] = useState(null);

  const [orderQuery, setOrderQuery] = useState('');
  const [showList, setShowList] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // fetch orders
  useEffect(() => {
    if (!schema) return;
    (async () => {
      try {
        setLoading(true);
        setFetchErr(null);
        const res = await axios.get('http://localhost:3001/route/orders/getorder', {
          headers: { 'Tenant-Schema': schema },
        });
        if (res.status === 200) {
          const rows = Array.isArray(res.data) ? res.data : [];
          setAllOrders(rows);
        }
      } catch (e) {
        setFetchErr(e?.message || 'Failed to load orders');
      } finally {
        setLoading(false);
      }
    })();
  }, [schema]);

  console.log(allOrders);

  // compute an order's total
  const orderTotal = (o) => {
    const items = Array.isArray(o?.items) ? o.items : [];
    const sub = items.reduce(
      (s, it) => s + (Number(it.amount ?? it.unit_price) || 0) * (Number(it.quantity) || 0),
      0
    );
    const disc = Number(o?.total_discount ?? o?.discount_amount ?? 0) || 0;
    return Math.max(0, sub - disc);
  };

  // typeahead matches
  const matches = useMemo(() => {
    const q = orderQuery.trim().toLowerCase();
    if (!q) return [];
  
    return (allOrders ?? [])
      // keep only paid
      .filter(o => String(o?.status).toLowerCase() === 'paid')
      // then search
      .filter(o => {
        const hay = [
          o?.orderNumber ?? '',
          o?.id ?? '',
          o?.status ?? '',
          o?.added_date ? new Date(o.added_date).toISOString().slice(0, 10) : '',
        ].join(' ').toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 8);
  }, [allOrders, orderQuery]);
  

  // select suggestion
  const pickOrder = (o) => {
    setSelectedOrder(o);
    set('order_id', o.id);                   // set canonical id
    setOrderQuery(o.orderNumber || o.id);    // show label in input
    setShowList(false);
  };

  // quick % buttons use selected order
  const maxAmount = useMemo(
    () => (selectedOrder ? orderTotal(selectedOrder) : undefined),
    [selectedOrder]
  );
  const percentQuick = (pct) => {
    if (!selectedOrder) return;
    const base = orderTotal(selectedOrder);
    const val = Math.round(base * pct * 100) / 100;
    set('amount', String(val));
  };

  // validation
  const errors = useMemo(() => {
    const e = {};
    const amt = Number(form.amount);
    if (!form.date) e.date = 'Required';
    // if you want to enforce picking an order, uncomment:
    // if (!form.order_id) e.order_id = 'Select an order';
    // if (!Number.isFinite(amt) || amt <= 0) e.amount = 'Enter a valid amount';
    if (maxAmount !== undefined && amt > maxAmount)
      e.amount = `Cannot exceed ${fmt(maxAmount, currency)}`;
    if (!form.method) e.method = 'Choose method';
    if (!form.reason) e.reason = 'Choose a reason';
    if (form.reason === 'Other' && !form.other_reason.trim())
      e.other_reason = 'Please specify';
    return e;
  }, [form, maxAmount, currency]);

  const valid = Object.keys(errors).length === 0;

  // submit
  const handleSubmit = async (e) => {
    e?.preventDefault?.();
    if (!valid) return;
    


  try {
    const res = await axios.patch(
      'http://localhost:3001/route/orders/update',
      { status: 'Refunded', refunded_amount: orderTotal(selectedOrder), profit: 0},
      { headers: { 'Tenant-Schema': schema }, params: { id: form.order_id } }
    );
    const refundRes= await axios.post('http://localhost:3001/route/refund/create-refund',
    {order_id: form.order_id, method: form.method, reason: form.reason, employee_id: form.employee_id, note: form.notes},
    
    {headers: { 'Tenant-Schema': schema }}
    
    )
    const resQuan= await axios.patch("http://localhost:3001/route/update-product",
    null,
    { headers: { 'Tenant-Schema': schema }, params: { id: form.order_id } } 
  );
  
    if (res.status ==200 && refundRes.status==200 && resQuan.status==200) {
  
      // 🔄 reset form + UI
      setForm(makeInitialForm());
      setOrderQuery('');        // clears the search input
      setSelectedOrder(null);   // clears the selection
      setShowList(false);       // closes the dropdown
    } 
    
  } catch (error) {
    console.log(error);
    
  }
  
  };
  

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D3E2FD] via-white to-[#D3E2FD]">
      <div className="mx-auto max-w-6xl p-6">
        {/* header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-tight text-[#224765]">Issue Refund</h1>
            <p className="text-sm text-[#224765]/70">Select an order, enter amount & reason, attach evidence, and save.</p>
          </div>
          <Info className="h-5 w-5 text-[#224765]" />
        </div>

        {loading && <div className="mb-4 text-sm text-[#224765]/70">Loading orders…</div>}
        {fetchErr && <div className="mb-4 text-sm text-red-600">{fetchErr}</div>}

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* LEFT */}
          <div className="lg:col-span-8 space-y-6">
            <Card title="Order & Date" subtitle="Choose the order and refund date">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Field label="Order" hint="Search by order number or ID" error={errors.order_id}>
                  <div className="relative">
                    <input
                      value={orderQuery}
                      onChange={(e) => {
                        setOrderQuery(e.target.value);
                        setShowList(true);
                      }}
                      onFocus={() => setShowList(true)}
                      onBlur={() => setTimeout(() => setShowList(false), 120)}
                      placeholder="Search order… e.g., SO-1021"
                      className="w-full rounded-xl border border-[#224765]/20 bg-white px-3 py-2 text-sm shadow-sm outline-none ring-1 ring-transparent focus:ring-2 focus:ring-[#224765]"
                    />
                    {showList && orderQuery.trim() && (
                      <div className="absolute z-10 mt-1 w-full max-h-72 overflow-auto rounded-xl border border-[#224765]/20 bg-white shadow-lg">
                        {matches.length === 0 ? (
                          <div className="px-3 py-2 text-sm text-[#224765]/70">No matches</div>
                        ) : (
                          matches.map((o) => (
                            <button
                              key={o.id}
                              type="button"
                              onMouseDown={() => pickOrder(o)} // use mousedown so blur doesn't cancel
                              className="w-full px-3 py-2 text-left hover:bg-[#D3E2FD]/40"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="font-medium text-[#224765]">
                                  {o.orderNumber || o.id}
                                </div>
                                <div className="text-xs text-[#224765]/70">
                                  {o.added_date
                                    ? new Date(o.added_date).toISOString().slice(0, 10)
                                    : '—'}
                                </div>
                              </div>
                              <div className="text-xs text-[#224765]/70">
                                Total: {fmt(orderTotal(o), currency)} · {o.status || '—'}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                </Field>

                <Field label="Date" error={errors.date}>
                  <Input type="date" value={form.date} onChange={(e) => set('date', e.target.value)} />
                </Field>
              </div>
            </Card>

             <Card title="Amount & Method" subtitle="Refund amount and payment method">
          

              <Field label="Method" error={errors.method}>
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
            </Card>

            <Card title="Reason & Evidence" subtitle="Explain why and attach any proof">
              <Field label="Reason" error={errors.reason}>
                <ChipGroup
                  value={form.reason}
                  onChange={(v) => set('reason', v)}
                  options={[
                    { value: 'Damaged', label: 'Damaged' },
                    { value: 'Wrong item', label: 'Wrong item' },
                    { value: 'Wrong size', label: 'Wrong size' },
                    { value: 'Customer remorse', label: 'Customer remorse' },
                    { value: 'Other', label: 'Other' },
                  ]}
                />
                {form.reason === 'Other' && (
                  <Input
                    className="mt-2"
                    placeholder="Describe the reason…"
                    value={form.other_reason}
                    onChange={(e) => set('other_reason', e.target.value)}
                  />
                )}
              </Field>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            

                <Field label="Attachment" hint="Receipt / evidence (optional)">
                  <Dropzone onFile={(f) => set('attachment', f)} />
                </Field>
              </div>

              <Field label="Notes">
                <Textarea
                  rows={3}
                  placeholder="Internal note…"
                  value={form.notes}
                  onChange={(e) => set('notes', e.target.value)}
                />
              </Field>
            </Card>
          </div>

          {/* RIGHT */}
          <aside className="lg:col-span-4 space-y-6">
            <Card title="Summary" className="sticky top-6">
              <div className="grid grid-cols-1 gap-3">
                <div className="rounded-xl border border-[#224765]/10 bg-[#D3E2FD]/30 p-3">
                  <div className="text-xs text-[#224765]/70">Order</div>
                  <div className="text-sm font-semibold text-[#224765]">
                    {selectedOrder?.orderNumber || selectedOrder?.id || '—'}
                  </div>
                  <div className="text-xs text-[#224765]/60">
                    Date:{' '}
                    {selectedOrder?.added_date
                      ? new Date(selectedOrder.added_date).toISOString().slice(0,10)
                      : '—'}
                  </div>
                </div>

                <div className="rounded-xl border border-[#224765]/10 bg-[#D3E2FD]/30 p-3">
                  <div className="text-xs text-[#224765]/70">Order Total</div>
                  <div className="text-sm font-semibold text-[#224765]">
                    {selectedOrder ? fmt(orderTotal(selectedOrder), currency) : '—'}
                  </div>
                </div>

                <div className="rounded-xl border border-[#224765]/10 bg-[#D3E2FD]/30 p-3">
                  <div className="text-xs text-[#224765]/70">Refund</div>
                  <div className="text-sm font-semibold text-[#224765]">
                  {selectedOrder ? fmt(orderTotal(selectedOrder), currency) : '—'}
                  </div>
                </div>

                <div className="rounded-xl border border-[#224765]/10 bg-white p-3">
                  <div className="text-xs text-[#224765]/70">Method</div>
                  <div className="text-sm font-semibold text-[#224765]">{form.method}</div>
                </div>

                <div className="rounded-xl border border-[#224765]/10 bg-white p-3">
                  <div className="text-xs text-[#224765]/70">Reason</div>
                  <div className="text-sm font-semibold text-[#224765]">
                    {form.reason === 'Other' ? (form.other_reason || '—') : form.reason}
                  </div>
                </div>
              </div>

              <div className="mt-4 rounded-xl border border-[#224765]/10 bg-white p-3 text-xs text-[#224765]/80">
                Tip: attach evidence for larger refunds per policy.
              </div>
            </Card>
          </aside>

          {/* sticky action bar */}
          <div className="col-span-full sticky bottom-4 z-10">
            <div className="mx-auto max-w-6xl rounded-xl border border-[#224765]/10 bg-white/90 backdrop-blur p-3 shadow-lg flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="inline-flex items-center justify-center rounded-xl border border-[#224765]/30 bg-white px-4 py-2 text-sm text-[#224765] shadow-sm hover:bg-[#D3E2FD]/40"
              >
                <X className="mr-2 h-4 w-4" /> Cancel
              </button>
              <button
                type="submit"
                disabled={!valid}
                className="inline-flex items-center justify-center rounded-xl bg-[#224765] px-4 py-2 text-white shadow hover:bg-[#1a3a56] disabled:opacity-50"
              >
                <Check className="mr-2 h-4 w-4" /> Save Refund
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export default RefundFormPro;
