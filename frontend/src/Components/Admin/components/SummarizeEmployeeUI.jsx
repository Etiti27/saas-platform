import { summarizeByEmployee } from "./SummarizeEmployee";
const fmtMoney = (n, c='USD') =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: c }).format(Number(n)||0);

export function EmployeeSalesSummary({ orders = [], currency = 'USD', tone = 'light',from, to }) {
  const rows = summarizeByEmployee(orders);

  return (
    <section className={`rounded-2xl border ${tone==='dark' ? 'border-slate-700 bg-slate-800' : 'border-[#224765]/10 bg-white'} p-5 shadow-sm`}>
      <div className="mb-3">
        <h3 className={`text-base font-semibold ${tone==='dark' ? 'text-slate-100' : 'text-[#224765]'}`}>
          Sales by Employee
        </h3>
        <p className={`${tone==='dark' ? 'text-slate-300' : 'text-[#224765]/70'} text-xs`}>
          Totals aggregated from orders from {from} to {to}.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className={`${tone==='dark' ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-[#224765]/10 bg-[#D3E2FD]/30 text-[#224765]'} border-b`}>
              <th className="px-3 py-2 font-medium">#</th>
              <th className="px-3 py-2 font-medium">Employee</th>
              <th className="px-3 py-2 font-medium text-right">Orders</th>
              <th className="px-3 py-2 font-medium text-right">Revenue</th>
              <th className="px-3 py-2 font-medium text-right">Refunded</th>
              {/* <th className="px-3 py-2 font-medium text-right">Net Revenue</th> */}
              <th className="px-3 py-2 font-medium text-right">Profit</th>
            </tr>
          </thead>
          <tbody>
            {rows.length ? rows.map((r, i) => (
              <tr key={r.employee_id ?? `unassigned-${i}`} className={`${tone==='dark' ? 'border-slate-700 hover:bg-slate-800/60' : 'border-[#224765]/10 hover:bg-[#D3E2FD]/10'} border-b`}>
                <td className="px-3 py-2">{i + 1}</td>
                <td className="px-3 py-2">
                  <div className={`${tone==='dark' ? 'text-slate-100' : 'text-[#224765]'} font-medium`}>{r.name}</div>
                  {r.email ? <div className={`${tone==='dark' ? 'text-slate-400' : 'text-[#224765]/60'} text-xs`}>{r.email}</div> : null}
                </td>
                <td className="px-3 py-2 text-right">{r.orders}</td>
                <td className="px-3 py-2 text-right">{fmtMoney(r.revenue, currency)}</td>
                <td className="px-3 py-2 text-right">{fmtMoney(r.refunded, currency)}</td>
                {/* <td className="px-3 py-2 text-right font-semibold">{fmtMoney(r.netRevenue, currency)}</td> */}
                <td className="px-3 py-2 text-right">{fmtMoney(r.profit, currency)}</td>
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
