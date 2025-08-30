import React, { useMemo, useState, useEffect } from 'react';
import { DollarSign, ShoppingCart, Package, CalendarDays, Receipt, TrendingUp, RotateCcw,} from 'lucide-react';
import { fmtMoney, Toolbar, KPICard, Section, DateRangeInline } from './Services';
import axios from 'axios';
import {TimeSeriesChart} from './Graph'
import { TopProductsByUnits } from './TopProductByUnit';
import { EmployeeSalesSummary } from './SummarizeEmployeeUI';
import { SalesSummary } from './AllSales';
import { RefundTable } from './RefundAdminTable';
/* --- utils --- */
const toCSV = (rows, headers) => {
  const head = headers.join(',');
  const body = rows.map(r => headers.map(h => JSON.stringify(r[h] ?? '')).join(',')).join('\n');
  return `${head}\n${body}`;
};


/* --- Component --- */
export function AdminDashboardPro({
  user,
  currency = 'USD',
  theme = 'light',
  enableDownloads = false,
}) {
  const today = new Date().toISOString().slice(0, 10);
  const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const tone = theme === 'dark' ? 'dark' : 'light';
  const [products, setProducts]= useState([]);
  const [timeframe, setTimeframe] = useState('7d');
  const [sales, setSales]= useState([])
  const [dateFrom, setDateFrom]= useState(today)
  const [dateTo, setDateTo]= useState(today)
  const [graphSales, setGraphSales]=useState([])
  const [graphDateFrom, setGraphDateFrom]= useState(oneWeekAgo)
  const [graphDateTo, setGraphDateTo]= useState(today)
  const [refund, setRefund]= useState([])

  const schema = user?.tenant?.schema_name;

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        const { data } = await axios.get('http://localhost:3001/route/all_products', {
          headers: { 'Tenant-Schema': schema},
          signal: controller.signal,
        });
        setProducts(data?.rows ?? []);
      } catch (err) {
        console.log(err.message);
      } finally {
        console.log(schema);
      }
    })();
    return () => controller.abort();
  }, []);


const inventorySaleValue = useMemo(() => {
  const sum = (products ?? []).reduce((acc, n) => {
    const price = Number(n?.sale_price) || 0;
    const qty   = Number(n?.quantity)   || 0;
    return acc + price * qty;
  }, 0);
  return Number(sum.toFixed(2)); // optional: round to 2dp
}, [products]);

const inventoryCost = useMemo(() => {
  return Number(((products ?? []).reduce((a, n) =>
    a + (Number(n?.cost_price) || 0) * (Number(n?.quantity) || 0)
  , 0)).toFixed(2));
}, [products]);

const fetchGraphSales = async () => {
  try {
    const { data } = await axios.get('http://localhost:3001/route/orders/date', {
      headers: { 'Tenant-Schema': schema },
      params: { graphDateFrom, graphDateTo},
    });
    const rows = Array.isArray(data?.rows) ? data.rows : Array.isArray(data) ? data : [];
    setGraphSales(rows);
  } catch (err) {
   console.log(err);
  } finally {
    console.log();;
  }
};

const fetchRefund = async () => {
  try {
    const { data } = await axios.get('http://localhost:3001/route/refund/get-refund', {
      headers: { 'Tenant-Schema': schema },
      params: { dateFrom, dateTo},
    });
    console.log(data);
    const rows = Array.isArray(data?.rows) ? data.rows : Array.isArray(data) ? data : [];
    setRefund(rows);
  } catch (err) {
   console.log(err);
  } finally {
    console.log();;
  }
};


const fetchSales = async () => {
  try {
    const { data } = await axios.get('http://localhost:3001/route/orders/date', {
      headers: { 'Tenant-Schema': schema },
      params: { dateFrom, dateTo},
    });
    const rows = Array.isArray(data?.rows) ? data.rows : Array.isArray(data) ? data : [];
    setSales(rows);
  } catch (err) {
   console.log(err);
  } finally {
    console.log();;
  }
};

useEffect(() => {fetchSales()}, [dateFrom, dateTo]);

useEffect(() => {fetchGraphSales()}, [graphDateFrom, graphDateTo])

useEffect(()=>{fetchRefund()}, [dateFrom, dateTo])

const revenueByTimeLine = useMemo(() =>Array.isArray(sales)
      ? sales.reduce((sum, n) => sum + (Number(n?.total_paid)-Number(n?.refunded_amount) || 0), 0)
      : 0,
  [sales]
);

const RefundAmount= useMemo(() =>
    Array.isArray(sales)
      ? sales.reduce((sum, n) => n.status=="Refunded" && sum + (n.refunded_amount), 0)
      : 0,
  [sales])

