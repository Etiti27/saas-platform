// LowStockManager.jsx
import React, { useMemo, useState, useEffect } from 'react';
import axios from 'axios';
import { Package, Search, TrendingDown, DollarSign, Plus, Minus } from 'lucide-react';
import { ConfirmDialog } from './confirmDialogue';
import { Table } from './Table';
import { InputForm } from './InputForm';

const Chip = ({ tone = 'gray', children }) => {
  const tones = {
    gray: 'bg-gray-100 text-gray-700 ring-gray-200',
    red: 'bg-red-100 text-red-700 ring-red-200',
    amber: 'bg-amber-100 text-amber-700 ring-amber-200',
    green: 'bg-green-100 text-green-700 ring-green-200',
    blue: 'bg-blue-100 text-blue-700 ring-blue-200',
    violet: 'bg-violet-100 text-violet-700 ring-violet-200',
  };
  return (
    <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ring-1 ${tones[tone] || tones.gray}`}>
      {children}
    </span>
  );
};

const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });
const fmtMoney = (n) => (Number.isFinite(+n) ? currency.format(+n) : '—');

const StatCard = ({ icon: Icon, label, value, sub }) => (
  <div className="flex items-center gap-4 rounded-2xl border border-[#224765]/10 bg-white p-4 shadow-sm">
    <div className="grid h-12 w-12 place-content-center rounded-xl ring-1 ring-[#224765]/20 bg-[#D3E2FD]/50">
      <Icon className="h-6 w-6 text-[#224765]" />
    </div>
    <div className="min-w-0">
      <div className="text-sm text-[#224765]/70">{label}</div>
      <div className="text-lg font-semibold truncate text-[#224765]">{value}</div>
      {sub && <div className="text-xs text-[#224765]/60">{sub}</div>}
    </div>
  </div>
);

const StockManager = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [confirm, setConfirm] = useState({ open: false, id: null, name: '' });
  const [newProduct, setNewProduct] = useState({
    name: '',
    quantity: '',
    threshold: '',
    cost_price: '',
    sale_price: '',
    expiring_date: '',
    location: '',
  });
  const [wantToAdd, setWantToAdd] = useState(false);
  const email= user?.email;
  const schema= user?.tenant?.schema_name;
  console.log({email, schema});

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await axios.get('http://localhost:3001/route/all_products', {
          headers: { 'Tenant-Schema': schema},
          signal: controller.signal,
        });
        setProducts(data?.rows ?? []);
      } catch (err) {
        if (err.code !== 'ERR_CANCELED') setError(err);
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, []);

  const requestDelete = (id, name) => setConfirm({ open: true, id, name });

  const confirmDelete = async () => {
    try {
      const res = await axios.post('http://localhost:3001/route/delete_product', {
        id: confirm.id,
        name: confirm.name,
        schema: schema,
      });
      if (res.status === 200) {
        setConfirm({ open: false, id: null, name: '' });
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const handleAddProduct = async () => {
    const { name, quantity, threshold, location, cost_price, sale_price } = newProduct;
    if (!name || !quantity || !threshold || !location || !cost_price || !sale_price) return;
    try {
      const res = await axios.post('http://localhost:3001/route/add_product', {
        newProduct,
        email: email,
        schema: schema,
      });
      if (res.status === 200) {
        setNewProduct({
          name: '',
          quantity: '',
          threshold: '',
          location: '',
          sale_price: '',
          cost_price: '',
          expiring_date: '',
        });
        window.location.reload();
      }
    } catch (err) {
      console.log(err);
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.id.toLowerCase().includes(q) ||
        p.product_name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q)
    );
  }, [products, search]);

  const lowCount = filtered.filter((p) => p.quantity <= p.threshold).length;
  const totalCount = filtered.length;
  const inventoryValue = filtered.reduce((sum, p) => sum + (Number(p.sale_price) || 0) * (Number(p.quantity) || 0), 0);

  const canAdd = newProduct.name && newProduct.quantity && newProduct.threshold && newProduct.location && newProduct.cost_price && newProduct.sale_price;

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
            />
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <StatCard icon={Package} label="Products" value={totalCount} />
          <StatCard icon={TrendingDown} label="Low Stock" value={lowCount} sub={lowCount > 0 ? 'Reorder recommended' : 'All good'} />
          <StatCard icon={DollarSign} label="Inventory Value" value={fmtMoney(inventoryValue)} />
        </div>

        {/* Add Product Button */}
        <div className="flex justify-end mb-6">
          <button
            onClick={() => setWantToAdd((prev) => !prev)}
            className="inline-flex items-center gap-2 rounded-xl bg-[#224765] px-4 py-2 text-white shadow hover:bg-[#1a3a56]"
          >
            {wantToAdd ? <><Minus className="h-4 w-4" /> Close</> : <><Plus className="h-4 w-4" /> Add product</>}
          </button>
        </div>

        {/* Add Product Form */}
        {wantToAdd && (
          <div className="rounded-2xl border border-[#224765]/10 bg-white p-6 shadow-sm mb-6">
            <InputForm Chip={Chip} newProduct={newProduct} handleAddProduct={handleAddProduct} canAdd={canAdd} setNewProduct={setNewProduct} />
          </div>
        )}

        {/* Product List */}
        <div className="rounded-2xl border border-[#224765]/10 bg-white p-6 shadow-sm">
          {loading ? (
            <div className="text-center text-[#224765]">Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="text-center text-[#224765]/70">No products found. Try adding one.</div>
          ) : (
            <Table filtered={filtered} Chip={Chip} fmtMoney={fmtMoney} requestDelete={requestDelete} schema={schema}/>
          )}
        </div>

        <ConfirmDialog
          open={confirm.open}
          title="Delete product"
          description={confirm.name ? `This will permanently remove “${confirm.name}” (ID: ${confirm.id}) from your inventory.` : 'This will permanently remove the selected product from your inventory.'}
          confirmText="Delete product"
          cancelText="Cancel"
          onConfirm={confirmDelete}
          onClose={() => setConfirm({ open: false, id: null, name: '' })}
        />
      </div>
    </div>
  );
};

export { StockManager };
