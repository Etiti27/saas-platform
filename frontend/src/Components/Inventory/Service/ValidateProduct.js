export const validateNewProduct = (np) => {
    const errs = {};
    const required = ['name', 'quantity', 'threshold', 'location', 'cost_price', 'sale_price'];
    required.forEach((k) => {
      if (!String(np[k]).trim()) errs[k] = 'Required';
    });
    const numeric = ['quantity', 'threshold', 'cost_price', 'sale_price'];
    numeric.forEach((k) => {
      if (String(np[k]).trim() && isNaN(Number(np[k]))) errs[k] = 'Must be a number';
      if (['quantity', 'threshold'].includes(k) && Number(np[k]) < 0) errs[k] = 'Cannot be negative';
      if (['cost_price', 'sale_price'].includes(k) && Number(np[k]) < 0) errs[k] = 'Cannot be negative';
    });
    if (np.expiring_date && Number.isNaN(Date.parse(np.expiring_date))) {
      errs.expiring_date = 'Invalid date';
    }
    return errs;
  };