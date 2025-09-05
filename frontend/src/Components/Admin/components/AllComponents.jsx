import React, { useMemo, useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  ShoppingCart,
  Package,
  CalendarDays,
  Receipt,
  TrendingUp,
  RotateCcw,
  ChevronRight,
} from 'lucide-react';
import { fmtMoney, Toolbar, KPICard, Section } from './Services';
import axios from 'axios';
import { TimeSeriesChart } from './Graph';
import { TopProductsByUnits } from './TopProductByUnit';
import { EmployeeSalesSummary } from './SummarizeEmployeeUI';
import { SalesSummary } from './AllSales';
import { RefundTable } from './RefundAdminTable';
import {
  totalPresentCostInventory,
  totalPresentInventorySale,
  revenueByTimeRangee,
  refundAmounts,

  LowStockManager,
  totalExpenses,
  profitForAllSale,
  grandProfit,
} from './Service/InventorySale';
import { ExpenseTable } from './ExpensesTable';
/* --- helpers --- */
const toCSV = (rows, headers) => {
  const head = headers.join(',');
  const body = rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(',')).join('\n');
  return `${head}\n${body}`;
};
const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const isoDay = (d) => (d instanceof Date ? d : new Date(d)).toISOString().slice(0, 10);

function CollapsibleSection({ id, title, subtitle, tone, open, onToggle, right, children }) {
  return (
    <section
      className={`rounded-2xl border ${
        tone === 'dark' ? 'border-slate-700 bg-slate-900/40' : 'border-[#224765]/10 bg-white'
      } shadow-sm`}
    >
      <button
        type="button"
        className={`w-full px-4 py-3 flex items-center gap-3 text-left ${
          tone === 'dark' ? 'text-slate-100 hover:bg-slate-800/60' : 'text-[#224765] hover:bg-[#D3E2FD]/40'
        } rounded-2xl`}
        aria-expanded={open}
        aria-controls={id}
        onClick={onToggle}
      >
        <ChevronRight className={`h-5 w-5 transition-transform ${open ? 'rotate-90' : ''}`} />
        <div className="flex-1">
          <div className="font-semibold">{title}</div>
          {subtitle ? (
            <div className={`text-xs ${tone === 'dark' ? 'text-slate-300' : 'text-[#224765]/70'}`}>{subtitle}</div>
          ) : null}
        </div>
        {right ? <div className="ml-2">{right}</div> : null}
      </button>

      <div id={id} hidden={!open} className="px-4 pb-4">
        {children}
      </div>
    </section>
  );
}

