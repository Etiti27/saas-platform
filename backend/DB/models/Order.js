import { DataTypes } from 'sequelize';
import { sequelize } from '../dbconfiguration.js';
import { EmployeeBase } from './Employee.js';
import { ProductBase } from './Product.js';

export const OrderBase = sequelize.define(
    'OrderBase',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      orderNumber: { type: DataTypes.STRING(60),  allowNull: false,unique: true},
      items:  { type: DataTypes.JSONB,  allowNull: false },
      profit:  { type: DataTypes.FLOAT,  allowNull: false },
      discount_amount: { type: DataTypes.FLOAT, allowNull: true },
      sold_by_id: { type: DataTypes.INTEGER,        allowNull: true }, //FK point to employee.id
      status: { type: DataTypes.STRING(30),    allowNull: false },
      refunded_amount:{ type: DataTypes.FLOAT, allowNull: true },
      product_id: {type: DataTypes.UUID, allowNull: true},
      total_paid: { type: DataTypes.FLOAT, allowNull: true },
    },
    {
      tableName: 'orders',
      timestamps: true,
      createdAt: 'added_date',
      updatedAt: 'updated_at',
      // 🧱 Indexes and uniqueness. These are created when the table is created.
    }
  );
  OrderBase.belongsTo(EmployeeBase, {as: 'employeeee', foreignKey:'sold_by_id' })
  OrderBase.belongsTo(ProductBase, {as: 'product', foreignKey:'product_id' })