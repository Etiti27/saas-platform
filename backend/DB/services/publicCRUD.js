// tenants-users.model.service.js
// CRUD for SaasTenant & SaasUser using Sequelize models (public schema)

import { Op, UniqueConstraintError } from 'sequelize';
import { SaasTenant, SaasUser } from '../models/public.customer.js';

/* ----------------------------------------------------------------------------
 * Helpers
 * --------------------------------------------------------------------------*/
function normalizeUnique(err) {
  if (!(err instanceof UniqueConstraintError)) return err;

  const fieldFromPath = err?.errors?.[0]?.path;
  const fieldFromMap  = Object.keys(err.fields || {})[0];
  const field = fieldFromPath || fieldFromMap || 'unique';

  const emailHit = field === 'email';
  const e = new Error(emailHit ? 'Email already exists' : `${field} must be unique.`);
  e.code = emailHit ? 'EMAIL_TAKEN' : 'UNIQUE_VIOLATION';
  e.field = field;
  e.status = 409; // useful for HTTP mapping
  return e;
}

function sanitizeSort(allowed, by = 'created_at', dir = 'DESC') {
  const sortBy = allowed.has(by) ? by : 'created_at';
  const sortDir = String(dir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  return [sortBy, sortDir];
}

/* ----------------------------------------------------------------------------
 * Tenants
 * --------------------------------------------------------------------------*/
const TENANT_SORTABLE = new Set(['name', 'schema_name', 'created_at', 'updated_at']);
// name:name, logo:logoUrl, admin_email: email, schema_name:schemaName, start_date: companyStartDate
export async function createTenant({ name, admin_email, schema_name, logo, start_date}, opts = {}) {
  try {
    const row = await SaasTenant.create(
      { name, admin_email, schema_name, logo, start_date},
      { transaction: opts.transaction }
    );
    return row.get({ plain: true });
  } catch (err) {
    throw normalizeUnique(err);
  }
}

export async function getTenantById(id, opts = {}) {
  const row = await SaasTenant.findByPk(id, { transaction: opts.transaction });
  return row ? row.get({ plain: true }) : null;
}

export async function getTenantBySchema(schema_name, opts = {}) {
  const row = await SaasTenant.findOne({
    where: { schema_name },
    transaction: opts.transaction,
  });
  return row ? row.get({ plain: true }) : null;
}

export async function listTenants(
  { page = 1, pageSize = 20, search, sortBy, sortDir } = {},
  opts = {}
) {
  const p = Math.max(1, Number(page));
  const ps = Math.min(100, Math.max(1, Number(pageSize)));
  const [sb, sd] = sanitizeSort(TENANT_SORTABLE, sortBy, sortDir);

  const where = search
    ? {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { schema_name: { [Op.iLike]: `%${search}%` } },
        ],
      }
    : undefined;

  const { rows, count } = await SaasTenant.findAndCountAll({
    where,
    order: [[sb, sd]],
    offset: (p - 1) * ps,
    limit: ps,
    transaction: opts.transaction,
  });

  return {
    data: rows.map((r) => r.get({ plain: true })),
    page: p,
    pageSize: ps,
    total: count,
    totalPages: Math.ceil(count / ps),
  };
}

export async function updateTenant(id, updates = {}, opts = {}) {
  const row = await SaasTenant.findByPk(id, { transaction: opts.transaction });
  if (!row) return null;

  if (typeof updates.schema_name === 'string' && !opts.allowSchemaRename) {
    const e = new Error(
      'schema_name changes are blocked by default. Pass allowSchemaRename: true to allow.'
    );
    e.code = 'SCHEMA_RENAME_BLOCKED';
    throw e;
  }

  try {
    row.set(updates);
    await row.save({ transaction: opts.transaction });
    return row.get({ plain: true });
  } catch (err) {
    throw normalizeUnique(err);
  }
}

export async function deleteTenant(id, opts = {}) {
  const n = await SaasTenant.destroy({
    where: { id },
    transaction: opts.transaction,
  });
  return n > 0;
}

