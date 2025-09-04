// routes/orders.js
import express from 'express';
import { sequelize } from '../DB/dbconfiguration.js';


import { createExpense } from '../DB/services/CRUD/ExpensesCRUD.js';
import { listExpensesByTimestamp } from '../DB/services/CRUD/ExpensesCRUD.js';

const router = express.Router();







vendor_name
: 
"manutd"

router.post('/add_expenses', async (req, res) => {
 const{date, vendor_name, category, description, amount, tax_mode, tax_rate, total_gross,total_net, total_tax, method, reference, cost_center, notes, currency }= req.body;

const payload={date, vendor_name, category, description, amount, tax_mode, tax_rate, method, reference, cost_center, 
    notes,total_gross, total_net, total_tax, currency}

  
    
  const schema = req.header('Tenant-Schema');

  if (!schema) return res.status(400).json({ message: 'Missing tenant schema header' });
  try {
    const t = await sequelize.transaction();
    await sequelize.query(`SET LOCAL search_path TO "${schema}"`, { transaction: t });
   
    const expenses =await createExpense(payload,  { transaction: t })
    await t.commit();
    res.status(201).json({ expenses });

  } catch (err) {
    // Make sure to roll back on error
    try { await t.rollback(); } catch {}
  
    // You set err.status above, so check that (not statusCode)
    if (err.status === 400) {
      return res.status(400).json({ message: err.message });
    }
    console.error(err);
    res.status(500).json({ message: err.message });
  }
  
});

router.get('/orders/:id', async (req, res) => {
  const schema = req.header('X-Tenant-Schema') || req.header('Tenant-Schema');
  if (!schema) return res.status(400).json({ message: 'Missing tenant schema header' });

  try {
    await sequelize.query(`SET LOCAL search_path TO "${schema}"`);
    const order = await getOrderById(req.params.id);
    if (!order) return res.status(404).json({ message: 'Not found' });
    res.json({ order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET /route/orders?dateFrom=2025-08-01&dateTo=2025-08-20
router.get('/date', async (req, res) => {
      const schema = req.header('Tenant-Schema'); // you already use this
      const dateFrom = req.query.dateFrom;          // YYYY-MM-DD
      const dateTo   = req.query.dateTo;
      console.log("exe");
      
      // basic validation
      const isISO = s => /^\d{4}-\d{2}-\d{2}$/.test(s);
    
      try {
        if (dateFrom && !isISO(dateFrom)) {throw new Error('Invalid date in "From" field')};
        if (dateTo && !isISO(dateTo)) {throw new Error('Invalid date in "To" field')}; 
        // Optional: ensure from <= to
        if (dateFrom && dateTo && dateFrom > dateTo) {
          throw new Error('"From" date must be less than or equal "To" date');
        }
        const t = await sequelize.transaction();
        
        await sequelize.query(`SET LOCAL search_path TO "${schema}"`, { transaction: t });

        const rows = await listExpensesByTimestamp({ from: dateFrom, to: dateTo}, { transaction: t });
        // const order = await createOrder({orderNumber, items, profit, discount_amount, sold_by_email, sold_by_name,status}, { transaction: t });
        await t.commit();
        // console.log("rows",rows );
        res.status(201).json({ rows });
    
      } catch (err) {
        console.log(err.message);
        res.status(500).json({ message: err.message });
      }

  });
  
 /*  const result = await listExpensesByTimestamp({
    from, to,
    category: category ? (Array.isArray(category) ? category : String(category)) : undefined,
    vendor_name, method,
    min_amount: min_amount != null ? Number(min_amount) : undefined,
    max_amount: max_amount != null ? Number(max_amount) : undefined,
    cost_center, currency,
    limit: limit != null ? Number(limit) : undefined,
    offset: offset != null ? Number(offset) : undefined,
    orderBy, orderDir,
  }, { /* models, tx, etc. 

  res.json(result);
} catch (err) {
  next(err);
}
 */



router.get('/orders', async (req, res) => {
  const schema = req.header('X-Tenant-Schema') || req.header('Tenant-Schema');
  if (!schema) return res.status(400).json({ message: 'Missing tenant schema header' });

  try {
    await sequelize.query(`SET LOCAL search_path TO "${schema}"`);
    const data = await listOrders(req.query);
    res.json(data);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.patch('/orders/:id', async (req, res) => {
  const schema = req.header('X-Tenant-Schema') || req.header('Tenant-Schema');
  if (!schema) return res.status(400).json({ message: 'Missing tenant schema header' });

  const t = await sequelize.transaction();
  try {
    await sequelize.query(`SET LOCAL search_path TO "${schema}"`, { transaction: t });
    const updated = await updateOrder(req.params.id, req.body, { transaction: t });
    await t.commit();
    if (!updated) return res.status(404).json({ message: 'Not found' });
    res.json({ order: updated });
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
});

router.delete('/orders/:id', async (req, res) => {
  const schema = req.header('X-Tenant-Schema') || req.header('Tenant-Schema');
  if (!schema) return res.status(400).json({ message: 'Missing tenant schema header' });

  const t = await sequelize.transaction();
  try {
    await sequelize.query(`SET LOCAL search_path TO "${schema}"`, { transaction: t });
    const ok = await deleteOrder(req.params.id, { transaction: t });
    await t.commit();
    if (!ok) return res.status(404).json({ message: 'Not found' });
    res.status(204).send();
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
});

export { router as expensessRouter };
