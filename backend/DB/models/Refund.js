import { DataTypes } from 'sequelize';
import { sequelize } from '../dbconfiguration.js';
import { EmployeeBase } from './Employee.js';
import { OrderBase } from './Order.js';


// models/tenants.js (ExpenseBase)
export const RefundBase = sequelize.define('Refund', {
    id:           { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    refund_id:  { type: DataTypes.STRING, allowNull: false},
    order_id: { type: DataTypes.UUID, allowNull: false},
    approved_by: { type: DataTypes.INTEGER, allowNull: false},
    Reason: { type: DataTypes.STRING, allowNull: true},
    Payment_method: { type: DataTypes.STRING, allowNull: true},
    Receipt: { type: DataTypes.STRING, allowNull: true},
    note: { type: DataTypes.STRING, allowNull: true},
    
  }, {
    tableName: 'refund',
    underscored: true,
    timestamps: true,               // let Sequelize manage timestamps
    createdAt: 'created_at',        // map to underscored names
    updatedAt: 'updated_at',
  });
  
  RefundBase.belongsTo(EmployeeBase, {as: 'employee', foreignKey:'approved_by'})
  RefundBase.belongsTo(OrderBase, {as: 'order', foreignKey:'order_id'})