export function AdminDashboardPro({
  user,
  currency = 'USD',
  theme = 'light',
  enableDownloads = false,
}) {
  const tone = theme === 'dark' ? 'dark' : 'light';

  // dates
  const today = isoDay(new Date());
  const weekAgo = isoDay(new Date(Date.now() - 6 * 24 * 3600 * 1000));
  const [timeframe, setTimeframe] = useState('7d'); // quick ranges control
  const [dateFrom, setDateFrom] = useState(today);
  const [dateTo, setDateTo] = useState(today);

  // separate graph range
  const [graphDateFrom, setGraphDateFrom] = useState(weekAgo);
  const [graphDateTo, setGraphDateTo] = useState(today);

  // data
  const [products, setProducts] = useState([]);
  const [sales, setSales] = useState([]);
  const [graphSales, setGraphSales] = useState([]);
  const [refund, setRefund] = useState([]);
  const [expenses, setExpenses] = useState([]);
  

  // loading / error states
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [errorProducts, setErrorProducts] = useState(null);

  const [loadingSales, setLoadingSales] = useState(false);
  const [errorSales, setErrorSales] = useState(null);

  const [loadingGraph, setLoadingGraph] = useState(false);
  const [errorGraph, setErrorGraph] = useState(null);

  const [loadingRefunds, setLoadingRefunds] = useState(false);
  const [errorRefunds, setErrorRefunds] = useState(null);

  const [loadingExpenses, setLoadingExpenses] = useState(false);
  const [errprExpenses, setErrorExpenses] = useState(null); // keep original name to avoid breaking anything

  // env
  const schema = user?.tenant?.schema_name;
  const apiURL = import.meta.env.VITE_API_URL;

  /* -------------------------
     Fetchers (stable)
  --------------------------*/
  const fetchProducts = useCallback(() => {
    if (!schema || !apiURL) return;
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoadingProducts(true);
        setErrorProducts(null);
        const { data } = await axios.get(`${apiURL}/route/product/all_products`, {
          headers: { 'Tenant-Schema': schema },
          signal: ctrl.signal,
        });
        setProducts(Array.isArray(data?.rows) ? data.rows : []);
      } catch (e) {
        if (e.code !== 'ERR_CANCELED') setErrorProducts(e?.message || 'Failed to load products');
      } finally {
        setLoadingProducts(false);
      }
    })();
    return () => ctrl.abort();
  }, [schema, apiURL]);

  const fetchExpenses = useCallback((from, to) => {
    if (!schema || !apiURL || !from || !to) {
      console.warn('fetchExpenses: missing schema/apiURL/from/to');
      return () => {};
    }
    const ctrl = new AbortController();
    setLoadingExpenses(true);
    setErrorExpenses(null);

    (async () => {
      try {
        const { data } = await axios.get(`${apiURL}/expenses/date`, {
          headers: { 'Tenant-Schema': schema },
          params: { dateFrom: from, dateTo: to },
          signal: ctrl.signal,
        });
        const rows = Array.isArray(data?.rows) ? data.rows : (Array.isArray(data) ? data : []);
        setExpenses(rows);
      } catch (e) {
        if (e.code !== 'ERR_CANCELED') {
          setErrorExpenses(e?.response?.data?.message || e?.message || 'Failed to load expenses');
        }
      } finally {
        setLoadingExpenses(false);
      }
    })();

    return () => ctrl.abort();
  }, [schema, apiURL]);

  const fetchSales = useCallback((from, to) => {
    if (!schema || !apiURL || !from || !to) return;
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoadingSales(true);
        setErrorSales(null);
        const { data } = await axios.get(`${apiURL}/route/orders/date`, {
          headers: { 'Tenant-Schema': schema },
          params: { dateFrom: from, dateTo: to },
          signal: ctrl.signal,
        });
        const rows = Array.isArray(data?.rows) ? data.rows : Array.isArray(data) ? data : [];
        setSales(rows);
      } catch (e) {
        if (e.code !== 'ERR_CANCELED') setErrorSales(e?.message || 'Failed to load sales');
      } finally {
        setLoadingSales(false);
      }
    })();
    return () => ctrl.abort();
  }, [schema, apiURL]);

  const fetchGraphSales = useCallback((from, to) => {
    if (!schema || !apiURL || !from || !to) return;
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoadingGraph(true);
        setErrorGraph(null);
        const { data } = await axios.get(`${apiURL}/route/orders/date`, {
          headers: { 'Tenant-Schema': schema },
          params: { dateFrom: from, dateTo: to },
          signal: ctrl.signal,
        });
        const rows = Array.isArray(data?.rows) ? data.rows : Array.isArray(data) ? data : [];
        setGraphSales(rows);
      } catch (e) {
        if (e.code !== 'ERR_CANCELED') setErrorGraph(e?.message || 'Failed to load chart data');
      } finally {
        setLoadingGraph(false);
      }
    })();
    return () => ctrl.abort();
  }, [schema, apiURL]);

  const fetchRefunds = useCallback((from, to) => {
    if (!schema || !apiURL || !from || !to) return;
    const ctrl = new AbortController();
    (async () => {
      try {
        setLoadingRefunds(true);
        setErrorRefunds(null);
        const { data } = await axios.get(`${apiURL}/route/refund/get-refund`, {
          headers: { 'Tenant-Schema': schema },
          params: { dateFrom: from, dateTo: to },
          signal: ctrl.signal,
        });
        const rows = Array.isArray(data?.rows) ? data.rows : Array.isArray(data) ? data : [];
        setRefund(rows);
      } catch (e) {
        if (e.code !== 'ERR_CANCELED') setErrorRefunds(e?.message || 'Failed to load refunds');
      } finally {
        setLoadingRefunds(false);
      }
    })();
    return () => ctrl.abort();
  }, [schema, apiURL]);

  /* -------------------------
     Effects
  --------------------------*/
  useEffect(() => {
    const abort = fetchProducts();
    return abort;
  }, [fetchProducts]);

  useEffect(() => {
    const abort = fetchExpenses(dateFrom, dateTo);
    return abort;
  }, [fetchExpenses, dateFrom, dateTo]);

  useEffect(() => {
    const abort = fetchSales(dateFrom, dateTo);
    return abort;
  }, [fetchSales, dateFrom, dateTo]);

  useEffect(() => {
    const abort = fetchGraphSales(graphDateFrom, graphDateTo);
    return abort;
  }, [fetchGraphSales, graphDateFrom, graphDateTo]);

  useEffect(() => {
    const abort = fetchRefunds(dateFrom, dateTo);
    return abort;
  }, [fetchRefunds, dateFrom, dateTo]);

  /* -------------------------
     Derived metrics
  --------------------------*/
  const inventorySaleValue = useMemo(() => {
    return totalPresentInventorySale(products);
  }, [products]);

  const inventoryCost = useMemo(() => {
    return totalPresentCostInventory(products);
  }, [products]);

  const revenueByTimeRange = useMemo(() => {
    return revenueByTimeRangee(sales);
  }, [sales]);

  const refundAmount = useMemo(() => {
    return refundAmounts(refund);
  }, [refund]);

  const Expenses = useMemo(() => {
    return totalExpenses(expenses);
  }, [expenses]);

  const totalProfitFromSale = useMemo(() => {
    return profitForAllSale(sales);
  }, [sales]);

  const grandProfits = useMemo(() => {
    return grandProfit({
      profitForAllSale: totalProfitFromSale,
      totalExpenses: Expenses,
      refundAmounts: refundAmount,
    });
  }, [totalProfitFromSale, Expenses, refundAmount]);

  console.log(grandProfits);
  console.log(Expenses);
  console.log(refundAmount);



  // Chart rows (by day), using graphSales
  const rows = useMemo(() => {
    if (!Array.isArray(graphSales)) return [];
    const byDay = new Map();
    for (const o of graphSales) {
      const day = (o.added_date ?? o.updated_at ?? '').slice(0, 10);
      if (!day) continue;
      const prev = byDay.get(day) || { date: day, revenue: 0, profit: 0, refunds: 0, count: 0 };
      prev.revenue += toNum(o.total_paid) - toNum(o.refunded_amount);
      prev.profit += toNum(o.profit);
      prev.refunds += toNum(o.refunded_amount);
      prev.count += 1;
      byDay.set(day, prev);
    }
    return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
  }, [graphSales]);

  console.log(expenses);
  // low stock list
  const lowStock = useMemo(() => LowStockManager(products), [products]);

  /* -------------------------
     Accordion state
  --------------------------*/
  const [openSection, setOpenSection] = useState(null); // all collapsed by default
  const isOpen = (id) => openSection === id;
  const toggle = (id) => setOpenSection((prev) => (prev === id ? null : id));

  /* -------------------------
     Handlers
  --------------------------*/
  const resetMainDates = () => {
    setDateFrom(today);
    setDateTo(today);
  };
  const resetGraphDates = () => {
    setGraphDateFrom(weekAgo);
    setGraphDateTo(today);
  };

  const handleExport = () => {
    const csv = toCSV(rows, ['date', 'revenue', 'profit', 'refunds', 'count']);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'performance.csv';
    a.click();
    URL.revokeObjectURL(url);
  };
