// routes/refund.routes.js
import express from 'express';
import { sequelize } from '../DB/dbconfiguration.js';
import {
  createRefund, getRefundById, listRefunds, updateRefund, deleteRefund
} from '../DB/services/CRUD/Refund.js';

import { UUID } from 'sequelize';
import { v4 as uuidv4, v7 as uuidv7 } from 'uuid';

export const refundRouter = express.Router();

// Helper to run inside tenant transaction
async function withTenantTx(schema, fn) {
  const t = await sequelize.transaction();
  try {
    await sequelize.query(`SET LOCAL search_path TO "${schema}", public;`, { transaction: t });
    const result = await fn({ transaction: t, searchPath: schema });
    await t.commit();
    return result;
  } catch (err) {
    await t.rollback();
    throw err;
  }
}

// Create
refundRouter.post('/create-refund', async (req, res) => {
  const schema = req.header('Tenant-Schema');
  // console.log("from refund", schema);
  if (!schema) return res.status(400).json({ message: 'Missing tenant schema header' });

  const {order_id, method:Payment_method, reason:Reason, employee_id:approved_by, note }= req.body;
  const refund_id    = `RF-${uuidv4().slice(0, 8)}`; 

 
 

  try {
    const t = await sequelize.transaction();
    await sequelize.query(`SET LOCAL search_path TO ${schema}`, { transaction: t });
    // allow friendly keys in body; service maps them
    const row = await createRefund({order_id, Payment_method, Reason, approved_by, note, refund_id}, {transaction: t});
  
    t.commit()
    res.status(200).json({ refund: row });
    
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// List
refundRouter.get('/get-refund', async (req, res, next) => {
    try {
      const schema = req.get('Tenant-Schema');
      if (!schema) return res.status(400).json({ message: 'Missing tenant schema header' });
  
      const dateFrom = req.query.dateFrom || req.query.graphDateFrom;
      const dateTo   = req.query.dateTo   || req.query.graphDateTo;
  
      // Run everything inside a managed transaction
      const result = await sequelize.transaction(async (t) => {
        // search_path applies to all queries in THIS tx
        await sequelize.query(
          `SET LOCAL search_path TO "${schema}", public;`,
          { transaction: t }
        );
  
        // Return the computed result; tx will COMMIT if we reach here
        return listRefunds(
          {
            // q: req.query.q,
            // order_id: req.query.order_id,
            // approved_by: req.query.approved_by,
            dateFrom,
            dateTo,
            page: Number(req.query.page) || 1,
            pageSize: Number(req.query.pageSize) || 20,
            sortBy: req.query.sortBy,
            sortDir: req.query.sortDir,
          },
          { transaction: t } // will be picked up by opt(ctx)
        );
      });
  
      return res.json(result);
    } catch (err) {
      return res.status(500).json({ message: err.message });
    }
  });
  

// Get one
refundRouter.get('/:id', async (req, res) => {
  const schema = req.header('Tenant-Schema') || req.header('X-Tenant-Schema');
  if (!schema) return res.status(400).json({ message: 'Missing tenant schema header' });

  try {
    const row = await withTenantTx(schema, (ctx) => getRefundById(req.params.id, ctx));
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json({ refund: row });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Patch / Update
refundRouter.patch('/:id', async (req, res) => {
  const schema = req.header('Tenant-Schema') || req.header('X-Tenant-Schema');
  if (!schema) return res.status(400).json({ message: 'Missing tenant schema header' });

  try {
    const row = await withTenantTx(schema, (ctx) => updateRefund(req.params.id, req.body, ctx));
    if (!row) return res.status(404).json({ message: 'Not found' });
    res.json({ refund: row });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Delete
refundRouter.delete('/:id', async (req, res) => {
  const schema = req.header('Tenant-Schema') || req.header('X-Tenant-Schema');
  if (!schema) return res.status(400).json({ message: 'Missing tenant schema header' });

  try {
    const ok = await withTenantTx(schema, (ctx) => deleteRefund(req.params.id, ctx));
    if (!ok) return res.status(404).json({ message: 'Not found' });
    res.json({ deleted: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});
