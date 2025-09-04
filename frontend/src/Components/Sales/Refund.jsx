// RefundFormPro.jsx
import React, { useEffect, useMemo, useState } from 'react';
import {
  CreditCard, Banknote, Wallet2, Landmark, FileDown,
  AlertCircle, Check, X, Info
} from 'lucide-react';
import axios from 'axios';
import { Banner, Input, Textarea, Field, Segmented,ChipGroup, Dropzone, Card } from './Component/Refundcomponent';
import { RefundDisplay } from './Component/RefundDisplay';

/* ──────────────────────────────────────────
   Env + helpers
   ────────────────────────────────────────── */
const apiRoute = import.meta.env.VITE_API_URL || 'http://localhost:3001';

const fmt = (n, c='USD') => {
  const num = Number(n); if (!Number.isFinite(num)) return '—';
  return new Intl.NumberFormat(undefined, { style: 'currency', currency: c }).format(num);
};

function normalizeError(err) {
  if (err?.response) {
    const s = err.response.status;
    const msg = err.response.data?.message || err.response.data?.error || `Request failed (HTTP ${s})`;
    return { message: msg, status: s };
  }
  if (err?.request) {
    const msg = navigator.onLine ? 'Network error: server unreachable.' : 'You appear to be offline.';
    return { message: msg, status: null };
  }
  return { message: err?.message || 'Unexpected error.', status: null };
}

