import { DataTypes } from 'sequelize';
import { sequelize } from '../dbconfiguration.js';
import { JobBase } from './Job.js';
import { PayrollBase } from './Payroll.js';

export const EmployeeBase = sequelize.define(
  'EmployeeBase',
  {
    id:           { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
    first_name:   { type: DataTypes.STRING(60),  allowNull: false },
    last_name:    { type: DataTypes.STRING(60),  allowNull: false },
    email:        { type: DataTypes.STRING(254), allowNull: false, unique: true, validate: { isEmail: true } },
    phone_number: { type: DataTypes.STRING(30),  allowNull: true },
    dob:          { type: DataTypes.DATEONLY,    allowNull: true },
    start_date:   { type: DataTypes.DATEONLY,    allowNull: true },
    id_card:      { type: DataTypes.TEXT,        allowNull: true }, // e.g. Cloudinary URL
    job_id:       { type: DataTypes.INTEGER,     allowNull: false },// FK points to jobs.id
    payroll_id:   { type: DataTypes.INTEGER,     allowNull: false },// FK points to payroll.id
  },
  {
    tableName: 'employees',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    // 🧱 Indexes and uniqueness. These are created when the table is created.
    indexes: [
      { unique: true, fields: ['email'] },       // Email must be unique per tenant schema
      { fields: ['job_id'] },                    // Helpful lookup index
      { unique: true, fields: ['payroll_id'] },  // Enforce 1:1 Payroll↔Employee
    ],
  }
);


  // Employee → Job (many-to-one)
  EmployeeBase.belongsTo(JobBase,     { as: 'job',     foreignKey: 'job_id' });
  JobBase.hasMany(EmployeeBase,       { as: 'employees', foreignKey: 'job_id' });

  // Employee → Payroll (one-to-one)
  EmployeeBase.belongsTo(PayrollBase, { as: 'payroll', foreignKey: 'payroll_id' });
  PayrollBase.hasOne(EmployeeBase,    { as: 'employee', foreignKey: 'payroll_id' });