// scripts/bootstrap-tenants.js
import { sequelize } from './dbconfiguration.js';
import { UserPref } from './models/Settings.js';
import { JobBase} from './models/Job.js';
import {PayrollBase} from './models/Payroll.js'
import {EmployeeBase} from './models/Employee.js'
import {ProductBase} from './models/Product.js'
import {OrderBase} from './models/Order.js'
import { ExpenseBase } from './models/Expenses.js';
import { RefundBase } from './models/Refund.js';

const assertIdentifier = s => {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(String(s))) throw new Error(`Invalid schema name: ${s}`);
};

export async function bootstrapTenantDB(schemaName) {
  assertIdentifier(schemaName);
  await sequelize.authenticate();
  await sequelize.createSchema(schemaName).catch(() => {}); // ok if exists

  // Bind models to the tenant for DDL (this is key)
  const Job      = JobBase.schema(schemaName);
  const Payroll  = PayrollBase.schema(schemaName);
  const Employee = EmployeeBase.schema(schemaName);
  const Product = ProductBase.schema(schemaName);
  const Order = OrderBase.schema(schemaName)
  const userSetting = UserPref.schema(schemaName);
  const Expenses= ExpenseBase.schema(schemaName);
  const Refund= RefundBase.schema(schemaName)

  // Create parents first, then child
  await Job.sync();      // -> "<schemaName>".jobs
  await Payroll.sync();  // -> "<schemaName>".payroll
  await Employee.sync(); // -> "<schemaName>".employees
  await Product.sync(); // -> "<schemaName>".products
  await Order.sync(); // -> "<schemaName>".orders
  await userSetting.sync()
  await Expenses.sync()
  await Refund.sync()


  console.log(`${schemaName} is ready.`);
}




