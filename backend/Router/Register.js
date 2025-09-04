import express from 'express';
import multer from 'multer';
import { Readable } from 'stream';
import cloudinaryModule, { v2 as cloudinaryV2 } from 'cloudinary';
import { sequelize } from '../DB/dbconfiguration.js';
import { createTenant, createUser } from '../DB/services/publicCRUD.js';
import { hashPassword } from '../DB/services/passwordService.js';
import { bootstrapDB } from '../DB/boostrapDB.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { Sequelize } from 'sequelize';
import { bootstrapTenantDB } from '../DB/boostrapTenant.js';
import { createEmployee } from '../DB/services/CRUD/EmployeeCRUD.js';
import { createJob } from '../DB/services/CRUD/JobCRUD.js';
import { createPayroll } from '../DB/services/CRUD/PayrollCRUD..js';

import {
  createUserPref, getUserPref, replaceUserPref, mergeUserPref,
  patchUserPrefPath, deleteUserPref, listUserPrefs
} from '../DB/services/UserSettingCRUD.js';

dotenv.config();

const { JWT_SECRET, JWT_EXPIRES_IN, REFRESH_EXPIRES_IN } = process.env;

const router = express.Router();

// Multer: in-memory buffer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

// Cloudinary v2
const cloudinary = cloudinaryModule.v2 || cloudinaryV2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function slugify(name) {
  return String(name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

const defaultSetting={
  "theme": "light",
  "density": "comfortable",
  "currency": "USD",
  "sections": {
    "revenueTrend": true,
    "payments": true,
    "ordersTrend": true,
    "revenueByCategory": true,
    "customerSegments": true,
    "topProducts": true,
    "lowStock": true,
    "employeeLeaderboard": true,
    "recommendations": true,
    "profitByDate": true,
    "salesOnDate": true,
    "refunds": true
  },
  "defaultRange": { "from": "2025-08-01", "to": "2025-08-07" }
}

router.post('/register', upload.single('logo'), async (req, res) => {
  try {
    const { name, email, password: rawPassword, adminName, adminPhone, companyStartDate, sector } = req.body;


    // Basic validation → 400
    if (!name || !email || !rawPassword || !adminName || !adminPhone||!companyStartDate||!sector) {
      throw new Error("one of the required field is not provided")
    }
    if (!req.file) {
      throw new Error("logo is not uploaded")
    }

    // Upload logo to Cloudinary (guarded) → 502 if upload fails
    let logoUrl;
    try {
      const uploaded = await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { folder: 'logos' },
          (err, result) => (err ? reject(err) : resolve(result))
        );
        Readable.from(req.file.buffer).pipe(stream);
      });
      logoUrl = uploaded.secure_url;
    } catch (e) {
      console.error('Cloudinary upload failed:', e);
      return res.status(502).json({ message: 'Failed to upload logo' });
    }

    // Prepare schema name and password hash
    const base = slugify(name);
    const suffix = Math.random().toString(36).slice(2, 6);
    const schemaName = `${base}_${suffix}`;
    const hashedPassword = await hashPassword(rawPassword);

    // Bootstrap base DB if needed
    await bootstrapDB();
    await bootstrapTenantDB(schemaName)
   

    // Run everything atomically
    const t = await sequelize.transaction() 

      const tenant= await createTenant({name:name, logo:logoUrl, admin_email: email, schema_name:schemaName, start_date: companyStartDate}, {transaction: t});
      
      const user=await createUser({ email, password: hashedPassword, role: "Admin", tenant_id: tenant.id },{ transaction: t });
      
      // Scope tenant operations to this schema
      await sequelize.query(`SET LOCAL search_path TO "${schemaName}"`, { transaction: t });
      const job = await createJob({ position:"Admin", department: "Admin" },{ transaction: t});

      const payroll = await createPayroll({tax_no: null,tax_form: null, contract_form: null,bank_account: null,bank_name: null,
        account_name: null},{ transaction: t});
      const employee=await createEmployee({last_name: adminName,first_name: null,email, phone_number: adminPhone, dob: null, start_date: null, 
        id_card: null,job_id: job.id, payroll_id:   payroll.id},{ transaction: t});


      const { row, created } = await createUserPref({user_id:user.id, initial:defaultSetting|| {}}, { transaction: t});
      
      await t.commit()
     
  
    

    // Create tokens
    const payload = {
      user,
      employee,
     /*  sub: user.id,
      
      email: user.email,
      tenant_id: user.tenant_id,
      
      role: user.role ?? 'user', */
    
    };
    const access_token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  /*   const refresh_token = jwt.sign(
      { sub: userOut.id, tenant_id: userOut.tenant_id },
      JWT_SECRET,
      { expiresIn: REFRESH_EXPIRES_IN }
    ); */

    // Success → 201
    return res.status(200).json({
      access_token,
      // refresh_token,
      /* user: {
        id: userOut.id,
        name: userOut.tenant.name,
        email: userOut.email,
        schema: userOut.tenant.schema_name,
        role: userOut.role ?? 'user',
        logo: userOut.tenant.logo,
      },
      tenant: userOut.tenant?.schema_name, */
    });
  } catch (err) {
    console.error('Register failed:', err);
    return res.status(500).json({ message: err.message, detail: err.message });
  }
});

export { router };