export function RefundFormPro({
  user, 
  employee,                 // expects { id, ... }
  currency = 'USD',
  employees = [],
  defaultValues = {},
  onSubmit,              // (payload) => void
  onCancel,              // () => void
}) {
  const schema = user?.tenant?.schema_name;
  const todayISO = new Date().toISOString().slice(0, 10);

  const makeInitialForm = () => ({
    date: todayISO,
    order_id: '',
    amount: '',                // optional if doing full refund; kept for extensibility
    method: 'Card',
    reason: 'Damaged',
    other_reason: '',
    employee_id: employee?.id ?? '',
    notes: '',
    attachment: null,          // NOTE: not uploaded by default; wire to your API if supported
  });

  const [form, setForm] = useState(makeInitialForm());
  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  // orders + search
  const [allOrders, setAllOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchErr, setFetchErr] = useState(null);

  const [orderQuery, setOrderQuery] = useState('');
  const [showList, setShowList] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // submit status
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null); // {message, status}
  const [successMsg, setSuccessMsg] = useState('');

  // fetch orders
  useEffect(() => {
    if (!schema) {
      setFetchErr('Missing tenant schema in user context.');
      return;
    }
    (async () => {
      try {
        setLoading(true);
        setFetchErr(null);
        const res = await axios.get(`${apiRoute}/route/orders/getorder`, {
          headers: { 'Tenant-Schema': schema },
        });
        if (res.status === 200) {
          const rows = Array.isArray(res.data) ? res.data : [];
          setAllOrders(rows);
        } else {
          setFetchErr(`Failed to load orders (HTTP ${res.status})`);
        }
      } catch (e) {
        setFetchErr(normalizeError(e).message);
      } finally {
        setLoading(false);
      }
    })();
  }, [schema]);

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
      .filter(o => String(o?.status).toLowerCase() === 'paid')
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
    set('order_id', o.id);
    setOrderQuery(o.orderNumber || o.id);
    setShowList(false);
  };

  // validation
  const errors = useMemo(() => {
    const e = {};
    if (!form.date) e.date = 'Required';
    if (!form.order_id) e.order_id = 'Select an order';
    if (!form.method) e.method = 'Choose method';
    if (!form.reason) e.reason = 'Choose a reason';
    if (form.reason === 'Other' && !form.other_reason.trim())
      e.other_reason = 'Please specify';
    return e;
  }, [form]);

  const valid = Object.keys(errors).length === 0;

  // submit
  const handleSubmit = async (ev) => {
    ev?.preventDefault?.();
    if (!valid) return;
    if (!schema) { setSubmitError({ message: 'Missing tenant schema.', status: null }); return; }
    if (!selectedOrder) { setSubmitError({ message: 'Please select an order to refund.', status: null }); return; }

    const headers = { 'Tenant-Schema': schema };
    const total = orderTotal(selectedOrder);
    const refundReason = form.reason === 'Other' ? (form.other_reason || 'Other') : form.reason;

    setSubmitting(true);
    setSubmitError(null);
    setSuccessMsg('');

    let orderPatched = false;

    try {
      // 1) Update order -> Refunded
      const resOrder = await axios.patch(
        `${apiRoute}/route/orders/update`,
        { status: 'Refunded', refunded_amount: total, profit: 0 },
        { headers, params: { id: form.order_id } }
      );
      if (!(resOrder.status >= 200 && resOrder.status < 300)) {
        throw new Error(`Failed to update order (HTTP ${resOrder.status})`);
      }
      orderPatched = true;

      // 2) Create refund record
      const refundPayload = {
        order_id: form.order_id,
        method: form.method,
        reason: refundReason,
        employee_id: form.employee_id,
        note: form.notes,
        date: form.date,
      };

      const refundRes = await axios.post(
        `${apiRoute}/route/refund/create-refund`,
        refundPayload,
        { headers }
      );
      if (!(refundRes.status >= 200 && refundRes.status < 300)) {
        throw new Error(`Failed to create refund record (HTTP ${refundRes.status})`);
      }

      // 3) Update product quantities for this order (if your backend expects it)
      const resQuan = await axios.patch(
        `${apiRoute}/route/product/update-product`,
        null,
        { headers, params: { id: form.order_id } }
      );
      if (!(resQuan.status >= 200 && resQuan.status < 300)) {
        throw new Error(`Failed to update stock (HTTP ${resQuan.status})`);
      }

      // ✅ success → reset form and show banner
      setForm(makeInitialForm());
      setOrderQuery('');
      setSelectedOrder(null);
      setShowList(false);
      setSuccessMsg(`Refund saved for ${orderQuery || 'order'} (${fmt(total, currency)}).`);

      // optional external hook
      onSubmit?.({
        ...refundPayload,
        refunded_amount: total,
      });

    } catch (err) {
      const n = normalizeError(err);
      setSubmitError(n);

      // Best-effort rollback: if order was set to Refunded but later steps failed,
      // try to revert it back to its previous status (likely 'Paid').
      if (orderPatched && selectedOrder?.status) {
        try {
          await axios.patch(
            `${apiRoute}/route/orders/update`,
            { status: selectedOrder.status },
            { headers, params: { id: form.order_id } }
          );
        } catch (_) {
          // swallow rollback failure; we already show main error
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#D3E2FD] via-white to-[#D3E2FD]">
      <div className="mx-auto max-w-6xl p-6">
        {/* header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold leading-tight text-[#224765]">Issue Refund</h1>
            <p className="text-sm text-[#224765]/70">Select an order, choose method & reason, and save.</p>
          </div>
          <Info className="h-5 w-5 text-[#224765]" />
        </div>

        {/* Status banners */}
        {successMsg && (
          <Banner type="success" onClose={() => setSuccessMsg('')}>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4" />
              <span>{successMsg}</span>
            </div>
          </Banner>
        )}
        {fetchErr && (
          <Banner type="error" onClose={() => setFetchErr(null)}>
            {fetchErr}
          </Banner>
        )}
        {submitError && (
          <Banner type="error" onClose={() => setSubmitError(null)}>
            {submitError.message}
          </Banner>
        )}

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

            <Card title="Amount & Method" subtitle="Payment method for the refund">
              {/* If you add partial refunds later, add an Amount input here */}
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
                  {/* NOTE: Attachment is captured but not uploaded by default.
                     If your API supports file upload, switch to FormData in handleSubmit. */}
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

          <RefundDisplay selectedOrder={selectedOrder} form={form} orderTotal={orderTotal} fmt={fmt} currency={currency}/>
        
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
                disabled={!valid || submitting}
                className="inline-flex items-center justify-center rounded-xl bg-[#224765] px-4 py-2 text-white shadow hover:bg-[#1a3a56] disabled:opacity-50"
                aria-busy={submitting}
              >
                {submitting ? (
                  <svg viewBox="0 0 24 24" className="mr-2 h-4 w-4 animate-spin">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" opacity="0.25"/>
                    <path d="M12 2 a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="4" fill="none"/>
                  </svg>
                ) : (
                  <Check className="mr-2 h-4 w-4" />
                )}
                {submitting ? 'Saving…' : 'Save Refund'}
              </button>
            </div>
          </div>
        </form>

        {/* small loading hint under header */}
        {loading && <div className="mt-3 text-sm text-[#224765]/70">Loading orders…</div>}
      </div>
    </div>
  );
}

