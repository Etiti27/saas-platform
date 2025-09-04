import { Sequelize } from 'sequelize';
import { FLOAT, Op, UniqueConstraintError } from 'sequelize';
import { sequelize } from '../../dbconfiguration.js';
import { normalizeUnique, sanitizeSort, opt, assertIdentifier, withTenant } from '../DBSeqFunction.js';
import {PayrollBase} from "../../models/Payroll.js";

const PAYROLL_SORTABLE = new Set(['id', 'bank_name', 'account_name']);

export async function createPayroll({tax_no, tax_form, contract_form, bank_account, bank_name, account_name}, ctx = {}) {
  const required = ['bank_account', 'bank_name', 'account_name'];
  /* for (const f of required) {
    if (!data[f]) { const e = new Error(`${f} is required`); e.code = 'VALIDATION_ERROR'; e.field = f; throw e; }
  } */
  const row = await PayrollBase.create({
    tax_no:        tax_no ?? null,
    tax_form:      tax_form ?? null,
    contract_form: contract_form ?? null,
    bank_account:  String(bank_account).trim(),
    bank_name:     String(bank_name).trim(),
    account_name:  String(account_name).trim(),
  }, opt(ctx));
  return row.get({ plain: true });
}

export async function getPayrollById(id, ctx = {}) {
  const row = await PayrollBase.findByPk(id, opt(ctx));
  return row ? row.get({ plain: true }) : null;
}

export async function listPayrolls({ page = 1, pageSize = 20, search, bank_name, account_name, sortBy = 'id', sortDir = 'ASC' } = {}, ctx = {}) {
  const p = Math.max(1, Number(page));
  const ps = Math.min(100, Math.max(1, Number(pageSize)));
  const [sb, sd] = sanitizeSort(PAYROLL_SORTABLE, sortBy, sortDir);

  const where = {};
  if (bank_name)    where.bank_name    = { [Op.iLike]: `%${String(bank_name).trim()}%` };
  if (account_name) where.account_name = { [Op.iLike]: `%${String(account_name).trim()}%` };
  if (search)       where[Op.or]       = [
    { bank_name:    { [Op.iLike]: `%${String(search).trim()}%` } },
    { account_name: { [Op.iLike]: `%${String(search).trim()}%` } },
    { bank_account: { [Op.iLike]: `%${String(search).trim()}%` } },
  ];

  const { rows, count } = await PayrollBase.findAndCountAll({
    where,
    order: [[sb, sd]],
    offset: (p - 1) * ps,
    limit: ps,
    ...opt(ctx),
  });
  return { data: rows.map(r => r.get({ plain: true })), page: p, pageSize: ps, total: count, totalPages: Math.ceil(count / ps) };
}

export async function updatePayroll(id, updates = {}, ctx = {}) {
  const row = await PayrollBase.findByPk(id, opt(ctx));
  if (!row) return null;
  row.set({
    ...(updates.tax_no        !== undefined ? { tax_no: updates.tax_no } : {}),
    ...(updates.tax_form      !== undefined ? { tax_form: updates.tax_form } : {}),
    ...(updates.contract_form !== undefined ? { contract_form: updates.contract_form } : {}),
    ...(updates.bank_account  !== undefined ? { bank_account: String(updates.bank_account).trim() } : {}),
    ...(updates.bank_name     !== undefined ? { bank_name: String(updates.bank_name).trim() } : {}),
    ...(updates.account_name  !== undefined ? { account_name: String(updates.account_name).trim() } : {}),
  });
  await row.save(opt(ctx));
  return row.get({ plain: true });
}

export async function deletePayroll(id, ctx = {}) {
  try {
    const n = await PayrollBase.destroy({ where: { id }, ...opt(ctx) });
    return n > 0;
  } catch (err) {
    if (err?.original?.code === '23503') {
      const e = new Error('Cannot delete payroll: it is referenced by an employee.');
      e.code = 'FK_VIOLATION';
      throw e;
    }
    throw err;
  }
}