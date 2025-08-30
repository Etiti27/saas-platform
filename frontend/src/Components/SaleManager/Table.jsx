import React, {useState} from 'react';
import {
  AlertTriangle,
  Package,
  Search,
  TrendingDown,
  DollarSign,
  CalendarClock,
  MapPin,
  Trash2,
  PackagePlus
} from 'lucide-react';
import { UpdateStockModal } from './UpdateStock';


const daysUntil = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  const ms = d.setHours(0, 0, 0, 0) - new Date().setHours(0, 0, 0, 0);
  return Math.round(ms / 86400000);
};

export function Table({ filtered, Chip, fmtMoney, requestDelete, schema }) {
  const [editing, setEditing] = useState(null);
  return (
    <div>
      <div className="rounded-2xl border border-[#224765]/10 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-[#224765]">Product List</h2>
          <Chip tone="blue">{filtered.length} shown</Chip>
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[#224765]/20 p-8 text-center text-[#224765]/70">
            No products added.
          </div>
        ) : (
          <>
            {/* Desktop table (kept responsive with horizontal scroll) */}
            <div className="overflow-x-auto rounded-lg border border-[#224765]/10 -mx-2 md:mx-0">
              <table className="min-w-[900px] md:min-w-full text-xs md:text-sm">
                <thead className="bg-[#D3E2FD] text-[#224765]">
                  <tr className="[&>th]:border [&>th]:border-[#224765]/15">
                    {/* <th className="p-1 md:p-2 text-center whitespace-nowrap">Id</th> */}
                    <th className="p-1 md:p-2 text-center whitespace-nowrap">Name</th>
                    <th className="p-1 md:p-2 text-center whitespace-nowrap">Qty</th>
                    <th className="p-1 md:p-2 text-center whitespace-nowrap">Cost</th>
                    <th className="p-1 md:p-2 text-center whitespace-nowrap">Price</th>
                    <th className="p-1 md:p-2 text-center whitespace-nowrap">Expire</th>
                    <th className="p-1 md:p-2 text-center whitespace-nowrap">Threshold</th>
                    <th className="p-1 md:p-2 text-center whitespace-nowrap">Location</th>
                    <th className="p-1 md:p-2 text-center whitespace-nowrap">Status</th>
                    <th className="p-1 md:p-2 text-center whitespace-nowrap">Action</th>
                  </tr>
                </thead>
                <tbody className="[&>tr>td]:border [&>tr>td]:border-[#224765]/10">
                  {filtered.map((p) => {
                    const d = daysUntil(p.expiring_date);
                    const expTone =
                      d === null ? 'gray' : d < 0 ? 'red' : d <= 30 ? 'amber' : 'green';
                    const low = p.quantity <= p.threshold;

                    return (
                      <tr
                        key={p.id}
                        className={`border-t ${
                          low ? 'bg-red-50' : 'bg-white'
                        } hover:bg-[#D3E2FD]/30`}
                      >
                        {/* <td className="p-1 md:p-2 text-center whitespace-nowrap">{p.id}</td> */}
                        <td className="p-1 md:p-2 text-center whitespace-nowrap text-[#224765]">
                          {p.product_name}
                        </td>
                        <td className="p-1 md:p-2 text-center whitespace-nowrap">{p.quantity}</td>
                        <td className="p-1 md:p-2 text-center whitespace-nowrap">{fmtMoney(p.cost_price)}</td>
                        <td className="p-1 md:p-2 text-center whitespace-nowrap">{fmtMoney(p.sale_price)}</td>
                        <td className="p-1 md:p-2 text-center whitespace-nowrap">
                          {p.expiring_date ? (
                            <div className="flex items-center justify-center gap-2">
                              <CalendarClock className="h-4 w-4 text-[#224765]/60" />
                              <Chip tone={expTone}>
                                {d === null ? '—' : d < 0 ? `${Math.abs(d)}d overdue` : `${d}d`}
                              </Chip>
                            </div>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="p-1 md:p-2 text-center whitespace-nowrap">{p.threshold}</td>
                        <td className="p-1 md:p-2 text-center whitespace-nowrap">
                          <div className="flex justify-center items-center gap-2">
                            <MapPin className="h-4 w-4 text-[#224765]/60" />
                            <span className="whitespace-nowrap">{p.location}</span>
                          </div>
                        </td>
                        <td className="p-1 md:p-2 text-center whitespace-nowrap">
                          {low ? (
                            <div className="flex justify-center items-center gap-2 text-red-700">
                              <AlertTriangle className="h-4 w-4" />
                              <Chip tone="red">Low stock</Chip>
                            </div>
                          ) : (
                            <Chip tone="green">OK</Chip>
                          )}
                        </td>
                        <td className="p-1 md:p-2 text-center whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => requestDelete(p.id, p.product_name)}
                            className="inline-flex items-center gap-1 rounded-lg border border-red-200 px-3 py-1 text-xs text-red-700 shadow-sm hover:bg-red-50"
                            aria-label={`Delete ${p.product_name}`}
                            title={`Delete ${p.product_name}`}
                          >
                            <Trash2 className="h-4 w-4" />
                            Delete
                          </button>
                          <button
                            onClick={() =>setEditing(p)}
                            className="inline-flex items-center gap-1 rounded-lg border border-green-200 px-3 py-1 text-xs text-green-700 shadow-sm hover:bg-green-50"
                            aria-label={`update ${p.product_name}`}
                            title={`Update ${p.product_name}`}
                          >
                             <PackagePlus className="h-4 w-4" />
                            Update
                          </button>
                          </div>
                        </td>
                      </tr>
                      
                    );
                  })}
                </tbody>
              </table>
{console.log(editing)}
            </div>
          </>
        )}
        <UpdateStockModal
        product={editing}
        schema={schema}
        onClose={() => setEditing(null)}
        onSaved={(updated) => {
          window.location.reload()
          // Option A: refresh a single row in-place
          // refreshRow?.(updated);
          // Option B: re-fetch page
          // refetch();
        }}
      />
      </div>
    </div>
  );
}
