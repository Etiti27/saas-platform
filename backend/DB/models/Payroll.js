import { DataTypes } from 'sequelize';
import { sequelize } from '../dbconfiguration.js';

export const PayrollBase = sequelize.define(
    'PayrollBase',
    {
      id:            { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      tax_no:        { type: DataTypes.STRING, allowNull: true },
      tax_form:      { type: DataTypes.TEXT, allowNull: true },       // e.g. Cloudinary URL
      contract_form: { type: DataTypes.TEXT, allowNull: true },       // e.g. Cloudinary URL
      bank_account:  { type: DataTypes.STRING(34), allowNull: true },// IBAN up to 34 chars
      bank_name:     { type: DataTypes.STRING(100), allowNull: true },
      account_name:  { type: DataTypes.STRING(100), allowNull: true },
    },
    {
      tableName: 'payroll',
      timestamps: false,
    }
  );
  