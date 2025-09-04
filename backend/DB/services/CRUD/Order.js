import { Sequelize } from 'sequelize';
import { FLOAT, Op, UniqueConstraintError } from 'sequelize';
import { sequelize } from '../../dbconfiguration.js';
import { normalizeUnique, sanitizeSort, opt, assertIdentifier, withTenant } from '../DBSeqFunction.js';
import { OrderBase } from '../../models/Order.js';
import { EmployeeBase } from '../../models/Employee.js';
import { ProductBase } from '../../models/Product.js';

const r2 = (n) => Number(Number(n || 0).toFixed(2));

function normalizeItems(items = []) {
  if (!Array.isArray(items) || items.length === 0) {
    throw new Error('items must be a non-empty array');
  }
  return items.map((it, idx) => {
    const quantity = Number(it.quantity);
    const unit_price = Number(it.amount);
    if (!it.product_name || !(quantity > 0) || !(unit_price >= 0)) {
      throw new Error(`Invalid item at index ${idx}: product_name, quantity>0, unit_price>=0 required`);
    }
    const line_total = r2(
      (Number.isFinite(it.line_total) ? Number(it.line_total) : quantity * unit_price)
    );
    return { ...it, quantity, unit_price: r2(unit_price), line_total };
  });
}

/** CREATE */
export async function createOrder(
  { orderNumber, items, profit, discount_amount, sold_by_id, status, total_paid},
  ctx = {}
) {
 
  const cleanItems = normalizeItems(items);
  const row = await OrderBase.create(
    {
      orderNumber,
      items: cleanItems,     // JSONB snapshot
      profit,
      discount_amount,
      sold_by_id,
      status,
      total_paid
    },
    opt(ctx)
  );
  return row.get({ plain: true });
}

/** READ by id */
export async function getOrderById(id, ctx = {}) {
  const row = await OrderBase.findByPk(id, opt(ctx));
  return row ? row.get({ plain: true }) : null;
}

/** READ by orderNumber */
export async function getOrderByNumber(orderNumber, ctx = {}) {
  const row = await OrderBase.findOne({ where: { orderNumber }, ...opt(ctx) });
  return row ? row.get({ plain: true }) : null;
}

/** UPDATE (partial) */
export async function updateOrder(id, patch = {}, ctx = {}) {
  const allowed = [
    'items', 'profit', 'discount_type', 'total_discount', 'status', 'date', 'refunded_amount'
  ];
  const data = {};
  for (const k of allowed) if (k in patch) data[k] = patch[k];

  if ('items' in data) data.items = normalizeItems(data.items);
  if ('profit' in data) data.profit = Number(data.profit) || 0;
  if ('total_discount' in data && data.total_discount != null) {
    data.total_discount = Number(data.total_discount);
  }

  const [n] = await OrderBase.update(data, { where: { id }, ...opt(ctx) });
  if (n === 0) return null;
  const row = await OrderBase.findByPk(id, opt(ctx));
  return row ? row.get({ plain: true }) : null;
}

/** DELETE (hard delete) */
export async function deleteOrder(id, ctx = {}) {
  const n = await OrderBase.destroy({ where: { id }, ...opt(ctx) });
  return n > 0;
}

function toStartUTC(yyyyMmDd) {
  return new Date(`${yyyyMmDd}T00:00:00.000Z`);
}
function toNextDayUTC(yyyyMmDd) {
  const d = new Date(`${yyyyMmDd}T00:00:00.000Z`);
  d.setUTCDate(d.getUTCDate() + 1);
  return d;
}

// export const listOrdersByTimestamp = async ({ from, to, sold_by_id}, ctx = {}) => {
//   const where = {};
//   if (from && to) {
//     where.added_date = { [Op.gte]: toStartUTC(from), [Op.lt]: toNextDayUTC(to) };
//   } else if (from) {
//     where.added_date = { [Op.gte]: toStartUTC(from) };
//   } else if (to) {
//     where.added_date = { [Op.lt]: toNextDayUTC(to) };
//   }
//   where.sold_by_id=sold_by_id

//   return OrderBase.findAll({
//     where,
//     order: [['added_date', 'DESC']],
//     ...opt(ctx),
//   });
// };

// import { Op } from 'sequelize';

export const listOrdersByTimestamp = async (
  { from, to, sold_by_id } = {},
  ctx = {}
) => {
  const where = {};

  // date window (inclusive from, exclusive next-day to)
  if (from && to) {
    where.added_date = { [Op.gte]: toStartUTC(from), [Op.lt]: toNextDayUTC(to) };
  } else if (from) {
    where.added_date = { [Op.gte]: toStartUTC(from) };
  } else if (to) {
    where.added_date = { [Op.lt]: toNextDayUTC(to) };
  }

  // OPTIONAL sold_by_id filter
  if (Array.isArray(sold_by_id) && sold_by_id.length > 0) {
    where.sold_by_id = { [Op.in]: sold_by_id };
  } else if (sold_by_id === null) {
    // explicitly request orders with no seller
    where.sold_by_id = { [Op.is]: null };
  } else if (sold_by_id !== undefined && sold_by_id !== '') {
    // single seller id (string/uuid/number)
    where.sold_by_id = sold_by_id;
  }
  // else: omit filter entirely

  /* return  await OrderBase.findAll({
  attributes: [
    'id','orderNumber','items','profit','discount_amount',
    'refunded_amount','total_paid','sold_by_id','status',
    'added_date','updated_at'
  ],
  include: [{
    model: EmployeeBase,
    as: 'employeeee',                 // ⬅️ must match the association alias
    attributes: ['id','first_name','last_name','email'],
    required: false                   // LEFT JOIN (keep orders even if no employee)
  }],
  order: [['added_date','DESC']],
  ...opt(ctx),
}); */

  return OrderBase.findAll({
    where,
    include:  [
      { model: EmployeeBase, as: 'employeeee' },
      { model: ProductBase, as: 'product' },
    ], 
    order: [['added_date', 'DESC']],
    
    ...opt(ctx),
  }); 
};


/** Return ALL orders (no pagination). */
export async function listOrders(ctx = {}) {
  const rows = await OrderBase.findAll({
    order: [['added_date', 'DESC']],
    ...opt(ctx),
  });
  return rows.map(r => r.get({ plain: true }));
}