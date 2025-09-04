import { DataTypes } from 'sequelize';
import { sequelize } from '../dbconfiguration.js';

export const JobBase = sequelize.define(
    'JobBase',
    {
      id:         { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      position:   { type: DataTypes.STRING(100), allowNull: false },
      department: { type: DataTypes.STRING(100), allowNull: false },
    },
    {
      tableName: 'jobs',      // ← table name only; no schema baked in
      timestamps: false,
    }
  );