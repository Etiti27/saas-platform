// models.js
import { DataTypes } from 'sequelize';
import { sequelize } from '../dbconfiguration.js';

// 🔒 Guard flag so we don't wire associations more than once.
// If we wire the same alias ('job', 'payroll') twice, Sequelize throws:
// "Aliased associations must have unique aliases".


/**
 * JobBase → physical table name "jobs" (no schema here)
 * ⚠️ Notice: there is NO ".schema(...)" here. That keeps the model "unbound".
 * We'll pick the tenant schema at query time using search_path (see withTenant.js).
 */

/**
 * PayrollBase → table "payroll"
 * We store bank/tax info here. Again, schema is *not* set on the model.
 */


/**
 * EmployeeBase → table "employees"
 * Includes FK columns job_id and payroll_id, and a unique index on payroll_id
 * to enforce a 1:1 relationship Employee↔Payroll.
 */







 
