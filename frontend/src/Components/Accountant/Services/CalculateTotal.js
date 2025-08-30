export const calculateTotal = ({products}) =>
products.reduce(
  (total, p) => total + (Number(p.amount) || 0) * (Number(p.quantity) || 0),
  0
);