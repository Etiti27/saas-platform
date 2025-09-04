const toCents = (v) => Math.round((Number(v) || 0) * 100);

// Same inputs as above
export const calcProfit = async ({products, discountTotal = 0}) => {
  const grossCents = await products.reduce((sum, p) => {
    const saleC = toCents(p.amount ?? p.sale_price);
    const costC = toCents(p.costPrice ?? p.cost_price);
    const qty   = Number(p.quantity) || 0;
    return sum + (saleC - costC) * qty;
  }, 0);

  return (grossCents - toCents(discountTotal)) / 100; // back to dollars
};
