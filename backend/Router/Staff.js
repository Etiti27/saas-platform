import express from 'express';
import multer from 'multer';
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';
import { Sequelize } from 'sequelize';

import { createUser } from '../DB/services/publicCRUD.js';
import { generateUuidPassword } from '../DB/services/GeneratePassword.js';
import { sendMail } from '../DB/services/MailService.js';
import { credentialEmail } from '../DB/services/emailText.js';
import { sequelize } from '../DB/dbconfiguration.js';


import { createEmployee } from '../DB/services/CRUD/EmployeeCRUD.js';
import { createJob } from '../DB/services/CRUD/JobCRUD.js';
import { createPayroll } from '../DB/services/CRUD/PayrollCRUD..js';
import { hashPassword } from '../DB/services/passwordService.js';

dotenv.config();

const router = express.Router();

/* ---------------- Multer setup ---------------- */
const allowedMime = new Set([
  'image/jpeg', 'image/png', 'image/jpg',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
]);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter: (req, file, cb) => {
    if (!allowedMime.has(file.mimetype)) {
      return cb(new Error(`Unsupported file type: ${file.mimetype}`));
    }
    cb(null, true);
  },
});

/* ---------------- Cloudinary setup ---------------- */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadBuffer = (file, folder) =>
  new Promise((resolve, reject) => {
    if (!file) return resolve(null);
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: 'auto',        // auto-detects image/pdf/doc
        use_filename: true,
        unique_filename: true,
        overwrite: false,
      },
      (err, result) => {
        if (err) return reject(err);
        resolve({
          url: result.secure_url,
          public_id: result.public_id,
          resource_type: result.resource_type,
        });
      }
    );
    stream.end(file.buffer);
  });

/* ---------------- Route: /addstaff ---------------- */
router.post('/addstaff',upload.fields([{name: 'idFile', maxCount: 1 },{ name: 'contractFile', maxCount: 1 },{ name: 'taxFormFile', maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const password = generateUuidPassword();

      const {
        schema, tenant_id, name,
        firstName, lastName, email, phone, dateOfBirth,
        position, department, startDate,
        ssn, bankName, bankAccount, accountName,
      } = req.body;
   

      if (!schema) {
        return res.status(400).json({ message: 'schema is required' });
      }
      if (!firstName || !lastName || !email) {
        return res.status(400).json({ message: 'firstName, lastName, and email are required' });
      }

      // Upload files (optional)
      const idUp  = await uploadBuffer(req.files?.idFile?.[0],       `tenants/${schema}/ids`);
      const conUp = await uploadBuffer(req.files?.contractFile?.[0], `tenants/${schema}/contracts`);
      const taxUp = await uploadBuffer(req.files?.taxFormFile?.[0],  `tenants/${schema}/tax`);

      const idUrl       = idUp?.url || null;
      const contractUrl = conUp?.url || null;
      const taxUrl      = taxUp?.url || null;

      // Ensure tenant schema models exist
   

      // Run everything atomically
      const employee = await sequelize.transaction(async (t) => {
        // Scope tenant operations to this schema
        await sequelize.query(`SET LOCAL search_path TO "${schema}"`, { transaction: t });

        const job = await createJob(
          { position, department },
          { transaction: t }
        );

        const payroll = await createPayroll(
          {
            tax_no: ssn,
            tax_form: taxUrl,
            contract_form: contractUrl,
            bank_account: bankAccount,
            bank_name: bankName,
            account_name: accountName,
          },
          { transaction: t }
        );

        const emp = await createEmployee(
          {
            last_name:   lastName,
            first_name:  firstName,
            email,
            phone_number: phone,
            dob:          dateOfBirth || null,
            start_date:   startDate,
            id_card:      idUrl,
            job_id:       job.id,
            payroll_id:   payroll.id,
          },
          { transaction: t }
        );

        // Create login user (likely in public schema)
        const passwordHash = await hashPassword(password);
        await createUser(
          { email, password: passwordHash, role: department, tenant_id },
          { transaction: t }
        );

        return emp;
      });

      // Send credentials after TX commit
      const html = credentialEmail({
        brand_name: name,
        recipient_name: `${firstName} ${lastName}`,
        email,
        password,
        app_url: process.env.SMTP_USER, // or your app URL
      });
      const mailOpts = {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: 'New Registration credentials',
        html,
      };
      await sendMail(mailOpts);

      return res.status(201).json({ employee });
    } catch (err) {
      // Unique constraint (email) => 409
      if (err instanceof Sequelize.UniqueConstraintError || err?.original?.code === '23505') {
        const field = err?.errors?.[0]?.path;
        const message =
          field === 'email'
            ? 'Email already exists'
            : err?.errors?.[0]?.message || 'Unique constraint failed';
        return res.status(409).json({ message, field });
      }

      // Custom thrown errors with status
      if (err.status) {
        return res.status(err.status).json({ message: err.message });
      }

      console.error(err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  }
);

/* ---- Multer errors / Bad file types ---- */
router.use((err, req, res, next) => {
  if (err && (err.name === 'MulterError' || String(err.message || '').startsWith('Unsupported file type'))) {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

export { router as Staff };