const profit= useMemo(
    () =>
      Array.isArray(sales)
        ? sales.reduce((sum, n) => sum + (n.profit), 0)
        : 0,
    [sales])

const rows = useMemo(() => {
  if (!Array.isArray(graphSales)) return [];
  const byDay = new Map();
  for (const o of graphSales) {
    // Bucket by day (UTC). If you want local TZ, see note below.
    const day = (o.added_date ?? o.updated_at ?? '').slice(0, 10);
    if (!day) continue;
    const prev = byDay.get(day) || { date: day, revenue: 0, profit: 0, refunds: 0, count: 0 };

    const revenue  = Number(o.total_paid) || 0;
    const profit   = Number(o.profit) || 0;
    const refunded = Number(o.refunded_amount) || 0; // positive amount refunded
    // Choose how you want refunds to affect metrics:
    prev.revenue += revenue - refunded; // net revenue after refunds
    prev.profit  += profit
    prev.refunds += refunded;
    prev.count   += 1;
    byDay.set(day, prev);
  }
  // Sort ascending by date
  return [...byDay.values()].sort((a, b) => a.date.localeCompare(b.date));
}, [graphSales])

  const handleExport = () => {
    const csv = toCSV(revenueSeries || [], ['date', 'revenue']); // export filtered range
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'revenue.csv'; a.click();
    URL.revokeObjectURL(url);
  };

  const productLowThreshold= products.filter((product)=>(product.quantity<=product.threshold))
  const Refund= useMemo(()=>sales.filter((prod)=>(prod.status=="Refunded")),[sales])

  return (
    <div className={`min-h-screen w-full bg-gradient-to-br ${tone==='dark' ? 'from-slate-900 via-slate-900 to-slate-900' : 'from-[#D3E2FD] via-white to-[#D3E2FD]'}`}>
      <div className="mx-auto max-w-7xl space-y-6 p-6">
        {/* Header & Controls */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className={`text-2xl font-bold tracking-tight ${tone==='dark' ? 'text-white' : 'text-[#224765]'}`}>Admin Dashboard</h1>
            <p className={`${tone==='dark' ? 'text-slate-300' : 'text-[#224765]/70'} text-sm`}>
              Quick view of your business health.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Global Range Filter (NEW – controls everything) */}
            <div className="flex items-center gap-2 text-sm">
      <CalendarDays className={`h-4 w-4 ${tone==='dark' ? 'text-slate-200' : 'text-[#224765]'}`} />
      <input
        type="date"
        className={`rounded-lg border px-2 py-1 ${tone==='dark' ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-[#224765]/20'}`}
        value={dateFrom}
        onChange={async(e) => {setDateFrom(e.target.value);}}
      />
      <span className={tone==='dark' ? 'text-slate-300' : 'text-[#224765]/60'}>to</span>
      <input
        type="date"
        className={`rounded-lg border px-2 py-1 ${tone==='dark' ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-[#224765]/20'}`}
        value={dateTo}
        onChange={async(e) =>{ setDateTo(e.target.value);}}
      />
      <button
        type="button"
        className={`ml-1 inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs ${
          tone==='dark' ? 'border-slate-600 text-slate-100 hover:bg-slate-800' : 'border-[#224765]/20 text-[#224765] hover:bg-[#D3E2FD]/40'
        }`}
        onClick={() => onChange?.({ from: '', to: '' })}
        title="Clear"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Reset
      </button>
    </div>
            <Toolbar
              tone={tone}
              timeframe={timeframe}
              setTimeframe={setTimeframe}
              enableDownloads={enableDownloads}
              onExportCSV={handleExport}
            />
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6">
          <KPICard tone={tone} icon={Package}    label="Sale Inventory Value" value={fmtMoney(inventorySaleValue, currency)} />
          <KPICard tone={tone} icon={Receipt}    label="Cost Inventory Value"            value={fmtMoney(inventoryCost, currency)} />
          <KPICard tone={tone} icon={ShoppingCart}  label="Orders"          value={sales.length} />
          <KPICard tone={tone} icon={DollarSign} label="Revenue"         value={fmtMoney(revenueByTimeLine, currency)} />
          <KPICard tone={tone} icon={RotateCcw}  label="Refunds"         value={fmtMoney(RefundAmount, currency)} />
          <KPICard tone={tone} icon={TrendingUp} label="Profit"          value={fmtMoney(profit, currency)} />
        </div>
        
  

        {/* Tables */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
         
    <TopProductsByUnits
  orders={sales}      // your fetched orders array
  from={dateFrom}    // optional
  to={dateTo}      // optional
  currency="USD"
  limit={10}
/>
<RefundTable refund={refund} currency="USD" tone="light" to={dateTo} from={dateFrom}/>
 </div>
        {/* Employees + Recommendations */}
   <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
     <EmployeeSalesSummary orders={sales} currency="USD" tone="light" to={dateTo} from={dateFrom} />
     <Section tone={tone} title="Low Stock" subtitle="At or below threshold">
<div className="mt-6 overflow-x-auto">
  <table className="w-full text-left text-sm">
    <thead>
      <tr className={`border-b ${tone==='dark'
        ? 'border-slate-700 bg-slate-800 text-slate-200'
        : 'border-[#224765]/10 bg-[#D3E2FD]/30 text-[#224765]'
      }`}>
        <th className="px-3 py-2 font-medium">#</th>
        <th className="px-3 py-2 font-medium">Product</th>
        <th className="px-3 py-2 font-medium">Qty</th>
        <th className="px-3 py-2 font-medium">Threshold</th>
        <th className="px-3 py-2 font-medium">Location</th>
      </tr>
    </thead>
    <tbody>
      {productLowThreshold?.length ? productLowThreshold.map((r, i) => (
        <tr key={r.id ?? i} className={`border-b ${tone==='dark'
          ? 'border-slate-700 hover:bg-slate-800/60'
          : 'border-[#224765]/10 hover:bg-[#D3E2FD]/10'
        }`}>
          <td className="px-3 py-2">{i + 1}</td>
          <td className="px-3 py-2">{r.product_name}</td>
          <td className="px-3 py-2">{r.quantity}</td>
          <td className="px-3 py-2">{r.threshold}</td>
          <td className="px-3 py-2">{r.location}</td>
        </tr>
      )) : (
        <tr>
          <td colSpan={5}
              className={`px-3 py-6 text-center ${tone==='dark' ? 'text-slate-400' : 'text-[#224765]/60'}`}>
            no data
          </td>
        </tr>
      )}
    </tbody>
  </table>
</div>
</Section> 


         
        </div>
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-1">

        <SalesSummary orders={sales} currency="USD" tone="light" to={dateTo} from={dateFrom}/>
     
        </div>
        <section className="w-full bg-gradient-to-br from-[#D3E2FD] via-white to-[#D3E2FD]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6">
        {/* Header (optional) */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-[#224765]">Performance</h2>
            <p className="text-sm text-[#224765]/70">Track revenue and profit over time.</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-sm">
      <CalendarDays className={`h-4 w-4 ${tone==='dark' ? 'text-slate-200' : 'text-[#224765]'}`} />
      <input
        type="date"
        className={`rounded-lg border px-2 py-1 ${tone==='dark' ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-[#224765]/20'}`}
        value={graphDateFrom}
        onChange={async(e) => {setGraphDateFrom(e.target.value);}}
      />
      <span className={tone==='dark' ? 'text-slate-300' : 'text-[#224765]/60'}>to</span>
      <input
        type="date"
        className={`rounded-lg border px-2 py-1 ${tone==='dark' ? 'border-slate-600 bg-slate-800 text-slate-100' : 'border-[#224765]/20'}`}
        value={graphDateTo}
        onChange={async(e) =>{ setGraphDateTo(e.target.value);}}
      />
      <button
        type="button"
        className={`ml-1 inline-flex items-center gap-1 rounded-lg border px-2 py-1 text-xs ${
          tone==='dark' ? 'border-slate-600 text-slate-100 hover:bg-slate-800' : 'border-[#224765]/20 text-[#224765] hover:bg-[#D3E2FD]/40'
        }`}
        onClick={() => onChange?.({ from: '', to: '' })}
        title="Clear"
      >
        <RotateCcw className="h-3.5 w-3.5" /> Reset
      </button>
    </div>

        {/* Charts grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <TimeSeriesChart
            title="Revenue"
            className="h-full"
            height={300}
            data={{ rows }}              // component will pick `rows`
            xKey="date"
            series={[
              { key: 'revenue', name: 'Revenue', kind: 'line' },
            ]}
            yFormat={(n) =>
              new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n)
            }
          />

          <TimeSeriesChart
            title="Profit"
            className="h-full"
            height={300}
            data={{ rows }}
            xKey="date"
            series={[
              { key: 'profit', name: 'Profit', kind: 'area' },
            ]}
            yFormat={(n) =>
              new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' }).format(n)
            }
          />
        </div>
      </div>
    </section>
      </div>
    </div>
  );
}
