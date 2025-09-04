// scripts/bootstrap-tenants.js
import { sequelize } from './dbconfiguration.js';
import { SaasTenant, SaasUser } from './models/public.customer.js';


export async function bootstrapDB() {
  try {
    // Verify connection
    await sequelize.authenticate();

    // (Optional) ensure schema exists — public usually exists already
    await sequelize.createSchema('public', { logging: false }).catch(() => {});

    // Create table if not exists (no destructive changes)
    await SaasTenant.sync({ alter: true }); // or: SaasTenant.sync({ alter: false })
    await SaasUser.sync(); 
    console.log('[bootstrap] public.saas_tenants is ready.');
  } catch (err) {
    console.error('[bootstrap] failed to prepare saas_tenants:', err);
    throw err;
  }
}
