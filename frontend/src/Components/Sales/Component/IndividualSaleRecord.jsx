import React from 'react'

function IndividualSaleRecord({BRAND,setDateFrom, setDateTo, fetchSales,salesLoading, salesError, sales, dateFrom, dateTo, orderTotals}) {
  return (
    // <aside className="lg:col-span-1">
    <div className="bg-white p-6 rounded-2xl shadow-xl ring-1"
         style={{ ringColor: `${BRAND.primary}1A` }}>
      <div className="mb-4 flex flex-col gap-3">
        <h3 className="text-xl font-semibold" style={{ color: BRAND.primary }}>Sales</h3>

        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            <label className="text-sm" style={{ color: `${BRAND.primary}CC` }}>From</label>
            <input
              type="date"
              className="rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2"
              style={{ border: `1px solid ${BRAND.primary}33` }}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <label className="text-sm" style={{ color: `${BRAND.primary}CC` }}>To</label>
            <input
              type="date"
              className="rounded-lg px-3 py-2 text-sm w-full focus:outline-none focus:ring-2"
              style={{ border: `1px solid ${BRAND.primary}33` }}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <button
            onClick={fetchSales}
            className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-white shadow"
            style={{ background: BRAND.primary }}
            disabled={salesLoading}
          >
            {salesLoading ? 'Searching…' : 'Search'}
          </button>
        </div>
      </div>

      {/* Sales error */}
      {salesError && (
        <AlertBanner
          title="Couldn't load sales"
          message={salesError.message}
          status={salesError.status}
          details={salesError.details}
          onClose={() => setSalesError(null)}
        />
      )}

      {/* Results */}
      {salesLoading ? (
        <div style={{ color: `${BRAND.primary}B3` }}>Loading sales…</div>
      ) : salesError ? (
        <div className="flex items-center justify-between rounded-xl border border-dashed p-4"
             style={{ borderColor: `${BRAND.primary}33`, background: `${BRAND.tint}40`, color: `${BRAND.primary}` }}>
          <span>Failed to load sales.</span>
          <button
            onClick={fetchSales}
            className="rounded-md px-3 py-1 text-xs"
            style={{ background: BRAND.primary, color: '#fff' }}
          >
            Retry
          </button>
        </div>
      ) : sales.length === 0 ? (
        <div className="rounded-xl border border-dashed p-6 text-center"
             style={{ borderColor: `${BRAND.primary}33`, background: `${BRAND.tint}33`, color: `${BRAND.primary}B3` }}>
          No sales for the selected date.
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden"
             style={{ borderColor: `${BRAND.primary}26` }}>
          <table className="w-full text-xs">
            <thead style={{ background: BRAND.tint, color: BRAND.primary }}>
              <tr>
                <th className="p-2 border text-left" style={{ borderColor: `${BRAND.primary}1A` }}>Order #</th>
                <th className="p-2 border text-left" style={{ borderColor: `${BRAND.primary}1A` }}>Date</th>
                <th className="p-1 border text-left" style={{ borderColor: `${BRAND.primary}1A` }}>Discount</th>
                <th className="p-2 border text-left" style={{ borderColor: `${BRAND.primary}1A` }}>Total</th>
                <th className="p-2 border text-left" style={{ borderColor: `${BRAND.primary}1A` }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {sales.map((o) => {
                const { total, disc } = orderTotals(o);
                const paid = Number(o.total_paid ?? total);
                const discountShown = Number(o.discount_amount ?? o.total_discount ?? disc);
                return (
                  <tr key={o.id} className="hover:bg-opacity-30" style={{ background: `${BRAND.tint}40` }}>
                    <td className="p-2 text-left">{o.orderNumber || o.order_number || o.id}</td>
                    <td className="p-1 text-left">
                      {new Date(o.added_date).toISOString().slice(0, 10)}
                    </td>
                    <td className="p-2 text-left">
                      ${discountShown.toFixed(2)}
                    </td>
                    <td className="p-2 text-left">
                      ${paid.toFixed(2)}
                    </td>
                    <td className="p-2 text-left">{o.status}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
//   </aside>
  )
}

export  {IndividualSaleRecord}