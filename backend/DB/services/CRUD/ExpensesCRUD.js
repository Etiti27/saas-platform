// services/expense.service.js
import { Op,fn, col } from 'sequelize';
import { sequelize } from '../../dbconfiguration.js';
import { ExpenseBase } from '../../models/Expenses.js'


/* ----------------------------- helpers ----------------------------- */
function opt(ctx) {
  return ctx && (ctx.transaction || ctx.searchPath)
    ? { transaction: ctx.transaction, searchPath: ctx.searchPath }
    : {};
}
function sanitizeSort(allowed, by = 'date', dir = 'DESC') {
  const sortBy = allowed.has(by) ? by : Array.from(allowed)[0];
  const sortDir = String(dir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
  return [sortBy, sortDir];
}
const FIELDS = [
  'date','vendor_name','category','description','amount',
  'tax_mode','tax_rate','total_net','total_tax','total_gross',
  'currency','method','reference','cost_center','notes'
];
function pickExpenseFields(payload = {}) {
  const out = {};
  for (const k of FIELDS) if (payload[k] !== undefined) out[k] = payload[k];
  if (out.amount      != null) out.amount      = Number(out.amount);
  if (out.tax_rate    != null) out.tax_rate    = Number(out.tax_rate);
  if (out.total_net   != null) out.total_net   = Number(out.total_net);
  if (out.total_tax   != null) out.total_tax   = Number(out.total_tax);
  if (out.total_gross != null) out.total_gross = Number(out.total_gross);
  return out;
}

/* ------------------------------ CREATE ----------------------------- */
export async function createExpense(payload, ctx = {}) {
  const data = pickExpenseFields(payload);
  const row = await ExpenseBase.create(data, opt(ctx));
  return row.get({ plain: true });
}

/* ------------------------------- READ ------------------------------ */
export async function getExpenseById(id, ctx = {}) {
  const row = await ExpenseBase.findByPk(id, opt(ctx));
  return row ? row.get({ plain: true }) : null;
}

export async function listExpenses(
  {
    page = 1,
    pageSize = 20,
    from,         // YYYY-MM-DD (inclusive)
    to,           // YYYY-MM-DD (inclusive)
    category,     // exact
    method,       // exact
    q,            // fuzzy vendor/desc/ref/cost_center
    sortBy = 'date',
    sortDir = 'DESC',
  } = {},
  ctx = {}
) {
  const p = Math.max(1, Number(page) || 1);
  const ps = Math.min(100, Math.max(1, Number(pageSize) || 20));
  const where = {};

  if (from || to) {
    where.date = {};
    if (from) where.date[Op.gte] = from;
    if (to)   where.date[Op.lte] = to;
  }
  if (category) where.category = category;
  if (method)   where.method   = method;

  if (q?.trim()) {
    const s = `%${q.trim()}%`;
    where[Op.or] = [
      { vendor_name: { [Op.iLike]: s } },
      { description: { [Op.iLike]: s } },
      { reference:   { [Op.iLike]: s } },
      { cost_center: { [Op.iLike]: s } },
      { category:    { [Op.iLike]: s } },
    ];
  }

  const sortable = new Set(['date','created_at','updated_at','amount','total_gross','vendor_name','category','method']);
  const [sb, sd] = sanitizeSort(sortable, sortBy, sortDir);

  const { rows, count } = await ExpenseBase.findAndCountAll({
    where,
    order: [[sb, sd]],
    limit: ps,
    offset: (p - 1) * ps,
    ...opt(ctx),
  });

  return {
    rows: rows.map(r => r.get({ plain: true })),
    page: p,
    pageSize: ps,
    total: count,
    totalPages: Math.ceil(count / ps) || 1,
  };
}

/* ------------------------------ UPDATE ----------------------------- */
export async function updateExpense(id, patch = {}, ctx = {}) {
  const data = pickExpenseFields(patch);
  const [n] = await ExpenseBase.update(data, { where: { id }, ...opt(ctx) });
  if (n === 0) return null;
  const row = await ExpenseBase.findByPk(id, opt(ctx));
  return row ? row.get({ plain: true }) : null;
}

/* ------------------------------ DELETE ----------------------------- */
export async function deleteExpense(id, ctx = {}) {
  const n = await ExpenseBase.destroy({ where: { id }, ...opt(ctx) });
  return n > 0;
}

/* ------------------------------ STATS (optional) ------------------- */
export async function summarizeExpenses({ from, to, category, method } = {}, ctx = {}) {
  const { fn, col } = (await import('sequelize')).default;
  const where = {};
  if (from || to) {
    where.date = {};
    if (from) where.date[Op.gte] = from;
    if (to)   where.date[Op.lte] = to;
  }
  if (category) where.category = category;
  if (method)   where.method   = method;

  const rows = await ExpenseBase.findAll({
    where,
    attributes: [
      [fn('COUNT', col('id')), 'count'],
      [fn('COALESCE', fn('SUM', col('total_net')),   0), 'sum_net'],
      [fn('COALESCE', fn('SUM', col('total_tax')),   0), 'sum_tax'],
      [fn('COALESCE', fn('SUM', col('total_gross')), 0), 'sum_gross'],
    ],
    ...opt(ctx),
    raw: true,
  });
  return rows?.[0] || { count: 0, sum_net: 0, sum_tax: 0, sum_gross: 0 };
}






// services/expenses.js

// If you already have these helpers, re-use them. Otherwise:
const toStartUTC = (d) => {
  // accepts 'YYYY-MM-DD' or Date
  const dt = (typeof d === 'string') ? new Date(`${d}T00:00:00.000Z`) : d;
  return new Date(Date.UTC(dt.getUTCFullYear(), dt.getUTCMonth(), dt.getUTCDate(), 0, 0, 0));
};
const toNextDayUTC = (d) => {
  const start = toStartUTC(d);
  return new Date(start.getTime() + 24 * 60 * 60 * 1000);
};

/**
 * List expenses by timestamp window + optional filters.
 *
 * @param {Object} params
 * @param {string|Date} [params.from]       inclusive (UTC start of day)
 * @param {string|Date} [params.to]         exclusive (UTC next day)
 * @param {string|string[]} [params.category]
 * @param {string} [params.vendor_name]
 * @param {string} [params.method]          e.g. 'Card' | 'Cash' | 'Online' | 'Bank Transfer'
 * @param {number} [params.min_amount]
 * @param {number} [params.max_amount]
 * @param {string} [params.cost_center]
 * @param {string} [params.currency]
 * @param {number} [params.limit=100]
 * @param {number} [params.offset=0]
 * @param {('date'|'created_at'|'amount'|'total_gross')} [params.orderBy='date']
 * @param {('ASC'|'DESC')} [params.orderDir='ASC']
 *
 * @param {Object} ctx
 * @param {import('sequelize').Transaction} [ctx.tx] optional transaction
 * @param {Object} [ctx.models] optional tenant-bound models { Expense }
 *
 * @returns {Promise<{ rows: any[], count: number, aggregates: {count:number, sum_amount:number, sum_net:number, sum_tax:number, sum_gross:number} }>}
 */


export async function listExpensesByTimestamp(
  {
    from,          // 'YYYY-MM-DD'
    to,            // 'YYYY-MM-DD'
    category,      // string or string[]
    method,        // string or string[]
    cost_center,   // string
    currency,      // string or string[]
    min_amount,    // number
    max_amount,    // number
    q,             // free text: vendor_name/description/reference
  } = {},
  ctx = {}
) {
  const where = {};

  // date window
  if (from && to)       where.date = { [Op.between]: [from, to] };
  else if (from)        where.date = { [Op.gte]: from };
  else if (to)          where.date = { [Op.lte]: to };

  // category (single/array)
  if (Array.isArray(category) && category.length) where.category = { [Op.in]: category };
  else if (category)                               where.category = category;

  // method (single/array)
  if (Array.isArray(method) && method.length) where.method = { [Op.in]: method };
  else if (method)                             where.method = method;

  // cost center
  if (cost_center) where.cost_center = cost_center;

  // currency (single/array)
  if (Array.isArray(currency) && currency.length) where.currency = { [Op.in]: currency };
  else if (currency)                               where.currency = currency;

  // amount range
  if (min_amount != null || max_amount != null) {
    where.amount = {};
    if (min_amount != null) where.amount[Op.gte] = Number(min_amount);
    if (max_amount != null) where.amount[Op.lte] = Number(max_amount);
  }

  // free-text query (optional)
  if (q && q.trim()) {
    const like = `%${q.trim()}%`;
    where[Op.or] = [
      { vendor_name: { [Op.iLike]: like } },
      { description: { [Op.iLike]: like } },
      { reference:   { [Op.iLike]: like } },
    ];
  }

  return ExpenseBase.findAll({
    where,
    attributes: [
      'id','date','vendor_name','category','description','amount',
      'tax_mode','tax_rate','total_net','total_tax','total_gross',
      'currency','method','reference','cost_center','notes',
      'created_at','updated_at',
    ],
    order: [['date','DESC'], ['created_at','DESC']],
    ...opt(ctx),
  });
}
