import { jsPDF } from 'jspdf';
import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';



export const ViewInvoice = ({products, calculateTotal,setShowPreview,user,invoiceNumber,discountType = 'amount',discountValue = ''}) => {
  const invoiceRef = useRef(null);
  const logo='../../../public/ecs-logo.jpeg'
  const generatePDF = async () => {
    const el = invoiceRef.current;
    if (!el) return;
    try {
      const rect = el.getBoundingClientRect();
      const elW = Math.ceil(rect.width);
      const elH = Math.ceil(rect.height);

      const orientation = elW > elH ? 'landscape' : 'portrait';
      const doc = new jsPDF({ unit: 'px', format: 'a4', orientation });

      const pageW = doc.internal.pageSize.getWidth();
      const pageH = doc.internal.pageSize.getHeight();
      const margin = 24;

      const fitScale = Math.min(
        (pageW - margin * 2) / elW,
        (pageH - margin * 2) / elH,
        1
      );

      const pixelScale = Math.max(2, (window.devicePixelRatio || 1)) * fitScale;
      const canvas = await html2canvas(el, {
        scale: pixelScale,
        backgroundColor: '#ffffff',
        useCORS: true,
        scrollX: 0,
        scrollY: -window.scrollY,
      });

      const imgData = canvas.toDataURL('image/png');
      const imgW = Math.floor(elW * fitScale);
      const imgH = Math.floor(elH * fitScale);

      const x = Math.floor((pageW - imgW) / 2);
      const y = Math.floor((pageH - imgH) / 2);

      doc.addImage(imgData, 'PNG', x, y, imgW, imgH);

      const filename =
        (typeof invoiceNumber !== 'undefined' && String(invoiceNumber)) ||
        `${(user?.name || 'invoice').toString().replace(/\s+/g, '_')}_${new Date()
          .toISOString()
          .slice(0, 10)}.pdf`;
      doc.save(filename);
    } catch (e) {
      console.error('PDF generation failed:', e);
    }
  };

  const printInvoice = () => window.print();

  // ---- Totals with discount (read-only) ----
  const subtotal = Number(calculateTotal({products:products})) || 0;
  const raw = Number(discountValue) || 0;
  const percent = discountType === 'percent' ? Math.min(Math.max(raw, 0), 100) : null;
  const discountAmount =
    discountType === 'percent'
      ? (subtotal * (percent ?? 0)) / 100
      : Math.min(Math.max(raw, 0), subtotal);
  const grandTotal = Math.max(subtotal - discountAmount, 0);

  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-2xl p-6 rounded shadow-lg relative">
        {/* === Captured content for PDF === */}
        <div ref={invoiceRef}>
          <h1 className="mb-6 flex items-center justify-center gap-3 text-2xl font-bold leading-tight">
            <div className="h-10 w-10 rounded-full overflow-hidden bg-white ring-1 ring-gray-200 shadow-sm">
              <img
                src={user?.tenant?.logo}
                alt="our company logo"
                className="h-full w-full object-contain"
                loading="lazy"
                crossOrigin="anonymous"
              />
            </div>
            <span>{user.name}</span>
          </h1>

          <h3 className="text-xl font-bold mb-2 text-center">Invoice Summary</h3>
          <h5 className="text-sm font-medium mb-4 text-center">
            Invoice Number: {invoiceNumber}
          </h5>

          <table className="w-full text-sm text-left border mb-4">
            <thead className="bg-gray-100">
              <tr>
                <th className="p-2 border">#</th>
                <th className="p-2 border">Product</th>
                <th className="p-2 border">Qty</th>
                <th className="p-2 border">Amount</th>
                <th className="p-2 border">Total</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={i}>
                  <td className="p-2 border">{i + 1}</td>
                  <td className="p-2 border">{p.name}</td>
                  <td className="p-2 border">{p.quantity}</td>
                  <td className="p-2 border">${(Number(p.amount) || 0).toFixed(2)}</td>
                  <td className="p-2 border">
                    ${(((Number(p.quantity) || 0) * (Number(p.amount) || 0))).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-medium">
                <td colSpan="4" className="p-2 border text-right">Subtotal</td>
                <td className="p-2 border">${subtotal.toFixed(2)}</td>
              </tr>
              <tr className="font-medium">
                <td colSpan="4" className="p-2 border text-right">
                  Discount{discountType === 'percent' ? ` (${percent}%)` : ''}
                </td>
                <td className="p-2 border">- ${discountAmount.toFixed(2)}</td>
              </tr>
              <tr className="font-bold">
                <td colSpan="4" className="p-2 border text-right">Grand Total</td>
                <td className="p-2 border">${grandTotal.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
    

        {/* Buttons (ignored in PDF) */}
       <div className="flex justify-between" data-html2canvas-ignore="true">
          <button
            
            onClick={generatePDF}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            Download PDF
          </button>
          <button
            
            onClick={printInvoice}
            className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
          >
            Print Invoice
          </button>
        </div>
     

        <button
          onClick={() => {setShowPreview(false); window.location.reload()}}
          className="absolute top-2 right-2 text-gray-500 hover:text-red-500"
          data-html2canvas-ignore="true"
        >
          ✕
        </button>
      </div>
    </div>
  );
};
