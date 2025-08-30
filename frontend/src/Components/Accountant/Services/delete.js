export const deleteProduct = ({index, setProducts}) => {
    setProducts((prev) => prev.filter((_, i) => i !== index));
  };

 