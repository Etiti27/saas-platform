export const updateQty = ({index, val, setProducts}) => {
    const q = Math.max(1, Number(val) || 1);
    setProducts((prev) => prev.map((p, i) => (i === index ? { ...p, quantity: q } : p)));
  };

 