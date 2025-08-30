// useTopProductsByUnits.js
import { useMemo } from 'react';

const inRange = (iso, from, to) => {
  if (!iso) return false;
  const day = iso.slice(0, 10); // YYYY-MM-DD
  if (from && day < from) return false;
  if (to && day > to) return false;
  return true;
};

const getItem = (it) => {
  const name = it.product_name ?? it.product ?? it.name ?? 'Unknown';
  const qty = Number(it.quantity ?? it.qty ?? 0) || 0;
  const unitPrice = Number(it.unit_price ?? it.amount ?? 0) || 0; // sale price
  const line = qty * unitPrice;
  return { name, qty, unitPrice, line };
};

/**
 * orders: [{ added_date|updated_at, total_discount|discount_amount, items:[{ product_name|product|name, quantity|qty, unit_price|amount }] }]
 * options: { from?: 'YYYY-MM-DD', to?: 'YYYY-MM-DD', limit?: number, apportionDiscount?: boolean }
 */
export function useTopProductsByUnits(
  orders = [],
  { from, to, limit = 10, apportionDiscount = false } = {}
) {
  return useMemo(() => {
    const byProduct = new Map(); // name -> { units, revenue }

    for (const o of orders) {
      const iso = o.added_date || o.updated_at || o.date || '';
      if (!inRange(iso, from, to)) continue;

      const items = Array.isArray(o.items) ? o.items : [];
      if (!items.length) continue;

      // build lines + order subtotal for proportional discount
      const lines = items.map(getItem);
      const orderSub = lines.reduce((s, x) => s + x.line, 0);
      const orderDiscount = Number(o.total_discount ?? o.discount_amount ?? 0) || 0;

      for (const x of lines) {
        let revenue = x.line;
        if (apportionDiscount && orderSub > 0 && orderDiscount > 0) {
          const share = (x.line / orderSub) * orderDiscount;
          revenue = Math.max(0, x.line - share);
        }
        const prev = byProduct.get(x.name) || { units: 0, revenue: 0 };
        byProduct.set(x.name, {
          units: prev.units + x.qty,
          revenue: prev.revenue + revenue,
        });
      }
    }

    // to array + rank
    const arr = Array.from(byProduct, ([name, v]) => ({ name, ...v }));
    arr.sort((a, b) => {
      // primary: units desc; tiebreaker: revenue desc; then name asc
      if (b.units !== a.units) return b.units - a.units;
      if (b.revenue !== a.revenue) return b.revenue - a.revenue;
      return a.name.localeCompare(b.name);
    });

    return arr.slice(0, Math.max(1, limit)).map((p, i) => ({ rank: i + 1, ...p }));
  }, [orders, from, to, limit, apportionDiscount]);
}