console.log(refund[0]?.order.total_paid);
  /* -------------------------
     Render
  --------------------------*/
  return (
    <div
      className={`min-h-screen w-full bg-gradient-to-br ${
        tone === 'dark' ? 'from-slate-900 via-slate-900 to-slate-900' : 'from-[#D3E2FD] via-white to-[#D3E2FD]'
      }`}
    >
      <div className="mx-auto max-w-7xl space-y-4 p-6">
        {/* Header (always visible) */}
        <div>
          <h1 className={`text-2xl font-bold tracking-tight ${tone === 'dark' ? 'text-white' : 'text-[#224765]'}`}>
            Admin Dashboard
          </h1>
          <p className={`${tone === 'dark' ? 'text-slate-300' : 'text-[#224765]/70'} text-sm`}>
            Quick view of your business health.
          </p>
        </div>

        {/* Inventory snapshot */}
        
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <KPICard tone={tone} icon={Package} label="Sale Inventory Value" value={fmtMoney(inventorySaleValue, currency)} />
            <KPICard tone={tone} icon={Receipt} label="Cost Inventory Value" value={fmtMoney(inventoryCost, currency)} />
          </div>
       

        {/* Filters & Export */}
       {/*  <CollapsibleSection
          id="sec-controls"
          title="Filters & Export"
          subtitle="Pick a date range, quick presets, and export CSV"
          tone={tone}
          open={isOpen('sec-controls')}
          onToggle={() => toggle('sec-controls')}
          right={
            <Toolbar
              tone={tone}
              timeframe={timeframe}
              setTimeframe={(tf) => {
                setTimeframe(tf);
                const now = new Date();
                if (tf === '7d') {
                  setDateFrom(isoDay(new Date(now.getTime() - 6 * 24 * 3600 * 1000)));
                  setDateTo(isoDay(now));
                } else if (tf === '30d') {
                  setDateFrom(isoDay(new Date(now.getTime() - 29 * 24 * 3600 * 1000)));
                  setDateTo(isoDay(now));
                }
              }}
              enableDownloads={enableDownloads}
              onExportCSV={handleExport}
            />
          }
        > */}
          <div className="flex flex-wrap items-center gap-3 w-full justify-end">
            <div className="flex items-center gap-2 text-sm">
              <CalendarDays className={`h-4 w-4 ${tone === 'dark' ? 'text-slate-200' : 'text-[#224765]'}`} />
              <input
                type="date"
                className={`rounded-lg border px-2 py-1 ${
                  tone === 'dark' ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-[#224765]/20'
                }`}
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
              />
              <span className={tone === 'dark' ? 'text-slate-300' : 'text-[#224765]/60'}>to</span>
              <input
                type="date"
                className={`rounded-lg border px-2 py-1 ${
                  tone === 'dark' ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-[#224765]/20'
                }`}
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
              />
              <button
                type="button"
                className={`ml-1 inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs ${
                  tone === 'dark'
                    ? 'border-slate-600 text-slate-100 hover:bg-slate-800'
                    : 'border-[#224765]/20 text-[#224765] hover:bg-[#D3E2FD]/40'
                }`}
                onClick={resetMainDates}
                title="Reset to last 7 days"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
          </div>
       

        {/* KPIs */}
        <CollapsibleSection
          id="sec-kpis"
          title="Key Metrics"
          subtitle="Orders, revenue, refunds, profit, expenses"
          tone={tone}
          open={isOpen('sec-kpis')}
          onToggle={() => toggle('sec-kpis')}
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
            <KPICard tone={tone} icon={ShoppingCart} label="Orders" value={Array.isArray(sales) ? sales.length : 0} />
            <KPICard tone={tone} icon={DollarSign} label="Revenue" value={fmtMoney(revenueByTimeRange, currency)} />
            <KPICard tone={tone} icon={RotateCcw} label="Refunds" value={fmtMoney(refundAmount, currency)} />
            <KPICard tone={tone} icon={TrendingUp} label="Profit" value={fmtMoney(grandProfits, currency)} />
            <KPICard tone={tone} icon={TrendingUp} label="Expenses" value={fmtMoney(Expenses, currency)} />
          </div>
        </CollapsibleSection>

        {/* Status / Errors */}
     
          {errorProducts && (
            <div className="mb-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Products: {errorProducts}
            </div>
          )}
          {errorSales && (
            <div className="mb-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Sales: {errorSales}
            </div>
          )}
          {errorRefunds && (
            <div className="mb-2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              Refunds: {errorRefunds}
            </div>
          )}
       

        {/* Top products & Refunds table */}
        <CollapsibleSection
          id="sec-tables"
          title="Top Products & Refunds"
          subtitle="Best-sellers and refund details"
          tone={tone}
          open={isOpen('sec-tables')}
          onToggle={() => toggle('sec-tables')}
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <TopProductsByUnits
              orders={sales}
              from={dateFrom}
              to={dateTo}
              currency={currency}
              limit={10}
              loading={loadingSales}
            />
            <RefundTable
              refund={refund}
              currency={currency}
              tone={tone}
              to={dateTo}
              from={dateFrom}
              loading={loadingRefunds}
            />
          </div>
        </CollapsibleSection>

        {/* Team & Low stock */}
        <CollapsibleSection
          id="sec-people-stock"
          title="Team & Stock"
          subtitle="Employee sales summary and low-stock alerts"
          tone={tone}
          open={isOpen('sec-people-stock')}
          onToggle={() => toggle('sec-people-stock')}
        >
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <EmployeeSalesSummary
              orders={sales}
              currency={currency}
              tone={tone}
              to={dateTo}
              from={dateFrom}
              loading={loadingSales}
            />

            <Section tone={tone} title="Low Stock" subtitle="At or below threshold">
              <div className="mt-6 overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr
                      className={`border-b ${
                        tone === 'dark'
                          ? 'border-slate-700 bg-slate-800 text-slate-200'
                          : 'border-[#224765]/10 bg-[#D3E2FD]/30 text-[#224765]'
                      }`}
                    >
                      <th className="px-3 py-2 font-medium">#</th>
                      <th className="px-3 py-2 font-medium">Product</th>
                      <th className="px-3 py-2 font-medium">Qty</th>
                      <th className="px-3 py-2 font-medium">Threshold</th>
                      <th className="px-3 py-2 font-medium">Location</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lowStock?.length ? (
                      lowStock.map((r, i) => (
                        <tr
                          key={r.id ?? `${r.product_name}-${i}`}
                          className={`border-b ${
                            tone === 'dark'
                              ? 'border-slate-700 hover:bg-slate-800/60'
                              : 'border-[#224765]/10 hover:bg-[#D3E2FD]/10'
                          }`}
                        >
                          <td className="px-3 py-2">{i + 1}</td>
                          <td className="px-3 py-2">{r.product_name}</td>
                          <td className="px-3 py-2">{r.quantity}</td>
                          <td className="px-3 py-2">{r.threshold}</td>
                          <td className="px-3 py-2">{r.location}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={5}
                          className={`px-3 py-6 text-center ${
                            tone === 'dark' ? 'text-slate-400' : 'text-[#224765]/60'
                          }`}
                        >
                          {loadingProducts ? 'Loading…' : 'No low-stock items'}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </Section>
          </div>
        </CollapsibleSection>

        {/* Sales summary */}
        <CollapsibleSection
          id="sec-summary"
          title="Sales Summary"
          subtitle="Aggregates for the selected period"
          tone={tone}
          open={isOpen('sec-summary')}
          onToggle={() => toggle('sec-summary')}
        >
          <SalesSummary
            orders={sales}
            currency={currency}
            tone={tone}
            to={dateTo}
            from={dateFrom}
            loading={loadingSales}
          />
        </CollapsibleSection>

        <CollapsibleSection
          id="expenses"
          title="Expenses Summary"
          subtitle="Expenses for the selected period"
          tone={tone}
          open={isOpen('expenses')}
          onToggle={() => toggle('expenses')}
        >

        <ExpenseTable
          tone={tone}
          expenses={expenses}
          loadingProducts={loadingExpenses}
          
        
         />
        {/*   <SalesSummary
            orders={sales}
            currency={currency}
            tone={tone}
            to={dateTo}
            from={dateFrom}
            loading={loadingSales}
          /> */}
        </CollapsibleSection>

        {/* Performance charts */}
        <CollapsibleSection
          id="sec-performance"
          title="Performance Charts"
          subtitle="Revenue and Profit over time"
          tone={tone}
          open={isOpen('sec-performance')}
          onToggle={() => toggle('sec-performance')}
        >
          <div className="w-full bg-gradient-to-br from-[#D3E2FD] via-white to-[#D3E2FD] rounded-xl">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-[#224765]">Performance</h2>
                  <p className="text-sm text-[#224765]/70">Track revenue and profit over time.</p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-sm">
                <CalendarDays className={`h-4 w-4 ${tone === 'dark' ? 'text-slate-200' : 'text-[#224765]'}`} />
                <input
                  type="date"
                  className={`rounded-lg border px-2 py-1 ${
                    tone === 'dark' ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-[#224765]/20'
                  }`}
                  value={graphDateFrom}
                  onChange={(e) => setGraphDateFrom(e.target.value)}
                />
                <span className={tone === 'dark' ? 'text-slate-300' : 'text-[#224765]/60'}>to</span>
                <input
                  type="date"
                  className={`rounded-lg border px-2 py-1 ${
                    tone === 'dark' ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-[#224765]/20'
                  }`}
                  value={graphDateTo}
                  onChange={(e) => setGraphDateTo(e.target.value)}
                />
                <button
                  type="button"
                  className={`ml-1 inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs ${
                    tone === 'dark'
                      ? 'border-slate-600 text-slate-100 hover:bg-slate-800'
                      : 'border-[#224765]/20 text-[#224765] hover:bg-[#D3E2FD]/40'
                  }`}
                  onClick={resetGraphDates}
                  title="Reset to last 7 days"
                >
                  <RotateCcw className="h-3.5 w-3.5" /> Reset
                </button>
              </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                <TimeSeriesChart
                  title="Revenue"
                  className="h-full"
                  height={300}
                  data={{ rows }}
                  xKey="date"
                  series={[{ key: 'revenue', name: 'Revenue', kind: 'bar' }]}
                  yFormat={(n) => new Intl.NumberFormat(undefined, { style: 'currency', currency }).format(n)}
                  loading={loadingGraph}
                  error={errorGraph}
                />

               

                <TimeSeriesChart
                  title="Sales Count"
                  className="h-full"
                  height={300}
                  data={{ rows }}
                  xKey="date"
                  series={[{ key: 'count', name: 'Sales', kind: 'bar', color: "#224765" }]} 
                  yFormat={(n) => Number(n).toLocaleString()}
                  loading={loadingGraph}
                  error={errorGraph}
                  />
              </div>
            </div>
          </div>
        </CollapsibleSection>
      </div>
    </div>
  );
}
