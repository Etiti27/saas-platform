// orders: [{ total_paid, refunded_amount, profit, employeeee: {...} }, ...]
export function summarizeByEmployee(orders = []) {
    const byEmp = new Map();
  
    for (const o of orders) {
      const emp = o?.employeeee || null;
  
      // normalize name fields (your example had "null" as a literal string)
      const first = (emp?.first_name && emp.first_name !== 'null') ? emp.first_name : '';
      const last  = (emp?.last_name  && emp.last_name  !== 'null') ? emp.last_name  : '';
      const displayName =
        (first || last) ? `${first} ${last}`.trim()
        : emp?.email || (emp ? `#${emp.id}` : 'Unassigned');
  
      const key = emp?.id ?? 'unassigned';
  
      const revenue   = Number(o.total_paid) || 0;
      const refunded  = Number(o.refunded_amount) || 0;
      const netRev    = Math.max(0, revenue - refunded);  // keep non-negative if you prefer
      const profit    = Number(o.profit) || 0;
  
      const cur = byEmp.get(key) || {
        employee_id: emp?.id ?? null,
        name: displayName,
        email: emp?.email ?? null,
        orders: 0,
        revenue: 0,
        refunded: 0,
        netRevenue: 0,
        profit: 0,
      };
  
      cur.orders    += 1;
      cur.revenue   += revenue;
      cur.refunded  += refunded;
      cur.netRevenue+= netRev;
      cur.profit    += profit;
  
      byEmp.set(key, cur);
    }
  
    // sort by net revenue (desc)
    return Array.from(byEmp.values()).sort((a, b) => b.netRevenue - a.netRevenue);
  }
  