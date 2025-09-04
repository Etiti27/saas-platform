import React from 'react'
import { deleteProduct } from '../Services/delete';
import { updateQty } from '../Services/UpdateQty';

function Table({BRAND,products, setDiscountType, setDiscountValue, discountAmount, subtotal, discountType, discountValue, grandTotal, setProducts}) {
  return (
    <div className="overflow-x-auto rounded-xl border"
    style={{ borderColor: `${BRAND.primary}26` }}>
 <table className="min-w-full text-sm text-left">
   <thead className="text-[#224765]"
          style={{ background: BRAND.tint }}>
     <tr>
       <th className="p-2 border" style={{ borderColor: `${BRAND.primary}1A` }}>#</th>
       <th className="p-2 border" style={{ borderColor: `${BRAND.primary}1A` }}>Product</th>
       <th className="p-2 border" style={{ borderColor: `${BRAND.primary}1A` }}>Qty</th>
       <th className="p-2 border" style={{ borderColor: `${BRAND.primary}1A` }}>Amount</th>
       <th className="p-2 border" style={{ borderColor: `${BRAND.primary}1A` }}>Actions</th>
     </tr>
   </thead>
   <tbody>
     {products.map((p, i) => (
       <tr key={`${p.id ?? p.name}-${i}`} className="hover:bg-opacity-30"
           style={{ background: `${BRAND.tint}40` }}>
         <td className="p-2">{i + 1}</td>
         <td className="p-2">{p.product_name || p.name}</td>
         <td className="p-2">
           <input
             type="number"
             min="1"
             className="rounded-lg p-1 w-20 text-right focus:outline-none focus:ring-2"
             style={{ border: `1px solid ${BRAND.primary}33` }}
             value={p.quantity}
             onChange={(e) => updateQty({index:i, val:e.target.value, setProducts:setProducts})}
           />
         </td>
         <td className="p-2 ">${p.amount}</td>
         <td className="p-2 text-center">
           <button
             onClick={() => deleteProduct({index:i, setProducts:setProducts})}
             className="hover:underline"
             style={{ color: '#dc2626' }}
           >
             Delete
           </button>
         </td>
       </tr>
     ))}
     {products.length === 0 && (
       <tr>
         <td colSpan="5" className="text-center py-4"
             style={{ color: `${BRAND.primary}B3` }}>
           No products added.
         </td>
       </tr>
     )}
   </tbody>

   {/* Totals + Discount */}
   {products.length > 0 && (
     <tfoot>
       <tr style={{ background: `${BRAND.tint}80` }}>
         <td colSpan="3" className="p-2 border text-right font-medium"
             style={{ color: BRAND.primary, borderColor: `${BRAND.primary}1A` }}>
           Subtotal
         </td>
         <td colSpan="2" className="p-2 border" style={{ borderColor: `${BRAND.primary}1A` }}>
           ${subtotal.toFixed(2)}
         </td>
       </tr>
       <tr style={{ background: `${BRAND.tint}66` }}>
         <td colSpan="3" className="p-2 border text-right font-medium"
             style={{ color: BRAND.primary, borderColor: `${BRAND.primary}1A` }}>
           Discount
         </td>
         <td colSpan="2" className="p-2 border" style={{ borderColor: `${BRAND.primary}1A` }}>
           <div className="flex items-center justify-end gap-2">
             <select
               className="rounded-lg p-1 focus:outline-none focus:ring-2"
               style={{ border: `1px solid ${BRAND.primary}33` }}
               value={discountType}
               onChange={(e) => setDiscountType(e.target.value)}
               aria-label="Discount type"
             >
               <option value="amount">Amount ($)</option>
               <option value="percent">Percent (%)</option>
             </select>
             <input
               type="number"
               min="0"
               max={discountType === 'percent' ? 100 : undefined}
               step="0.01"
               className="rounded-lg p-1 w-28 text-right focus:outline-none focus:ring-2"
               style={{ border: `1px solid ${BRAND.primary}33` }}
               value={discountValue}
               onChange={(e) => setDiscountValue(e.target.value)}
               placeholder={discountType === 'percent' ? 'e.g. 10' : 'e.g. 25.00'}
             />
             <span className="text-sm" style={{ color: `${BRAND.primary}B3` }}>
               (= ${discountAmount.toFixed(2)})
             </span>
           </div>
         </td>
       </tr>
       <tr style={{ background: BRAND.tint, color: BRAND.primary }}>
         <td colSpan="3" className="p-2 border text-right"
             style={{ borderColor: `${BRAND.primary}1A` }}>
           Grand Total
         </td>
         <td colSpan="2" className="p-2 border" style={{ borderColor: `${BRAND.primary}1A` }}>
           ${grandTotal.toFixed(2)}
         </td>
       </tr>
     </tfoot>
   )}
 </table>
</div>
  )
}

export {Table}