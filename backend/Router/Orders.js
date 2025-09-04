// routes/orders.js
import express from 'express';
import { sequelize } from '../DB/dbconfiguration.js';
import {
  createOrder, getOrderById, getOrderByNumber,
  listOrders, updateOrder, deleteOrder, listOrdersByTimestamp,
} from '../DB/services/CRUD/Order.js';
import { getProductById, updateProduct, decrementStock} from '../DB/services/CRUD/Product.js'

import { bootstrapDB } from '../DB/boostrapDB.js';
import { v4 as uuidv4, v7 as uuidv7 } from 'uuid';
import { bootstrapTenantDB } from '../DB/boostrapTenant.js';

const router = express.Router();

const CheckQty = ({qtyFromUI, qtyFromDB})=>{
    if(qtyFromUI>qtyFromDB){
        return 0
    }
    return 1

}

router.post('/create_order', async (req, res) => {
    const {items, profit,discountAmount:discount_amount, soldById, status, totalPaid}  = req.body;
    // console.log(req.body);
    const orderNumber    = `OR-${uuidv4().slice(0, 8)}`; 
    
    // return
    // console.log("sold by ",soldById);
    
  const schema = req.header('Tenant-Schema');
  // console.log(schema);
  if (!schema) return res.status(400).json({ message: 'Missing tenant schema header' });
  try {
    const t = await sequelize.transaction();
    await sequelize.query(`SET LOCAL search_path TO "${schema}"`, { transaction: t });
    await Promise.all(items.map(async (item) => {
      const productFromDB = await getProductById(item.id, { transaction: t /*, lock: t.LOCK.UPDATE */ });
    //   console.log("product", productFromDB.id);
    //   console.log("itemprod", item.id);
      if (!productFromDB) {
        const err = new Error(`Product ${item.id} not found`);
        err.status = 404;
        throw err;
      }
      if (CheckQty({ qtyFromUI: item.quantity, qtyFromDB: productFromDB.quantity }) === 0) {
        const err = new Error(`${item.name} is sold out or you don't have this quantities left`);
        err.status = 400;
        throw err;
      }
      // 👈 FIX: pass positional args (id, by, ctx)
      await decrementStock(item.id, item.quantity, { transaction: t });
    }));
    const order = await createOrder(
      { orderNumber, items, profit, discount_amount, sold_by_id:soldById, status, total_paid:totalPaid },
      { transaction: t }
    );
    await t.commit();
    res.status(201).json({ order });

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
      const dateFrom = req.query.dateFrom || req.query.graphDateFrom;          // YYYY-MM-DD
      const dateTo   = req.query.dateTo || req.query.graphDateTo;
      const soldById= req.query.soldById;
    
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

        const rows = await listOrdersByTimestamp({ from: dateFrom, to: dateTo, sold_by_id:soldById }, { transaction: t });
        // console.log(rows);
        // const order = await createOrder({orderNumber, items, profit, discount_amount, sold_by_email, sold_by_name,status}, { transaction: t });
        await t.commit();
        // console.log("rows",rows );
        res.status(201).json({ rows });
    
      } catch (err) {
        // console.log(err.message);
        res.status(501).json({ message: err.message });
      }

  });
  




router.get('/getorder', async (req, res) => {
   
  const schema = req.header('Tenant-Schema') || req.header('Tenant-Schema');
 
  if (!schema) return res.status(400).json({ message: 'Missing tenant schema header' });

  try {
    await bootstrapTenantDB(schema)
   
    const t = await sequelize.transaction();
    await sequelize.query(`SET LOCAL search_path TO "${schema}"`,{ transaction: t });
    const data = await listOrders({ transaction: t });
  
    await t.commit()
    res.status(200).json(data);
  } catch (err) {
    // console.log(err);
    res.status(500).json({ message: err.message });
  }
});

router.patch('/update', async (req, res) => {
    const schema = req.get('tenant-schema') || req.get('x-tenant-schema');
   
    if (!schema) return res.status(400).json({ message: 'Missing tenant schema header' });
  
    const { id } = req.query;     
                 // <-- from params in Axios config
    if (!id) return res.status(400).json({ message: 'Missing id' });

  
    const patch = req.body || {};  
    
             // <-- whatever you sent as body
   
  
    const t = await sequelize.transaction();
    try {
      await sequelize.query(`SET LOCAL search_path TO ${schema}`, { transaction: t });
      const updated = await updateOrder(id, patch, { transaction: t });
    
      await t.commit();
      if (!updated) return res.status(404).json({ message: 'Not found' });
      res.status(200).json({ order: updated });
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
    await sequelize.query(`SET LOCAL search_path TO ${schema}`, { transaction: t });
    const ok = await deleteOrder(req.params.id, { transaction: t });
    await t.commit();
    if (!ok) return res.status(404).json({ message: 'Not found' });
    res.status(204).send();
  } catch (err) {
    await t.rollback();
    res.status(500).json({ message: err.message });
  }
});

export { router as OrdersRouter };
