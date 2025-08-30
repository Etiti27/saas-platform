
const fmtMoney = (n, c='USD') =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: c }).format(Number(n)||0);

export function RefundTable({ refund = [], currency = 'USD', tone = 'light',from, to }) {

  return (
    <section className={`rounded-2xl border ${tone==='dark' ? 'border-slate-700 bg-slate-800' : 'border-[#224765]/10 bg-white'} p-5 shadow-sm`}>
      <div className="mb-3">
        <h3 className={`text-base font-semibold ${tone==='dark' ? 'text-slate-100' : 'text-[#224765]'}`}>
          Refunds
        </h3>
        <p className={`${tone==='dark' ? 'text-slate-300' : 'text-[#224765]/70'} text-xs`}>
          Refund History.
        </p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className={`${tone==='dark' ? 'border-slate-700 bg-slate-800 text-slate-200' : 'border-[#224765]/10 bg-[#D3E2FD]/30 text-[#224765]'} border-b`}>
              {/* <th className="px-3 py-2 font-medium">#</th> */}
              <th className="px-3 py-2 font-medium">Refund ID</th>
              <th className="px-3 py-2 font-medium text-right">Order ID</th>
              <th className="px-3 py-2 font-medium text-right">Reason</th>
              <th className="px-3 py-2 font-medium text-right">Approved by</th>
              <th className="px-3 py-2 font-medium text-right">Amount</th>
              <th className="px-3 py-2 font-medium text-right">Method</th>
            </tr>
          </thead>
          <tbody>
            {refund.length !==0 ? refund.map((r, i) => (
              <tr key={r.id ?? `unassigned-${i}`} className={`${tone==='dark' ? 'border-slate-700 hover:bg-slate-800/60' : 'border-[#224765]/10 hover:bg-[#D3E2FD]/10'} border-b`}>
                {/* <td className="px-3 py-2 text-right">{i + 1}</td> */}
                <td className="px-3 py-2 text-right">{r.refund_id}</td>
                <td className="px-3 py-2 text-right">{r.order.orderNumber}</td>
                <td className="px-3 py-2 text-right">{r.Reason}</td>
                <td className="px-3 py-2 text-right">{r.employee.last_name}</td>
                {/* <td className="px-3 py-2 text-right font-semibold">{fmtMoney(r.netRevenue, currency)}</td> */}
                <td className="px-3 py-2 text-right">{fmtMoney(r.order.total_paid)}</td>
                <td className="px-3 py-2 text-right">{r.Payment_method}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan={7} className={`${tone==='dark' ? 'text-slate-400' : 'text-[#224765]/60'} px-3 py-6 text-center`}>
                  No refunds found for this specify date
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
