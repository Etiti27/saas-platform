// services/refund.service.js
import { Op } from 'sequelize';

import { RefundBase } from '../../models/Refund.js';
import { EmployeeBase } from '../../models/Employee.js';
import { OrderBase } from '../../models/Order.js';

function opt(ctx) {
  return ctx && (ctx.transaction || ctx.searchPath)
    ? { transaction: ctx.transaction, searchPath: ctx.searchPath }
    : {};
}

const defaultIncludes = [
  { model: EmployeeBase, as: 'employee', attributes: ['id', 'first_name', 'last_name', 'email'] },
  { model: OrderBase,    as: 'order',    attributes: ['id', 'orderNumber', 'status', 'total_paid', 'added_date'] },
];

const ALLOWED = [
  'refund_id', 'order_id', 'approved_by', 'Reason', 'Payment_method', 'Receipt', 'note'
];

// Map “friendly” body keys to model’s actual attribute names
function normalizeRefundPayload(payload = {}) {
  const src = { ...payload };

  // accept camel/snake from client, map to model fields
  if (src.reason        != null && src.Reason == null)          src.Reason = src.reason;
  if (src.payment_method!= null && src.Payment_method == null)  src.Payment_method = src.payment_method;
  if (src.receipt       != null && src.Receipt == null)         src.Receipt = src.receipt;

  const out = {};
  for (const k of ALLOWED) if (src[k] !== undefined) out[k] = src[k];
  return out;
}

/** CREATE */
export async function createRefund(payload, ctx = {}) {
  const data = normalizeRefundPayload(payload);
  // minimal checks
  if (!data.refund_id)  throw new Error('refund_id is required');
  if (!data.order_id)   throw new Error('order_id is required');
  if (!data.approved_by) throw new Error('approved_by is required');

  const row = await RefundBase.create(data, opt(ctx));
  const full = await RefundBase.findByPk(row.id, { include: defaultIncludes, ...opt(ctx) });
  return full?.get({ plain: true });
}

/** READ (one) */
export async function getRefundById(id, ctx = {}) {
  const row = await RefundBase.findByPk(id, { include: defaultIncludes, ...opt(ctx) });
  return row ? row.get({ plain: true }) : null;
}

/** LIST (with filters + pagination) */
export async function listRefunds(params = {}, ctx = {}) {
  const {
    q,
    order_id,
    approved_by,
    dateFrom,
    dateTo,
    page = 1,
    pageSize = 20,
    sortBy = 'created_at',
    sortDir = 'DESC',
  } = params;

  const p  = Math.max(1, Number(page) || 1);
  const ps = Math.min(200, Math.max(1, Number(pageSize) || 20));
  const sortable = new Set(['created_at','updated_at','refund_id','order_id','approved_by']);

  const where = {};
  if (order_id)    where.order_id = order_id;
  if (approved_by) where.approved_by = approved_by;

  // Half-open time window: [dateFrom, nextDay(dateTo))
  if (dateFrom || dateTo) {
    const created = {};
    if (dateFrom) created[Op.gte] = new Date(dateFrom); // start of day in UTC
    if (dateTo) {
      const end = new Date(dateTo);
      end.setUTCDate(end.getUTCDate() + 1);  // move to next day
      end.setUTCHours(0, 0, 0, 0);           // 00:00:00.000
      created[Op.lt] = end;                  // strictly less than next day
    }
    where.created_at = created;
  }

  const include = [...defaultIncludes];

  // Free-text search: refund_id OR joined order.orderNumber
  if (q?.trim()) {
    const s = `%${q.trim()}%`;
    where[Op.or] = [{ refund_id: { [Op.iLike]: s } }];

    // Be defensive if defaultIncludes[1] doesn't exist
    const base = include[1] || {};
    include[1] = {
      ...base,
      where: { ...(base.where || {}), orderNumber: { [Op.iLike]: s } },
      required: false, // LEFT JOIN so non-matching orders don't exclude refunds
    };
  }

  const order = sortable.has(sortBy)
    ? [[sortBy, String(sortDir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC']]
    : [['created_at', 'DESC']];

  const { rows, count } = await RefundBase.findAndCountAll({
    where,
    include,
    order,
    offset: (p - 1) * ps,
    limit: ps,
    distinct: true,
    ...opt(ctx), // must inject { transaction: t } here
  });

  return {
    rows: rows.map(r => r.get({ plain: true })),
    count,
    page: p,
    pageSize: ps,
    totalPages: Math.max(1, Math.ceil(count / ps)),
  };
}


/** UPDATE (partial) */
export async function updateRefund(id, patch = {}, ctx = {}) {
  const data = normalizeRefundPayload(patch);
  const [n] = await RefundBase.update(data, { where: { id }, ...opt(ctx) });
  if (n === 0) return null;
  const row = await RefundBase.findByPk(id, { include: defaultIncludes, ...opt(ctx) });
  return row ? row.get({ plain: true }) : null;
}

/** DELETE (hard) */
export async function deleteRefund(id, ctx = {}) {
  const n = await RefundBase.destroy({ where: { id }, ...opt(ctx) });
  return n > 0;
}
