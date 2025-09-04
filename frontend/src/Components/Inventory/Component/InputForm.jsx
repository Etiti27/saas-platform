import React, { useMemo, useState, useCallback } from 'react';
import { Input } from './InputComp';

/**
 * UX upgrades (no backend changes):
 * - Required markers (*) and helper text
 * - Inline validation + error states
 * - Better keyboard UX: Enter = add, Esc = clear
 * - Sensible input attributes (min, step, inputMode)
 * - Quick location presets
 */
export const InputForm = ({ Chip, newProduct, handleAddProduct, canAdd, setNewProduct }) => {
  const [touched, setTouched] = useState({});

  const setField = useCallback((key, value) => {
    setNewProduct((prev) => ({ ...prev, [key]: value }));
  }, [setNewProduct]);

  const onBlur = (key) => setTouched((t) => ({ ...t, [key]: true }));

  const errors = useMemo(() => {
    const e = {};
    if (!newProduct.name?.trim()) e.name = 'Name is required';
    if (newProduct.quantity === '' || Number(newProduct.quantity) <= 0) e.quantity = 'Enter a positive quantity';
    if (newProduct.threshold === '' || Number(newProduct.threshold) < 0) e.threshold = 'Threshold cannot be negative';
    if (!newProduct.location?.trim()) e.location = 'Location is required';
    if (newProduct.cost_price === '' || Number(newProduct.cost_price) < 0) e.cost_price = 'Cost price must be ≥ 0';
    if (newProduct.sale_price === '' || Number(newProduct.sale_price) < 0) e.sale_price = 'Sale price must be ≥ 0';

    // Optional: simple logical check
    if (newProduct.cost_price !== '' && newProduct.sale_price !== '' && Number(newProduct.sale_price) < Number(newProduct.cost_price)) {
      e.sale_price = 'Sale price is below cost';
    }
    return e;
  }, [newProduct]);

  const markAllTouched = () => setTouched({ name: true, quantity: true, threshold: true, location: true, cost_price: true, sale_price: true, expiring_date: true });

  const submit = () => {
    // Give inline feedback if invalid
    if (!canAdd || Object.keys(errors).length) {
      markAllTouched();
      return;
    }
    handleAddProduct();
  };

  const clear = () => {
    setNewProduct({ name: '', quantity: '', threshold: '', location: '', sale_price: '', cost_price: '', expiring_date: '' });
    setTouched({});
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      clear();
    }
  };

  const fieldClass = (key) => [
    'rounded-xl border px-3 py-2 text-sm shadow-sm outline-none ring-1 ring-transparent',
    'border-[#224765]/20 bg-white focus:ring-2 focus:ring-[#224765]',
    touched[key] && errors[key] ? 'border-red-300 focus:ring-red-400' : '',
  ].join(' ');

  const helper = (key, text) => (
    <p className={`mt-1 text-xs ${touched[key] && errors[key] ? 'text-red-600' : 'text-[#224765]/60'}`}>
      {touched[key] && errors[key] ? errors[key] : text}
    </p>
  );

  const today = new Date().toISOString().split('T')[0];

  const locationPresets = ['Backroom', 'Front shelf', 'Warehouse A'];

  return (
    <div className="mb-8 rounded-2xl border border-[#224765]/10 bg-white p-6 shadow-sm" onKeyDown={onKeyDown}>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-[#224765]">Add New Product</h2>
        <span className="rounded-full bg-[#D3E2FD] px-2 py-1 text-xs font-medium text-[#224765] ring-1 ring-[#224765]/15">
          <Chip tone="violet">Quick add</Chip>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Name */}
        <div className="flex flex-col">
          <label className="mb-1 text-xs font-medium text-[#224765]">Name <span className="text-red-500">*</span></label>
          <Input
            type="text"
            placeholder="e.g., Nitrile Gloves (M)"
            value={newProduct.name}
            onChange={(e) => setField('name', e.target.value)}
            onBlur={() => onBlur('name')}
            className={fieldClass('name')}
            aria-invalid={!!(touched.name && errors.name)}
            autoComplete="off"
          />
          {helper('name', 'Give a clear, searchable name')}
        </div>

        {/* Quantity */}
        <div className="flex flex-col">
          <label className="mb-1 text-xs font-medium text-[#224765]">Quantity <span className="text-red-500">*</span></label>
          <Input
            type="number"
            placeholder="0"
            value={newProduct.quantity}
            onChange={(e) => setField('quantity', e.target.value)}
            onBlur={() => onBlur('quantity')}
            className={fieldClass('quantity')}
            inputMode="numeric"
            min={0}
            step={1}
            aria-invalid={!!(touched.quantity && errors.quantity)}
          />
          {helper('quantity', 'Units in stock (must be positive)')}
        </div>

        {/* Threshold */}
        <div className="flex flex-col">
          <label className="mb-1 text-xs font-medium text-[#224765]">Low‑stock threshold <span className="text-red-500">*</span></label>
          <Input
            type="number"
            placeholder="e.g., 5"
            value={newProduct.threshold}
            onChange={(e) => setField('threshold', e.target.value)}
            onBlur={() => onBlur('threshold')}
            className={fieldClass('threshold')}
            inputMode="numeric"
            min={0}
            step={1}
            aria-invalid={!!(touched.threshold && errors.threshold)}
          />
          {helper('threshold', 'Alert level for reordering')}
        </div>

        {/* Cost Price */}
        <div className="flex flex-col">
          <label className="mb-1 text-xs font-medium text-[#224765]">Cost Price <span className="text-red-500">*</span></label>
          <Input
            type="number"
            placeholder="e.g., 4.50"
            value={newProduct.cost_price}
            onChange={(e) => setField('cost_price', e.target.value)}
            onBlur={() => onBlur('cost_price')}
            className={fieldClass('cost_price')}
            inputMode="decimal"
            min={0}
            step={0.01}
            aria-invalid={!!(touched.cost_price && errors.cost_price)}
          />
          {helper('cost_price', 'Your unit acquisition cost')}
        </div>

        {/* Sale Price */}
        <div className="flex flex-col">
          <label className="mb-1 text-xs font-medium text-[#224765]">Sale Price <span className="text-red-500">*</span></label>
          <Input
            type="number"
            placeholder="e.g., 7.99"
            value={newProduct.sale_price}
            onChange={(e) => setField('sale_price', e.target.value)}
            onBlur={() => onBlur('sale_price')}
            className={fieldClass('sale_price')}
            inputMode="decimal"
            min={0}
            step={0.01}
            aria-invalid={!!(touched.sale_price && errors.sale_price)}
          />
          {helper('sale_price', 'Customer-facing price per unit')}
        </div>

        {/* Expire date */}
        <div className="flex flex-col">
          <label className="mb-1 text-xs font-medium text-[#224765]">Expire date</label>
          <Input
            type="date"
            value={newProduct.expiring_date}
            onChange={(e) => setField('expiring_date', e.target.value)}
            onBlur={() => onBlur('expiring_date')}
            className={fieldClass('expiring_date')}
            min={today}
          />
          <p className="mt-1 text-xs text-[#224765]/60">Optional but recommended for perishables</p>
        </div>

        {/* Location */}
        <div className="flex flex-col lg:col-span-2">
          <label className="mb-1 text-xs font-medium text-[#224765]">Product Location <span className="text-red-500">*</span></label>
          <Input
            type="text"
            placeholder="e.g., Aisle 3 / Bin B"
            value={newProduct.location}
            onChange={(e) => setField('location', e.target.value)}
            onBlur={() => onBlur('location')}
            className={fieldClass('location')}
            autoComplete="off"
            aria-invalid={!!(touched.location && errors.location)}
          />
          {helper('location', 'Where this item lives in your store or warehouse')}
          <div className="mt-2 flex flex-wrap gap-2">
            {locationPresets.map((loc) => (
              <button
                key={loc}
                type="button"
                onClick={() => setField('location', loc)}
                className="rounded-full border border-[#224765]/20 px-3 py-1 text-xs text-[#224765] hover:bg-[#D3E2FD]/50"
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-4 flex flex-col gap-3 sm:flex-row lg:col-span-2">
          <button
            type="button"
            onClick={submit}
            disabled={!canAdd}
            className="inline-flex items-center justify-center rounded-xl bg-[#224765] px-4 py-2 text-white shadow hover:bg-[#1b3951] disabled:cursor-not-allowed disabled:bg-[#D3E2FD] disabled:text-[#224765] disabled:opacity-70"
          >
            Add Product
          </button>
          <button
            type="button"
            onClick={clear}
            className="inline-flex items-center justify-center rounded-xl border border-[#224765]/30 px-4 py-2 text-[#224765] shadow-sm hover:bg-[#D3E2FD]/40"
          >
            Clear
          </button>
        </div>
      </div>
    </div>
  );
};
