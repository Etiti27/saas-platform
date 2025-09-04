import React, { useState, useMemo, useEffect, useRef } from 'react';
import axios from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { ViewInvoice } from './viewInvoice';
import { Checkbox } from './Component/checkBox';
import { calcProfit } from './Services/Profit';
import { LoadingFullScreen } from './Component/loading';
import { AlertBanner } from './Component/AlertBanner';
import { calculateTotal } from './Services/CalculateTotal';
import { IndividualSaleRecord } from './Component/IndividualSaleRecord';
import { CatalogSearch } from './Component/CatalogSearch';
import { Table } from './Component/Table';

const BRAND = {
  primary: '#224765',
  primaryDark: '#1a3a56',
  tint: '#D3E2FD',
};

const extractError = (err) => {
  if (!err) return { message: 'Unknown error' };
  const status = err?.response?.status;
  const message =
    err?.response?.data?.message ||
    err?.message ||
    'Request failed';
  const code = err?.code;
  const url = err?.config?.url;
  const details = typeof err?.response?.data === 'string'
    ? err.response.data
    : JSON.stringify(err?.response?.data ?? {}, null, 2);
  return { status, message, code, url, details };
};

const InvoiceGenerator = ({ user, employee }) => {
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProduct] = useState([]);

  const [search, setSearch] = useState('');
  const [lookupError, setLookupError] = useState('');

  const [showPreview, setShowPreview] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [status, setStatus] = useState('pending');
  const [submitting, setSubmitting] = useState(false);

  const [creatingError, setCreatingError] = useState(null);
  const [catalogError, setCatalogError] = useState(null);

  const [discountType, setDiscountType] = useState('amount'); // 'amount' | 'percent'
  const [discountValue, setDiscountValue] = useState('');

  const [loading, setLoading] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);
  const [sales, setSales] = useState([]);
  const [salesLoading, setSalesLoading] = useState(false);
  const [salesError, setSalesError] = useState(null);

  const apiRoute = import.meta.env.VITE_API_URL;
  const schema = user?.tenant?.schema_name;

  const invoiceNumber = useRef(uuidv4().replace(/-/g, '').slice(0, 8)).current;

  // ---- Load catalog
  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setCatalogError(null);
        const { data } = await axios.get(`${apiRoute}/route/product/all_products`, {
          headers: { 'Tenant-Schema': schema },
          signal: controller.signal,
        });
        setAllProduct(data?.rows ?? []);
      } catch (err) {
        if (err.code !== 'ERR_CANCELED') setCatalogError(extractError(err));
      } finally {
        setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [schema, apiRoute]); // include apiRoute

  // ---- Matches
  const matches = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return [];
    return (allProducts || [])
      .filter(
        (p) =>
          (p.product_name || '').toLowerCase().includes(q) ||
          (p.location || '').toLowerCase().includes(q)
      )
      .slice(0, 8);
  }, [allProducts, search]);

  const addFromMatch = (m) => {
    setProducts((prev) => {
      const idx = prev.findIndex((it) =>
        it.id && m.id ? it.id === m.id : it.name === m.product_name
      );
      if (idx >= 0) {
        const copy = [...prev];
        const currentQty = Number(copy[idx].quantity) || 0;
        copy[idx] = { ...copy[idx], quantity: currentQty + 1 };
        return copy;
      }
      return [
        ...prev,
        {
          id: m.id,
          name: m.product_name,
          product_name: m.product_name,
          quantity: 1,
          amount: m.sale_price,
          location: m.location,
          costPrice: m.cost_price,
        },
      ];
    });
    setSearch('');
    setLookupError('');
  };

  // ---- Totals + discount
  const subtotal = calculateTotal({ products });
  const discountRaw = Number(discountValue) || 0;
  const percent = discountType === 'percent' ? Math.min(Math.max(discountRaw, 0), 100) : null;
  const discountAmount =
    discountType === 'percent'
      ? (subtotal * percent) / 100
      : Math.min(Math.max(discountRaw, 0), subtotal);
  const grandTotal = Math.max(subtotal - discountAmount, 0);

  // ---- Create order
  const MarkPaid = async () => {
    if (submitting) return;
    setSubmitting(true);
    setCreatingError(null);

    try {
      const profit = await calcProfit({ products, discountTotal: discountAmount });
      const payload = {
        orderNumber: invoiceNumber,
        items: products,
        profit,
        status,
        totalPaid: grandTotal.toFixed(2),
        discountAmount: Number(discountAmount) || 0,
        soldById: employee?.id,
      };

      const response = await axios.post(
        `${apiRoute}/route/orders/create_order`,
        payload,
        { headers: { 'Tenant-Schema': schema } }
      );

      if (response.status >= 200 && response.status < 300) {
        setShowPreview(true);
      }
    } catch (err) {
      setCreatingError(extractError(err));
      console.error('Failed to create order:', err);
    } finally {
      setSubmitting(false);
    }
  };

  // ---- Sales
  const fetchSales = async () => {
    try {
      setSalesLoading(true);
      setSalesError(null);
      const { data } = await axios.get(`${apiRoute}/route/orders/date`, {
        headers: { 'Tenant-Schema': schema },
        params: { dateFrom, dateTo, soldById: employee?.id },
      });
      const rows = Array.isArray(data?.rows) ? data.rows : Array.isArray(data) ? data : [];
      setSales(rows);
    } catch (err) {
      setSalesError(extractError(err));
    } finally {
      setSalesLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const orderTotals = (order) => {
    const items = Array.isArray(order?.items) ? order.items : [];
    const sub = items.reduce(
      (s, it) =>
        s +
        (Number(it.amount ?? it.unit_price) || 0) * (Number(it.quantity) || 0),
      0
    );
    const disc = Number(order?.total_discount ?? order?.discountAmount ?? 0) || 0;
    const total = Math.max(sub - disc, 0);
    return { sub, disc, total };
  };

  return (
    <div
      className="min-h-screen"
      style={{ background: `linear-gradient(135deg, ${BRAND.tint}, #ffffff 40%, ${BRAND.tint})` }}
    >
      {loading ? (
        <LoadingFullScreen />
      ) : (
        // Top→bottom stack; room to breathe
        <main className="min-h-screen w-full px-4 py-8">
          <div className="w-full max-w-7xl mx-auto flex flex-col gap-10">
            {/* ===== Invoice card ===== */}
            <section>
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl ring-1 ring-[#224765]/10">
                {/* Catalog error */}
                {catalogError && (
                  <div className="mb-4">
                    <AlertBanner
                    BRAND={BRAND}
                      title="Catalog loading failed"
                      message={catalogError.message}
                      status={catalogError.status}
                      details={catalogError.details}
                      onClose={() => setCatalogError(null)}
                    />
                  </div>
                )}

                {/* Header */}
                <div className="mb-6 md:mb-8 text-center">
                  <div className="mb-3 flex items-center justify-center gap-3">
                    <div className="h-12 w-12 rounded-full overflow-hidden bg-white ring-2 ring-[#224765]/20 shadow-sm">
                      <img
                        src={user?.tenant?.logo}
                        alt="our company logo"
                        className="h-full w-full object-contain"
                        loading="lazy"
                      />
                    </div>
                    <h1 className="text-2xl md:text-3xl font-bold leading-tight text-[#224765]">
                      {user?.tenant?.name?.toUpperCase()}
                    </h1>
                  </div>
                  <h2 className="text-xl md:text-2xl font-semibold text-[#224765]">
                    Invoice Generator
                  </h2>
                </div>

                {/* Catalog search */}
                <div className="mb-4 md:mb-6">
                  <CatalogSearch
                    addFromMatch={addFromMatch}
                    BRAND={BRAND}
                    search={search}
                    setLookupError={setLookupError}
                    setSearch={setSearch}
                    matches={matches}
                    lookupError={lookupError}
                  />
                </div>

                {/* Items table */}
                <div className="mb-4 md:mb-6">
                  <Table BRAND={BRAND} products={products} setDiscountType={setDiscountType} setDiscountValue={setDiscountValue}
                    discountAmount={discountAmount}
                    subtotal={subtotal}
                    discountType={discountType}
                    discountValue={discountValue}
                    grandTotal={grandTotal}
                    setProducts={setProducts}
                  />
                </div>

                {/* Create order error */}
                {creatingError && (
                  <div className="mb-4">
                    <AlertBanner
                    BRAND={BRAND}
                      title="Couldn't save order"
                      message={creatingError.message}
                      status={creatingError.status}
                      details={creatingError.details}
                      onClose={() => setCreatingError(null)}
                    />
                  </div>
                )}

                {/* Confirmation */}
                {products.length > 0 && (
                  <div
                    className="mt-4 md:mt-6 rounded-xl p-3 md:p-4 ring-1 ring-[#224765]/10"
                    style={{ background: `${BRAND.tint}4D` }}
                  >
                    <Checkbox
                      label="I confirm payment for this invoice has been received."
                      checked={confirmed}
                      onChange={() => {
                        setConfirmed((prev) => !prev);
                        setStatus('paid');
                      }}
                    />
                  </div>
                )}

                {/* Mark as Paid */}
                {confirmed && products.length > 0 && !showPreview && (
                  <div className="flex justify-center mt-6 md:mt-8">
                    <button
                      onClick={MarkPaid}
                      disabled={submitting}
                      className="inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-white shadow disabled:opacity-50 disabled:cursor-not-allowed"
                      style={{ background: BRAND.primary }}
                    >
                      {submitting ? 'Saving…' : 'Mark as Paid'}
                    </button>
                  </div>
                )}

                {/* Preview */}
                {showPreview && (
                  <div className="mt-6">
                    <ViewInvoice
                      invoiceNumber={invoiceNumber}
                      user={user}
                      products={products}
                      calculateTotal={calculateTotal}
                      discountType={discountType}
                      discountValue={discountValue}
                      setShowPreview={setShowPreview}
                    />
                  </div>
                )}
              </div>
            </section>

            {/* ===== Sales card (bottom) ===== */}
            <section>
              <div className="bg-white p-6 md:p-8 rounded-2xl shadow-xl ring-1 ring-[#224765]/10">
                <IndividualSaleRecord
                  BRAND={BRAND}
                  setDateFrom={setDateFrom}
                  setDateTo={setDateTo}
                  fetchSales={fetchSales}
                  sales={sales}
                  salesError={salesError}
                  salesLoading={salesLoading}
                  dateFrom={dateFrom}
                  dateTo={dateTo}
                  orderTotals={orderTotals}
                />
              </div>
            </section>
          </div>
        </main>
      )}
    </div>
  );
};

export { InvoiceGenerator };
