import dotenv from 'dotenv'
dotenv.config();

import { Sequelize } from 'sequelize';

const isProduction = process.env.NODE_ENV === 'production';

export const sequelize = new Sequelize({
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT),
  dialect: 'postgres',
  logging: false,
  dialectOptions: isProduction && process.env.DB_SSL === 'true' ? {
    statement_timeout: 60000,
    idle_in_transaction_session_timeout: 30000,
    ssl: {
      require: true,
      rejectUnauthorized: false, // for self-signed certs; change in prod
    },
  } : {},
  pool: {
    max: 30,
    min: 0,
    acquire: 60000,
    idle: 10000,
    evict: 1000
  },
});