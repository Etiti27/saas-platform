import { DataTypes } from 'sequelize';
import { sequelize } from '../dbconfiguration.js';

// models/tenants.js (ExpenseBase)
export const ExpenseBase = sequelize.define('Expense', {
    id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    date:         { type: DataTypes.DATEONLY, allowNull: false },
    vendor_name:  { type: DataTypes.STRING },
    category:     { type: DataTypes.STRING, allowNull: false },
    description:  { type: DataTypes.TEXT },
    amount:       { type: DataTypes.DECIMAL(12,2), allowNull: false },
    tax_mode:     { type: DataTypes.STRING, allowNull: false },
    tax_rate:     { type: DataTypes.DECIMAL(5,2), allowNull: false, defaultValue: 0 },
    total_net:    { type: DataTypes.DECIMAL(12,2) },
    total_tax:    { type: DataTypes.DECIMAL(12,2) },
    total_gross:  { type: DataTypes.DECIMAL(12,2) },
    currency:     { type: DataTypes.STRING(8), allowNull: false, defaultValue: 'USD' },
    method:       { type: DataTypes.STRING, allowNull: false, defaultValue: 'Bank Transfer' },
    reference:    { type: DataTypes.STRING },
    cost_center:  { type: DataTypes.STRING },
    notes:        { type: DataTypes.TEXT },
  }, {
    tableName: 'expenses',
    underscored: true,
    timestamps: true,               // let Sequelize manage timestamps
    createdAt: 'created_at',        // map to underscored names
    updatedAt: 'updated_at',
  });
  
