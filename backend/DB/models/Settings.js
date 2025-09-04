import { DataTypes } from 'sequelize';
import { sequelize } from '../dbconfiguration.js';

export const UserPref = sequelize.define('UserPref', {
      user_id:   { type: DataTypes.STRING, primaryKey: true },
      value:     { type: DataTypes.JSONB, allowNull: false, defaultValue: {} },
      version:   { type: DataTypes.INTEGER, allowNull: false, defaultValue: 1 }, // optimistic lock
    }, {
      tableName: 'user_prefs',
    });

  