/* ----------------------------------------------------------------------------
 * Users
 * --------------------------------------------------------------------------*/
const USER_SORTABLE = new Set(['email', 'role', 'created_at', 'updated_at']);

/**
 * NOTE: `password` must be ALREADY HASHED before calling.
 */
export async function createUser({ email, password, role, tenant_id }, opts = {}) {
  try {
    const normalizedEmail = String(email).toLowerCase().trim();

    const row = await SaasUser.create(
      {
        email: normalizedEmail,
        password, // already hashed
        role: role?.trim(),
        tenant_id,
      },
      { transaction: opts.transaction }
    );

    // Optionally include tenant in return
    const withTenant = await SaasUser.findOne({
      where: { email: normalizedEmail },
      include: [
        { model: SaasTenant, as: 'tenant', attributes: ['id', 'name', 'schema_name', 'logo', "start_date"]},
      ],
      transaction: opts.transaction,
    });

    const out = withTenant ? withTenant.get({ plain: true }) : row.get({ plain: true });
    delete out.password;
    return out;
  } catch (err) {
    throw normalizeUnique(err);
  }
}

export async function getUserById(id, opts = {}) {
  const row = await SaasUser.findByPk(id, {
    attributes: { exclude: ['password'] },
    include: [{ model: SaasTenant, as: 'tenant' }],
    transaction: opts.transaction,
  });
  return row ? row.get({ plain: true }) : null;
}

/**
 * includePassword=false → omits hashed password field
 */
export async function getUserByEmail(email, { includePassword = true } = {}, opts = {}) {
  const normalizedEmail = String(email).toLowerCase().trim();

  const row = await SaasUser.findOne({
    where: { email: normalizedEmail },
    attributes: includePassword ? undefined : { exclude: ['password'] },
    include: [{ model: SaasTenant, as: 'tenant', attributes: ['id', 'name', 'schema_name', 'logo'] }],
    transaction: opts.transaction,
  });

  return row ? row.get({ plain: true }) : null;
}

export async function listUsers(
  { page = 1, pageSize = 20, tenant_id, search, sortBy, sortDir } = {},
  opts = {}
) {
  const p = Math.max(1, Number(page));
  const ps = Math.min(100, Math.max(1, Number(pageSize)));
  const [sb, sd] = sanitizeSort(USER_SORTABLE, sortBy, sortDir);

  const where = {};
  if (tenant_id) where.tenant_id = tenant_id;
  if (search) {
    where[Op.or] = [
      { email: { [Op.iLike]: `%${search}%` } },
      { role: { [Op.iLike]: `%${search}%` } },
    ];
  }

  const { rows, count } = await SaasUser.findAndCountAll({
    where,
    order: [[sb, sd]],
    offset: (p - 1) * ps,
    limit: ps,
    attributes: { exclude: ['password'] },
    transaction: opts.transaction,
  });

  return {
    data: rows.map((r) => r.get({ plain: true })),
    page: p,
    pageSize: ps,
    total: count,
    totalPages: Math.ceil(count / ps),
  };
}

export async function updateUser(id, { email, role }, opts = {}) {
  try {
    const row = await SaasUser.findByPk(id, { transaction: opts.transaction });
    if (!row) return null;

    row.set({
      ...(typeof email === 'string' ? { email: String(email).toLowerCase().trim() } : {}),
      ...(typeof role === 'string' ? { role: role.trim() } : {}),
    });

    await row.save({ transaction: opts.transaction });

    const out = row.get({ plain: true });
    delete out.password;
    return out;
  } catch (err) {
    throw normalizeUnique(err);
  }
}

/**
 * Accepts ALREADY HASHED password.
 */
export async function updateUserPassword(id, hashedPassword, opts = {}) {
  const row = await SaasUser.findByPk(id, { transaction: opts.transaction });
  if (!row) return false;
  row.set('password', hashedPassword);
  await row.save({ transaction: opts.transaction });
  return true;
}

export async function deleteUser(id, opts = {}) {
  const n = await SaasUser.destroy({
    where: { id },
    transaction: opts.transaction,
  });
  return n > 0;
}
