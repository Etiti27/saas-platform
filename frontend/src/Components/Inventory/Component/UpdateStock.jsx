// UpdateStockModal.jsx (or inline in the same file)
import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
const apiRoute= import.meta.env.VITE_API_URL

export function UpdateStockModal({ product, schema, onClose, onSaved }) {
  const open = Boolean(product);

  const [form, setForm] = useState({
    name: "",
    qty: 0,
    cost: 0,
    price: 0,
    expire: "",      // yyyy-mm-dd
    threshold: 0,
    location: "",
  });
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");

  useEffect(() => {
    if (!product) return;
    const toISO = (d) => (d ? new Date(d).toISOString().slice(0, 10) : "");
    setForm({
      name: product.product_name ?? product.name ?? "",
      qty: Number(product.qty ?? product.quantity ?? 0),
      cost: Number(product.cost_price ?? 0),
      price: Number(product.sale_price ?? 0),
      expire: toISO(product.expiring_date),
      threshold: Number(product.threshold ?? 0),
      location: product.location ?? "",
    });
    setErr("");
  }, [product]);

  const valid = useMemo(() => {
    if (!form.name.trim()) return false;
    if (form.qty < 0 || !Number.isFinite(form.qty)) return false;
    if (form.cost < 0 || form.price < 0) return false;
    if (form.threshold < 0) return false;
    if (form.cost > form.price) return true; // allow, but warn
    return true;
  }, [form]);

  const warnPrice = form.cost > form.price;

  const save = async () => {
    if (!valid || !product) return;
    setSaving(true);
    setErr("");
    try {
      const payload = {
        product_name: form.name,
        quantity: form.qty,
        cost_price: form.cost,
        sale_price: form.price,
        expiring_date: form.expire || null,
        threshold: form.threshold,
        location: form.location,
      };
  
      // Prefer path param; switch to query param if that’s your server style
      const { data } = await axios.patch(
        `${apiRoute}/route/product/update-product`,
        payload,
        { headers: { "Tenant-Schema": schema }, params: { id: product.id }   }
      );

      onSaved?.(data); // let parent refresh row/table
      onClose?.();
    } catch (e) {
      setErr(e?.response?.data?.message || e.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    const onKey = (e) => {
      if (!open) return;
      if (e.key === "Escape") onClose?.();
      if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        save();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, save]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      {/* modal */}
      <div className="absolute inset-x-0 top-10 mx-auto w-full max-w-2xl rounded-2xl bg-white p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Update Stock</h2>
          <button
            onClick={onClose}
            className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            save();
          }}
          className="grid grid-cols-1 gap-3 md:grid-cols-2"
        >
          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-600">Name</span>
            <input
              className="rounded-lg border px-3 py-2"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-600">Qty</span>
            <input
              type="number"
              min={0}
              step={1}
              className="rounded-lg border px-3 py-2"
              value={form.qty}
              onChange={(e) =>
                setForm((f) => ({ ...f, qty: Number(e.target.value) }))
              }
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-600">Cost Price</span>
            <input
              type="number"
              min={0}
              step="0.01"
              className="rounded-lg border px-3 py-2"
              value={form.cost}
              onChange={(e) =>
                setForm((f) => ({ ...f, cost: Number(e.target.value) }))
              }
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-600">Sale Price</span>
            <input
              type="number"
              min={0}
              step="0.01"
              className="rounded-lg border px-3 py-2"
              value={form.price}
              onChange={(e) =>
                setForm((f) => ({ ...f, price: Number(e.target.value) }))
              }
              required
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-600">Expire</span>
            <input
              type="date"
              className="rounded-lg border px-3 py-2"
              value={form.expire}
              onChange={(e) =>
                setForm((f) => ({ ...f, expire: e.target.value }))
              }
            />
          </label>

          <label className="flex flex-col gap-1">
            <span className="text-xs text-slate-600">Threshold</span>
            <input
              type="number"
              min={0}
              step={1}
              className="rounded-lg border px-3 py-2"
              value={form.threshold}
              onChange={(e) =>
                setForm((f) => ({ ...f, threshold: Number(e.target.value) }))
              }
            />
          </label>

          <label className="md:col-span-2 flex flex-col gap-1">
            <span className="text-xs text-slate-600">Location</span>
            <input
              className="rounded-lg border px-3 py-2"
              value={form.location}
              onChange={(e) =>
                setForm((f) => ({ ...f, location: e.target.value }))
              }
              list="locations"
              placeholder="e.g., Main store / Aisle B"
            />
            {/* Optional suggestions */}
            <datalist id="locations">
              <option value="Main" />
              <option value="Backroom" />
              <option value="Warehouse" />
            </datalist>
          </label>

          {warnPrice && (
            <div className="md:col-span-2 text-xs text-amber-600">
              Warning: Cost is greater than Price.
            </div>
          )}

          {err && (
            <div className="md:col-span-2 text-sm text-red-600">{err}</div>
          )}

          <div className="md:col-span-2 mt-2 flex items-center gap-2">
            <button
              type="submit"
              disabled={!valid || saving}
              className="rounded-lg bg-blue-600 px-4 py-2 text-white disabled:opacity-50"
              title="Save (Ctrl/Cmd+Enter)"
            >
              {saving ? "Saving..." : "Save"}
            </button>
            <button
              type="button"
              className="rounded-lg border px-4 py-2"
              onClick={onClose}
            >
              Cancel
            </button>
            <span className="ml-auto text-xs text-slate-500">
              Tip: Press <kbd>Ctrl/⌘</kbd>+<kbd>Enter</kbd> to save
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}
