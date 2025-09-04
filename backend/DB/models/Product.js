import { DataTypes } from 'sequelize';
import { sequelize } from '../dbconfiguration.js';
import { EmployeeBase } from './Employee.js';

export const ProductBase = sequelize.define(
    'ProductBase',
    {
      id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
      product_name:   { type: DataTypes.STRING(60),  allowNull: false },
      threshold:    { type: DataTypes.INTEGER,  allowNull: true },
      location:        { type: DataTypes.STRING(254), allowNull: false },
      quantity: { type: DataTypes.INTEGER,  allowNull: true },
      cost_price:  { type: DataTypes.FLOAT,    allowNull: false },
      sale_price: { type: DataTypes.FLOAT,    allowNull: false },
      expiring_date:   { type: DataTypes.DATEONLY,    allowNull: true },
      
      uploaded_by_id:      { type: DataTypes.INTEGER,        allowNull: true }, //FK point to employee.id
    },
    {
      tableName: 'products',
      timestamps: true,
      createdAt: 'added_date',
      updatedAt: 'updated_at',
      // 🧱 Indexes and uniqueness. These are created when the table is created.
      indexes: [
        { fields: ['uploaded_by_id'] },                    // Helpful lookup index
      ],
    }
  );

  ProductBase.belongsTo(EmployeeBase, {as: 'employe', foreignKey:'uploaded_by_id' })