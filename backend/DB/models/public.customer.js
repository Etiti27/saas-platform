// models/publicModels.js
import { DataTypes } from 'sequelize';
import {sequelize} from '../dbconfiguration.js';

export const SaasTenant = sequelize.define('SaasTenant', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  name: { type: DataTypes.STRING, allowNull: false },
  admin_email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  schema_name: { type: DataTypes.STRING, allowNull: false, unique: true },
  logo: { type: DataTypes.STRING, allowNull: false, unique: true },
  start_date: { type: DataTypes.DATEONLY, allowNull: true},
  sector: { type: DataTypes.STRING, allowNull: true},
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,    // ← current date
    allowNull: false
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,    // ← current date
    allowNull: false
  }
}, { 
  schema: 'public',
  tableName: 'saas_tenants',
  timestamps: true,
  createdAt: 'created_at',  
  updatedAt: 'updated_at'
});


export const SaasUser = sequelize.define('SaasUser', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  email: { type: DataTypes.STRING, allowNull: false, unique: true, validate: { isEmail: true } },
  password: { type: DataTypes.STRING, allowNull: false, field: 'password_hash' },
  role:{ type: DataTypes.STRING, allowNull: false, validate:{len:[1,15]}, onDelete:"CASCADE", onUpdate: "CASCADE"},
  tenant_id: {
    type: DataTypes.UUID, allowNull: false,
    references: { model: { tableName: 'saas_tenants', schema: 'public' }, key: 'id' },
    onDelete: 'CASCADE', onUpdate: 'CASCADE',
  },
  created_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  updated_at: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  }
}, { 
  schema: 'public',
  tableName: 'users',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

SaasUser.belongsTo(SaasTenant, { foreignKey: 'tenant_id', as: 'tenant' });
SaasTenant.hasMany(SaasUser, { foreignKey: 'tenant_id', as: 'users' });
