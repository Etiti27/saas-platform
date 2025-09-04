// services/userPref.service.js
import { sequelize } from '../dbconfiguration.js';
import { UserPref } from '../models/Settings.js'; // model defines table 'user_prefs'

// ───────────────────────── helpers ─────────────────────────
function opt(ctx) {
  return ctx && (ctx.transaction || ctx.searchPath)
    ? { transaction: ctx.transaction, searchPath: ctx.searchPath }
    : {};
}

// e.g. ['sections','lowStock'] -> {"sections","lowStock"}
function toTextArrayLiteral(path) {
  if (!Array.isArray(path) || path.length === 0) {
    throw new Error('path must be a non-empty array');
  }
  const esc = (s) => String(s).replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  return `{${path.map((p) => `"${esc(p)}"`).join(',')}}`;
}

// quote an identifier (schema)
function qIdent(id) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(String(id))) {
    throw new Error('Invalid schema identifier');
  }
  return `"${id}"`;
}

// ───────────────────────── CRUD ─────────────────────────

/** Create (idempotent) */
export async function createUserPref({ user_id, initial = {} }, ctx = {}) {
  const [row] = await UserPref.findOrCreate({
    where: { user_id },
    defaults: { user_id, value: initial, version: 1 },
    ...opt(ctx),
  });
  return row.get({ plain: true });
}

/** Read */
export async function getUserPref({ user_id }, ctx = {}) {
  const row = await UserPref.findByPk(user_id, { ...opt(ctx) });
  return row ? row.get({ plain: true }) : null;
}

/** Replace whole document (optimistic locking) */
export async function replaceUserPref({ user_id, nextValue }, ctx = {}) {
  const useExistingTx = !!ctx.transaction;
  const runner = async (t) => {
    const current = await UserPref.findByPk(user_id, { transaction: t, lock: t?.LOCK?.UPDATE });
    if (!current) {
      const created = await UserPref.create({ user_id, value: nextValue, version: 1 }, { transaction: t });
      return { row: created.get({ plain: true }), conflict: false, created: true };
    }
    const where = { user_id, version: current.version };
    const [affected] = await UserPref.update(
      { value: nextValue, version: current.version + 1 },
      { where, returning: false, transaction: t }
    );
    if (affected === 0) {
      return { row: current.get({ plain: true }), conflict: true, created: false };
    }
    const updated = await UserPref.findByPk(user_id, { transaction: t });
    return { row: updated.get({ plain: true }), conflict: false, created: false };
  };

  if (useExistingTx) return runner(ctx.transaction);
  return sequelize.transaction(runner);
}

/** Update (shallow merge, optimistic) */
export async function mergeUserPref({ user_id, partial }, ctx = {}) {
  const useExistingTx = !!ctx.transaction;
  const runner = async (t) => {
    const current = await UserPref.findByPk(user_id, { transaction: t, lock: t?.LOCK?.UPDATE });
    if (!current) {
      const created = await UserPref.create({ user_id, value: partial, version: 1 }, { transaction: t });
      return { row: created.get({ plain: true }), conflict: false, created: true };
    }
    const nextValue = { ...(current.value || {}), ...(partial || {}) };
    const where = { user_id, version: current.version };
    const [affected] = await UserPref.update(
      { value: nextValue, version: current.version + 1 },
      { where, returning: false, transaction: t }
    );
    if (affected === 0) {
      return { row: current.get({ plain: true }), conflict: true, created: false };
    }
    const updated = await UserPref.findByPk(user_id, { transaction: t });
    return { row: updated.get({ plain: true }), conflict: false, created: false };
  };

  if (useExistingTx) return runner(ctx.transaction);
  return sequelize.transaction(runner);
}

/**
 * Patch a nested JSON path using jsonb_set (no read-modify-write).
 * Creates missing keys (4th arg = true).
 *
 * @param {string}   user_id
 * @param {string[]} path       e.g. ['sections','lowStock']
 * @param {*}        value      any JSON-serializable value
 */
export async function patchUserPrefPath({ user_id, path, value }, ctx = {}) {
  const pathLiteral = toTextArrayLiteral(path);
  // schema-qualified table when ctx.searchPath is provided
  const table = ctx.searchPath ? `${qIdent(ctx.searchPath)}."user_prefs"` : `"user_prefs"`;

  const sql = `
    UPDATE ${table}
    SET value   = jsonb_set(value, :path::text[], :val::jsonb, true),
        version = version + 1
    WHERE user_id = :user_id
    RETURNING *;
  `;

  const [rows] = await sequelize.query(sql, {
    replacements: { path: pathLiteral, val: JSON.stringify(value), user_id },
    transaction: ctx.transaction, // keep tenant transaction if any
  });

  const row = rows?.[0];
  return row || null; // null if not found
}

/** Delete */
export async function deleteUserPref({ user_id }, ctx = {}) {
  const n = await UserPref.destroy({ where: { user_id }, ...opt(ctx) });
  return n > 0;
}

/** List (with pagination) */
export async function listUserPrefs({ limit = 50, offset = 0 } = {}, ctx = {}) {
  const rows = await UserPref.findAll({
    limit: Math.min(200, Math.max(1, Number(limit) || 50)),
    offset: Math.max(0, Number(offset) || 0),
    order: [['user_id', 'ASC']],
    ...opt(ctx),
  });
  return rows.map(r => r.get({ plain: true }));
}
