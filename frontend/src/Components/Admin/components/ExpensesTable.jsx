import React from 'react'

function ExpenseTable({tone,expenses,loadingProducts}) {
  return (
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
          <th className="px-3 py-2 font-medium">Expenses ID</th>
          <th className="px-3 py-2 font-medium">Category</th>
          {/* <th className="px-3 py-2 font-medium">Cost Center</th> */}
          <th className="px-3 py-2 font-medium">Description</th>
          {/* <th className="px-3 py-2 font-medium">Notes</th> */}
          <th className="px-3 py-2 font-medium">Methods</th>
          <th className="px-3 py-2 font-medium">Vendor's name</th>
          <th className="px-3 py-2 font-medium">Task Rate</th>
          <th className="px-3 py-2 font-medium">Task Mode</th>
          <th className="px-3 py-2 font-medium">Total Tax</th>
          <th className="px-3 py-2 font-medium">Total Net</th>
          <th className="px-3 py-2 font-medium">Total Gross</th>
          {/* <th className="px-3 py-2 font-medium">Reference</th> */}
          <th className="px-3 py-2 font-medium">Date</th>
        </tr>
      </thead>
      <tbody>
        {expenses?.length ? (
          expenses.map((r, i) => (
            <tr
              key={r.id ?? `${r.product_name}-${i}`}
              className={`border-b ${
                tone === 'dark'
                  ? 'border-slate-700 hover:bg-slate-800/60'
                  : 'border-[#224765]/10 hover:bg-[#D3E2FD]/10'
              }`}
            >
              <td className="px-3 py-2">{i + 1}</td>
              <td className="px-3 py-2">{r.id.slice(0,8)}</td>
              <td className="px-3 py-2">{r.category}</td>
              {/* <td className="px-3 py-2">{r.cost_center}</td> */}
              <td className="px-3 py-2">{r.description}</td>
              {/* <td className="px-3 py-2">{r.notes}</td> */}
              <td className="px-3 py-2">{r.method}</td>
              <td className="px-3 py-2">{r.vendor_name}</td>
              <td className="px-3 py-2">{r.tax_rate}</td>
              <td className="px-3 py-2">{r.tax_mode}</td>
              <td className="px-3 py-2">{r.total_tax}</td>
              <td className="px-3 py-2">{r.total_net}</td>
              <td className="px-3 py-2">{r.total_gross}</td>
              {/* <td className="px-3 py-2">{r.reference}</td> */}
              <td className="px-3 py-2">{r.date}</td>

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
              {loadingProducts ? 'Loading…' : 'No expenses for this time range'}
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
  )
}

export {ExpenseTable}







