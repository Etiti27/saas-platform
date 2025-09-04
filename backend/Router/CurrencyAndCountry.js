// routes/auth.js
import express from 'express';

import dotenv from "dotenv";

import { countryAndCurrency } from '../Services/countryCurrency.js';
dotenv.config()


const router = express.Router();
router.get("/getcurrency",async (req,res)=>{
    const data= await countryAndCurrency()
    res.status(200).json({data:JSON.stringify(data, null, 2)});
})
export {router as countryCurrency}