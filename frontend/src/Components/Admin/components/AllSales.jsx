
const fmtMoney = (n, c='USD') =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: c }).format(Number(n)||0);

export function SalesSummary({ orders = [], currency = 'USD', tone = 'light',from, to }) {
  

  return (
    <section className={`rounded-2xl border ${tone==='dark' ? 'border-slate-700 bg-slate-800' : 'border-[#224765]/10 bg-white'} p-5 shadow-sm`}>
      <div className="mb-3">
        <h3 className={`text-base font-semibold ${tone==='dark' ? 'text-slate-100' : 'text-[#224765]'}`}>
        Sales Records
        </h3>
        <p className={`${tone==='dark' ? 'text-slate-300' : 'text-[#224765]/70'} text-xs`}>
          All Sale Records from {from} to {to}.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className={`${tone==='dark' ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-[#224765]/10 bg-[#D3E2FD]/30 text-[#224765]'} border-b`}>
              {/* <th className="px-3 py-2 font-medium text-right">#</th> */}
              <th className="px-3 py-2 font-medium text-left">Order Id</th>
              <th className="px-3 py-2 font-medium text-left">Product Sold</th>
              <th className="px-3 py-2 font-medium text-left">Sold By</th>
              <th className="px-3 py-2 font-medium text-left">Total paid</th>
              <th className="px-3 py-2 font-medium text-left">Status</th>
              {/* <th className="px-3 py-2 font-medium text-right">Net Revenue</th> */}
              {/* <th className="px-3 py-2 font-medium text-right">Profit</th> */}
            </tr>
          </thead>
          <tbody>
          {orders.length ? orders.map((r) => (
  <tr
    key={r.id ?? r.orderNumber}
    className={`${tone==='dark' ? 'border-slate-700 hover:bg-slate-800/60' : 'border-[#224765]/10 hover:bg-[#D3E2FD]/10'} border-b`}
  >
    {/* <td className="px-3 py-2">row # could be computed elsewhere if needed</td> */}

    <td className="px-3 py-2 font-medium text-leftt">{r.orderNumber}</td>

    <td className="px-3 py-2 font-medium text-left">
      {r.items?.map((info, j) => (
        <div key={info.id ?? info.sku ?? `${r.orderNumber}-item-${j}`}>
          {info.name} x{info.quantity}
        </div>
      ))}
    </td>

    <td className="px-3 py-2 font-medium text-left">
      {r.employeeee?.first_name && r.employeeee.first_name !== 'null'
        ? r.employeeee.first_name
        : 'Admin'}
    </td>

    <td className="px-3 py-2 font-medium text-left">{fmtMoney(r.total_paid, currency)}</td>
    <td className="px-3 py-2 font-medium text-left">{r.status}</td>
  </tr>
)) : (
  <tr>
    <td colSpan={7} className={`${tone==='dark' ? 'text-slate-400' : 'text-[#224765]/60'} px-3 py-6 text-center`}>
      No orders found.
    </td>
  </tr>
)}

          </tbody>
        </table>
      </div>
    </section>
  );
}
