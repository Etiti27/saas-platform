// routes/auth.js
import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import { SaasUser, SaasTenant } from '../DB/models/public.customer.js';
import { getUserByEmail } from '../DB/services/publicCRUD.js';
import dotenv from "dotenv";
import { sequelize } from '../DB/dbconfiguration.js';
import { getEmployeeByEmail } from '../DB/services/CRUD/EmployeeCRUD.js';
import { bootstrapTenantDB } from '../DB/boostrapTenant.js';
import { bootstrapDB } from '../DB/boostrapDB.js';
dotenv.config()


const router = express.Router();


const {JWT_SECRET,JWT_EXPIRES_IN,REFRESH_EXPIRES_IN}=process.env;

// const JWT_SECRET = process.env.JWT_SECRET;              // set this!
// const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '12h';
// const REFRESH_EXPIRES_IN = process.env.REFRESH_EXPIRES_IN || '7d';

router.post('/login', async (req, res) => {
  try {
    // console.log("pinged");
    const { email, password } = req.body;
    // console.log(email, password);
    if (!email || !password) {
      return res.status(400).json({ message: 'email and password are required' });
    }
    await bootstrapDB()

    const user = await getUserByEmail(email)
    if(user==null) return res.status(500).json({message:"detail is null"})

    if (!user) return res.status(401).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ message: 'Invalid credentials' });

    await bootstrapDB();
    await bootstrapTenantDB(user.tenant.schema_name)
    let employee
    await sequelize.transaction(async (t) => {
    await sequelize.query(`SET LOCAL search_path TO "${user.tenant.schema_name}"`, { transaction: t });
    employee= await getEmployeeByEmail(user.email,{ transaction: t});
    // console.log("logged in employee", employee);
    // console.log("user", user);
        })
    

    // JWT payload – safe, no secrets
    const payload = {
      user, employee
    };
    const access_token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
    const refresh_token = jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_EXPIRES_IN });
   


    return res.status(200).json({
      access_token,
      refresh_token,
     
    });
  } catch (err) {
    // console.log(err);
    
    return res.status(500).json({ message: err.message });
  }
});
export { router };

