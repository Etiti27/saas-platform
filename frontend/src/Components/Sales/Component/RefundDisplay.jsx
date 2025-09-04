import React from 'react'
import { Card } from './Refundcomponent'

export const RefundDisplay = ({selectedOrder, form, orderTotal, fmt, currency}) => {
  return (
    <aside className="lg:col-span-4 space-y-6">
    <Card title="Summary" className="sticky top-6">
      <div className="grid grid-cols-1 gap-3">
        <div className="rounded-xl border border-[#224765]/10 bg-[#D3E2FD]/30 p-3">
          <div className="text-xs text-[#224765]/70">Order</div>
          <div className="text-sm font-semibold text-[#224765]">
            {selectedOrder?.orderNumber || selectedOrder?.id || '—'}
          </div>
          <div className="text-xs text-[#224765]/60">
            Date:{' '}
            {selectedOrder?.added_date
              ? new Date(selectedOrder.added_date).toISOString().slice(0,10)
              : '—'}
          </div>
        </div>

        <div className="rounded-xl border border-[#224765]/10 bg-[#D3E2FD]/30 p-3">
          <div className="text-xs text-[#224765]/70">Order Total</div>
          <div className="text-sm font-semibold text-[#224765]">
            {selectedOrder ? fmt(orderTotal(selectedOrder), currency) : '—'}
          </div>
        </div>

        <div className="rounded-xl border border-[#224765]/10 bg-[#D3E2FD]/30 p-3">
          <div className="text-xs text-[#224765]/70">Refund</div>
          <div className="text-sm font-semibold text-[#224765]">
            {selectedOrder ? fmt(orderTotal(selectedOrder), currency) : '—'}
          </div>
        </div>

        <div className="rounded-xl border border-[#224765]/10 bg-white p-3">
          <div className="text-xs text-[#224765]/70">Method</div>
          <div className="text-sm font-semibold text-[#224765]">{form.method}</div>
        </div>

        <div className="rounded-xl border border-[#224765]/10 bg-white p-3">
          <div className="text-xs text-[#224765]/70">Reason</div>
          <div className="text-sm font-semibold text-[#224765]">
            {form.reason === 'Other' ? (form.other_reason || '—') : form.reason}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-[#224765]/10 bg-white p-3 text-xs text-[#224765]/80">
        Tip: attach evidence for larger refunds per policy.
      </div>
    </Card>
  </aside>
  )
}
