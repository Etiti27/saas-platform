

const asItemsArray = items => {
    if (Array.isArray(items)) return items;
    if (typeof items === 'string') {
      try { return JSON.parse(items || '[]'); } catch { return []; }
    }
    return [];
  };

const toNum = (v) => {
    const n = Number(v);
    return Number.isFinite(n) ? n : 0;
  };

export function totalPresentInventorySale(products = []) {
    const sum = (products ?? []).reduce((acc, p) => acc + toNum(p.sale_price) * toNum(p.quantity), 0);
    return toNum(sum.toFixed(2)); 
}

export const totalPresentCostInventory =(products=[])=>{
    const sum = (products ?? []).reduce((acc, p) => acc + toNum(p.cost_price) * toNum(p.quantity), 0);
    return toNum(sum.toFixed(2));

}

export const revenueByTimeRangee = (sales)=>{
    if (!Array.isArray(sales)) return 0;
    return sales.reduce(
      (sum, o) => sum + toNum(o.total_paid) - toNum(o.refunded_amount),
      0
    );
}

export const refundAmounts =(refund)=>{
    if (!Array.isArray(refund)) return 0;
    return refund.reduce( 
      (sum, o) => sum +  toNum(o?.order?.total_paid),
      0
    );
}


export const profitForAllSale = (sales = []) => {
    return sales.reduce((grandTotal, sale) => {
      const items = asItemsArray(sale?.items);
      const perSale = items.reduce((sum, s) => {
        return sum + (toNum(s.amount) - toNum(s.costPrice)) * toNum(s.quantity);
      }, 0);
      return grandTotal + perSale;
    }, 0);
  };



export const LowStockManager = (products)=>{
    return (products ?? []).filter(p => toNum(p.quantity) <= toNum(p.threshold));
}

export const totalExpenses = (expenses)=>{
    if (!Array.isArray(expenses)) return 0;
    return expenses.reduce(
      (sum, o) => sum +  toNum(o.total_gross),
      0
    );
}

export const grandProfit=({profitForAllSale, totalExpenses, refundAmounts})=>{
    const total =profitForAllSale-totalExpenses-refundAmounts
    return total;
}