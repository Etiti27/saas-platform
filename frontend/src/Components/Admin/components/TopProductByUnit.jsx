// TopProductsByUnitsTable.jsx
import React from 'react';
import { useTopProductsByUnits } from './TopProductByUnits.js';

const fmtMoney = (n, c='USD') =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency: c }).format(Number(n)||0);

export function TopProductsByUnits({ orders, from, to, currency='USD', limit=10 }) {
  const top = useTopProductsByUnits(orders, { from, to, limit, apportionDiscount: true });

  return (
    <section className="rounded-2xl border border-[#224765]/10 bg-white p-5 shadow-sm">
      <div className="mb-3">
        <h3 className="text-base font-semibold text-[#224765]">
          Top {limit} Products (by Units){from || to ? ` — ${from || '…'} to ${to || '…'}` : ''}
        </h3>
        <p className="text-xs text-[#224765]/70">
          Ranked by total quantity sold; revenue shown after discount apportioning.
        </p>
      </div>

      {top.length === 0 ? (
        <div className="py-4 text-sm text-[#224765]/60">No data in this range.</div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-[#224765]/10">
          <table className="min-w-full text-sm">
            <thead className="bg-[#D3E2FD] text-[#224765]">
              <tr>
                <th className="px-3 py-2 text-left w-14">#</th>
                <th className="px-3 py-2 text-left">Product</th>
                <th className="px-3 py-2 text-right">Units</th>
                <th className="px-3 py-2 text-right">Revenue</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#224765]/10">
              {top.map((p) => (
                <React.Fragment key={`${p.rank}-${p.name}`}>
                  {/* Desktop / tablet row (columns) */}
                  <tr className="hidden sm:table-row hover:bg-[#D3E2FD]/30">
                    <td className="px-3 py-2">
                      <span className="inline-grid h-6 w-6 place-content-center rounded-md bg-[#D3E2FD] text-[#224765] text-xs font-semibold">
                        {p.rank}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-[#224765]">{p.name}</td>
                    <td className="px-3 py-2 text-right text-[#224765]">{p.units}</td>
                    <td className="px-3 py-2 text-right text-[#224765]">{fmtMoney(p.revenue, currency)}</td>
                  </tr>

                  {/* Mobile-friendly stacked row (units & revenue on separate lines) */}
                  <tr className="sm:hidden">
                    <td className="px-3 py-3" colSpan={4}>
                      <div className="flex items-center gap-2">
                        <span className="inline-grid h-6 w-6 place-content-center rounded-md bg-[#D3E2FD] text-[#224765] text-xs font-semibold">
                          {p.rank}
                        </span>
                        <div className="text-[#224765] font-medium truncate">{p.name}</div>
                      </div>
                      <div className="mt-2 rounded-lg border border-[#224765]/10 bg-[#D3E2FD]/20 p-2 text-xs text-[#224765]">
                        <div className="flex justify-between">
                          <span className="opacity-70">Units</span>
                          <span className="font-semibold">{p.units}</span>
                        </div>
                        <div className="mt-1 flex justify-between">
                          <span className="opacity-70">Revenue</span>
                          <span className="font-semibold">{fmtMoney(p.revenue, currency)}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
