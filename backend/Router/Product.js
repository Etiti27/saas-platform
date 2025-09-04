// routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { SaasUser, SaasTenant } from '../DB/models/public.customer.js';
import { getUserByEmail } from '../DB/services/publicCRUD.js';
import dotenv from "dotenv";
import { sequelize } from '../DB/dbconfiguration.js';
import { listProducts, deleteProduct,createProduct, getProductById,updateProduct  } from '../DB/services/CRUD/Product.js';
import {getOrderById} from '../DB/services/CRUD/Order.js'
import {getEmployeeByEmail} from '../DB/services/CRUD/EmployeeCRUD.js'
import { UniqueConstraintError, ForeignKeyConstraintError, ValidationError } from 'sequelize';


dotenv.config()


const router = express.Router();
const toInt = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? Math.trunc(n) : NaN;
};
const toFloat = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
};



// const JWT_SECRET = process.env.JWT_SECRET;              // set this!
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';
// const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || '7d';

router.get('/all_products', async (req, res) => {
  const schema = req.header('Tenant-Schema'); 
  // console.log("checked", schema);
  try {
    
    
    await sequelize.transaction(async (t) => {
    await sequelize.query(`SET LOCAL search_path TO "${schema}"`, { transaction: t });
    const data=await listProducts({}, { transaction: t})
    // console.log(data);

    res.status(200).json(data)
})
  } catch (err) {
    
    return res.status(500).json({ message: err.message });
  }
});

router.post('/delete_product', async (req, res) => {
  try {
    
    const { id, name, schema} = req.body;
    // console.log(req.body);
    // return

   
    if ( !id || !schema) {
      return res.status(400).json({ message: 'important parameter missing' });
    }

    try{
      await sequelize.transaction(async (t) => {
      await sequelize.query(`SET LOCAL search_path TO "${schema}"`, { transaction: t });
      const deletedProduct= await deleteProduct(id,{ transaction: t});
      // console.log(deletedProduct);
      res.status(200).json({message: deletedProduct})
        })
        
    }catch(err){
      res.status(500)
      // console.log(err);
    }
    

    
  } catch (err) {
    
    return res.status(500).json({ message: err.message });
  }
});


router.post('/add_product', async (req, res) => {
  try {
    const { newProduct, email, schema } = req.body || {};
    if (!schema) return res.status(400).json({ message: 'schema is required' });
    if (!newProduct || typeof newProduct !== 'object') {
      return res.status(400).json({ message: 'newProduct payload is required' });
    }

    const {
      name,
      quantity,
      threshold,
      cost_price,
      sale_price,
      expiring_date,
      location,
    } = newProduct;

    // Coerce numeric fields
    const qty = toInt(quantity);
    const th  = toInt(threshold);
    const cp  = toFloat(cost_price);
    const sp  = toFloat(sale_price);

    // Normalize date: accept '', null, undefined => null
    const expire =
      expiring_date && String(expiring_date).trim().length >= 2
        ? expiring_date
        : null;

    // Validate requireds
    if (!name || !location) {
      return res.status(422).json({ message: 'name and location are required' });
    }
    if (!Number.isFinite(qty) || qty < 0) {
      return res.status(422).json({ message: 'quantity must be a non-negative integer' });
    }
    if (!Number.isFinite(th) || th < 0) {
      return res.status(422).json({ message: 'threshold must be a non-negative integer' });
    }
    if (!Number.isFinite(cp) || cp < 0 || !Number.isFinite(sp) || sp < 0) {
      return res.status(422).json({ message: 'cost_price and sale_price must be non-negative numbers' });
    }
    if (!email) {
      return res.status(422).json({ message: 'uploader email is required' });
    }
   

    // Managed transaction auto-commits/rolls back
    const product = await sequelize.transaction(async (t) => {
      // set search_path safely (escape quotes)
      const safeSchema = String(schema).replace(/"/g, '""');
      await sequelize.query(`SET LOCAL search_path TO "${safeSchema}"`, { transaction: t });

      // find the employee/uploader
      const employee = await getEmployeeByEmail(email, { transaction: t });
      if (!employee) {
        const err = new Error(`Employee with email "${email}" not found`);
        err.status = 404;
        throw err;
      }

      // create the product in tenant schema
      const created = await createProduct(
        {
          product_name: name,
          quantity: qty,
          threshold: th,
          location,
          cost_price: cp,
          sale_price: sp,
          expiring_date: expire,       // DATEONLY or null
          uploaded_by_id: employee.id, // FK to employees.id (NOT NULL)
        },
        { transaction: t }
      );

      // `createProduct` likely returns a model instance or plain object
      return created && created.get ? created.get({ plain: true }) : created;
    });

    return res.status(200).json({ product });
  } catch (err) {
    // Known Sequelize errors
    if (err instanceof UniqueConstraintError) {
      const field = err?.errors?.[0]?.path || 'unique';
      return res.status(409).json({ message: `${field} must be unique.`, field });
    }
    if (err instanceof ForeignKeyConstraintError) {
      return res.status(400).json({ message: 'Foreign key constraint failed.' });
    }
    if (err instanceof ValidationError) {
      return res.status(422).json({ message: err.message });
    }
    if (err.status) {
      // Custom thrown errors (e.g., employee not found)
      return res.status(err.status).json({ message: err.message });
    }

    console.error('add_product failed:', err);
    return res.status(500).json({ message: 'Internal server error' });
  }
});

router.patch("/update-product",async (req, res) => {

  const schema = req.get("Tenant-Schema");
  const { id } = req.query;


  // console.log(req.body);
  
  try {
    const t = await sequelize.transaction();
    await sequelize.query(`SET LOCAL search_path TO ${schema}`, { transaction: t });
    if(req.body!==null){
      const updated=await updateProduct(id,req.body ,{ transaction: t })
      await t.commit();
      res.status(200).json({updated})
      return
      
    }
    
    const order = await getOrderById(id,{ transaction: t });
    await Promise.all(order.items.map(async(item)=>{
      
      const currentProduct= await getProductById(item.id,{ transaction: t } )
     
      const payload={quantity:currentProduct.quantity + item.quantity}
      const updatedProduct= await updateProduct(item.id,payload ,{ transaction: t })
      
      return updatedProduct;
      
  }))
      await t.commit();
      res.status(200)
  } catch (error) {
    res.status(500).json({message:error.message})
    
  }

});
export { router as Product };

