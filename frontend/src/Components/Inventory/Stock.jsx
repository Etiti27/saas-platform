// LowStockManager.jsx
import React, { useMemo, useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Package, Search, TrendingDown, DollarSign, Plus, Minus } from 'lucide-react';
import { ConfirmDialog } from './Component/confirmDialogue';
import { Table } from './Component/Table';
import { InputForm } from './Component/InputForm';
import { Chip } from './Component/Chip';
import { fmtMoney } from './Service/Fmt';
import { StatCard } from './Component/StatCard';
import { validateNewProduct } from './Service/ValidateProduct';
import { normalizeAxiosError } from './Component/errorHandelling';
import { ErrorBanner } from './Component/ErrorBanner';
const apiRoute= import.meta.env.VITE_API_URL

/* Axios instance with schema header */
function useApi(schema) {
  const apiRef = useRef();
  if (!apiRef.current) {
    apiRef.current = axios.create({
      baseURL: apiRoute,
      timeout: 15000,
      validateStatus: (s) => s >= 200 && s < 300,
    });
  }
  apiRef.current.defaults.headers['Tenant-Schema'] = schema ?? '';
  return apiRef.current;
}

/* Debounce */
function useDebouncedValue(value, delay = 250) {
  const [v, setV] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setV(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return v;
}

const StockManager = ({ user }) => {
  const email = user?.email ?? '';
  const schema = user?.tenant?.schema_name ?? '';
  const api = useApi(schema);

  const [loading, setLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [products, setProducts] = useState([]);

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);

  const [confirm, setConfirm] = useState({ open: false, id: null, name: '', busy: false, error: null });

  const [newProduct, setNewProduct] = useState({name: '',quantity: '',threshold: '',cost_price: '',sale_price: '',expiring_date: '',location: '',
  });
  const [addBusy, setAddBusy] = useState(false);
  const [addError, setAddError] = useState(null);
  const [addFieldErrors, setAddFieldErrors] = useState({});
  const [wantToAdd, setWantToAdd] = useState(false); // ✅ properly handled

  /* Load products with retry */
  useEffect(() => {
    const controller = new AbortController();

    async function fetchWithRetry(retries = 2, backoffMs = 600) {
      setLoading(true);
      setLoadError(null);
      try {
        const { data } = await api.get('/route/product/all_products', { signal: controller.signal });
        setProducts(Array.isArray(data?.rows) ? data.rows : []);
      } catch (err) {
        const norm = normalizeAxiosError(err);
        if (norm.kind !== 'canceled' && retries > 0) {
          await new Promise((r) => setTimeout(r, backoffMs));
          return fetchWithRetry(retries - 1, backoffMs * 2);
        }
        if (norm.kind !== 'canceled') setLoadError(norm);
      } finally {
        setLoading(false);
      }
    }

    if (!schema) {
      setLoadError({ kind: 'client', message: 'Missing tenant schema in user context.' });
      return;
    }

    fetchWithRetry();
    return () => controller.abort();
  }, [api, schema]);

  /* Delete product */
  const requestDelete = (id, name) => setConfirm({ open: true, id, name, busy: false, error: null });

  const confirmDelete = async () => {
    setConfirm((c) => ({ ...c, busy: true, error: null }));
    try {
      const res = await api.post('/route/product/delete_product', { id: confirm.id, name: confirm.name, schema });
      if (res?.status === 200) {
        setProducts((prev) => prev.filter((p) => p.id !== confirm.id && p.product_name !== confirm.name));
        setConfirm({ open: false, id: null, name: '', busy: false, error: null });
      }
    } catch (err) {
      setConfirm((c) => ({ ...c, busy: false, error: normalizeAxiosError(err) }));
    }
  };

  /* Add product */

  const handleAddProduct = async () => {
    setAddError(null);
    const errs = validateNewProduct(newProduct);
    setAddFieldErrors(errs);
    if (Object.keys(errs).length > 0) return;

    const payload = {
      ...newProduct,
      quantity: Number(newProduct.quantity),
      threshold: Number(newProduct.threshold),
      cost_price: Number(newProduct.cost_price),
      sale_price: Number(newProduct.sale_price),
      expiring_date: newProduct.expiring_date || null,
    };

    setAddBusy(true);
    try {
      const res = await api.post('route/product/add_product', { newProduct: payload, email, schema });
      const created = res?.data?.product;
      if (created) {
        setProducts((prev) => [created, ...prev]);
      } else {
        api.get('route/product/all_products').then(({ data }) => setProducts(Array.isArray(data?.rows) ? data.rows : [])).catch(() => {});
      }
      setNewProduct({name: '',quantity: '',threshold: '',cost_price: '',sale_price: '',expiring_date: '',location: '',});
      setAddFieldErrors({});
      setWantToAdd(false);
    } catch (err) {
      setAddError(normalizeAxiosError(err));
    } finally {
      setAddBusy(false);
    }
  };

  /* Derived */
  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        String(p.id ?? '').toLowerCase().includes(q) ||
        String(p.product_name ?? '').toLowerCase().includes(q) ||
        String(p.location ?? '').toLowerCase().includes(q)
    );
  }, [products, debouncedSearch]);

  const lowCount = filtered.filter((p) => Number(p.quantity) <= Number(p.threshold)).length;
  const totalCount = filtered.length;
  const inventoryValue = filtered.reduce(
    (sum, p) => sum + (Number(p.sale_price) || 0) * (Number(p.quantity) || 0),
    0
  );

  const canAdd =
    newProduct.name &&
    newProduct.quantity &&
    newProduct.threshold &&
    newProduct.location &&
    newProduct.cost_price &&
    newProduct.sale_price;

  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-[#D3E2FD] via-white to-[#D3E2FD]">
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Header */}
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#224765]">Inventory Manager</h1>
            <p className="text-sm text-[#224765]/70">Track stock levels, expiry, and value at a glance.</p>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#224765]/50" />
            <input
              className="w-full sm:w-80 rounded-xl border border-[#224765]/20 bg-white pl-9 pr-3 py-2 text-sm shadow-sm outline-none ring-1 ring-transparent focus:ring-2 focus:ring-[#224765]"
              placeholder="Search by ID, name, or location…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              aria-label="Search products"
            />
          </div>
        </div>

        {/* Load error */}
        <ErrorBanner
          error={loadError}
          onRetry={
            loadError
              ? async () => {
                  setLoadError(null);
                  try {
                    setLoading(true);
                    const { data } = await api.get('/all_products');
                    setProducts(Array.isArray(data?.rows) ? data.rows : []);
                  } catch (err) {
                    setLoadError(normalizeAxiosError(err));
                  } finally {
                    setLoading(false);
                  }
                }
              : null
          }
        />

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={Package} label="Products" value={totalCount} />
          <StatCard icon={TrendingDown} label="Low Stock" value={lowCount} sub={lowCount > 0 ? 'Reorder recommended' : 'All good'} />
          <StatCard icon={DollarSign} label="Inventory Value" value={fmtMoney(inventoryValue)} />
        </div>

        {/* Add Product Toggle */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => {
              setAddError(null);
              setAddFieldErrors({});
              setWantToAdd((prev) => !prev);
            }}
            className="inline-flex items-center gap-2 rounded-xl bg-[#224765] px-4 py-2 text-white shadow hover:bg-[#1a3a56]"
          >
            {wantToAdd ? <><Minus className="h-4 w-4" /> Close</> : <><Plus className="h-4 w-4" /> Add product</>}
          </button>
        </div>

        {/* Add Product Form */}
        {wantToAdd && (
          <div className="rounded-2xl border border-[#224765]/10 bg-white p-6 shadow-sm mb-6">
            {addError && <ErrorBanner error={addError} compact />}
            <InputForm
              Chip={Chip}
              newProduct={newProduct}
              setNewProduct={(updater) => {
                setAddError(null);
                setAddFieldErrors({});
                setNewProduct(updater);
              }}
              canAdd={canAdd && !addBusy}
              handleAddProduct={handleAddProduct}
              busy={addBusy}
              fieldErrors={addFieldErrors}
            />
          </div>
        )}

        {/* Product List */}
        <div className="rounded-2xl border border-[#224765]/10 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="text-center text-[#224765]">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-[#224765]/70">
              {products.length === 0 ? 'No products yet.' : 'No products match your search.'}
            </div>
          ) : (
            <Table
              filtered={filtered}
              Chip={Chip}
              fmtMoney={fmtMoney}
              requestDelete={requestDelete}
              schema={schema}
            />
          )}
        </div>

        {/* Delete confirm */}
        <ConfirmDialog
          open={confirm.open}
          title="Delete product"
          description={
            confirm.name
              ? `This will permanently remove “${confirm.name}” (ID: ${confirm.id}) from your inventory.`
              : 'This will permanently remove the selected product from your inventory.'
          }
          confirmText={confirm.busy ? 'Deleting…' : 'Delete product'}
          cancelText="Cancel"
          onConfirm={confirm.busy ? undefined : confirmDelete}
          onClose={confirm.busy ? undefined : () => setConfirm({ open: false, id: null, name: '', busy: false, error: null })}
          disabled={confirm.busy}
          errorMessage={confirm.error?.message}
        />
      </div>
    </div>
  );
};

export { StockManager };
