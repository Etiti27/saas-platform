import express from 'express';
import cors from 'cors';
import multer from 'multer';
import dotenv from 'dotenv';
import { Readable } from 'stream';
import cloudinaryModule from 'cloudinary';
import bodyParser from 'body-parser';
import { router  as RouterRegister} from './Router/Register.js';
import {router as RouterLogin } from './Router/Login.js';
import { Staff } from './Router/Staff.js';
import { generateUuidPassword } from './DB/services/GeneratePassword.js';
import { verifyMailer } from './DB/services/MailService.js';
import { sequelize } from './DB/dbconfiguration.js';

import { OrdersRouter } from './Router/Orders.js';
import { SettingRoute } from './Router/Settings.js';
import { expensessRouter } from './Router/Expenses.js';
import { refundRouter } from './Router/Refund.js';
import { Product } from './Router/Product.js';
import { countryCurrency } from './Router/CurrencyAndCountry.js';
// import { bootstrapTenant } from './DB/bootstrap.js';



dotenv.config();

const app = express();

// ✅ Enable CORS (allow all origins for now)
app.use(express.json())
app.use(cors());

// Or restrict to certain origins:
app.use(cors({
  origin: 'http://localhost:5173', // your frontend URL
  credentials: true               // if using cookies/auth
}));

app.use('/route', RouterRegister)
app.use('/route', RouterLogin)
app.use('/route/staff', Staff)
app.use('/route/product', Product)
app.use('/route/orders', OrdersRouter);
app.use('/setting', SettingRoute)
app.use('/expenses', expensessRouter);
app.use('/route/refund', refundRouter)
app.use('/route/get-country', countryCurrency)
const upload = multer();

const cloudinary = cloudinaryModule.v2;
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));








// Routes

app.get('/', (req,res)=>{
  res.send(generateUuidPassword())
})
app.post('/upload', upload.single('image'), (req, res) => {
    // const{logo, email, name}=req.biody
    console.log(req.body);
  if (!req.file) return res.status(400).json({ error: 'No image provided' });

  const stream = cloudinary.uploader.upload_stream(
    { folder: 'logos' },
    (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      console.log(result.secure_url );

      res.json({ url: result.secure_url });
    }
  );

  Readable.from(req.file.buffer).pipe(stream);
});

// app.post('/register', upload.single('logo'), async (req, res) => {
//     try {
//       const { name, email, password } = req.body; // logo is not here when using multer
//       let logoUrl = null;
  
//       if (req.file) {
//         // wrap upload_stream in a Promise so we can await it
//         const result = await new Promise((resolve, reject) => {
//           const stream = cloudinary.uploader.upload_stream(
//             { folder: 'logos' },
//             (err, result) => (err ? reject(err) : resolve(result))
//           );
//           Readable.from(req.file.buffer).pipe(stream);
//         });
//         logoUrl = result.secure_url;
//         console.log('Uploaded logo:', logoUrl);
//       } else {
//         console.log('No logo file uploaded');
//       }
  
  
//       console.log('New user:', { name, email,password, logoUrl });
  
//       return res.status(201).json({
//         message: 'User registered successfully!',
//         user: { name, email, logo: logoUrl },
//       });
//     } catch (err) {
//       console.error('Register failed:', err);
//       return res.status(500).json({ error: 'Internal server error', detail: err.message });
//     }
//   });

// Start server
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
