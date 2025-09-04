const currency = new Intl.NumberFormat(undefined, { style: 'currency', currency: 'USD' });
export const fmtMoney = (n) => (Number.isFinite(+n) ? currency.format(+n) : '—');