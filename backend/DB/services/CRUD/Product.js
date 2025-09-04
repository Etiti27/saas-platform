import { Sequelize } from 'sequelize';
import { FLOAT, Op, UniqueConstraintError } from 'sequelize';
import { sequelize } from '../../dbconfiguration.js';
import { normalizeUnique, sanitizeSort, opt, assertIdentifier, withTenant } from '../DBSeqFunction.js';
import { ProductBase } from '../../models/Product.js';
import { EmployeeBase } from '../../models/Employee.js';

const FIELDS = [
    'product_name',
    'threshold',
    'location',
    'quantity',
    'cost_price',
    'sale_price',
    'expiring_date',
    'uploaded_by_id',
  ];
  
  function pickProductFields(payload = {}) {
    const out = {};
    for (const k of FIELDS) {
      if (payload[k] !== undefined) out[k] = payload[k];
    }
    // light coercion for numeric/date-ish inputs (keeps null if passed)
    if (out.threshold !== undefined && out.threshold !== null) out.threshold = Number(out.threshold);
    if (out.quantity !== undefined && out.quantity !== null) out.quantity = Number(out.quantity);
    if (out.cost_price !== undefined && out.cost_price !== null) out.cost_price = Number(out.cost_price);
    if (out.sale_price !== undefined && out.sale_price !== null) out.sale_price = Number(out.sale_price);
    // expiring_date should be 'YYYY-MM-DD' for DATEONLY; trust caller value
    return out;
  }
  
  const defaultIncludes = [
    { model: EmployeeBase, as: 'employe' },
  ];
  
  /* ────────────────────────────────────────────────────────────────────────── */
  /* CREATE                                                                    */
  /* ────────────────────────────────────────────────────────────────────────── */
  /** Create a product */
  export async function createProduct({product_name, threshold, location, quantity,cost_price, sale_price, expiring_date,uploaded_by_id }, ctx = {}) {
    // const data = pickProductFields(payload);
    const row = await ProductBase.create({product_name, threshold,location, quantity, cost_price, sale_price, expiring_date, uploaded_by_id }, opt(ctx));
    // Return with associations
    const full = await ProductBase.findByPk(row.id, {
      include: defaultIncludes,
      ...opt(ctx),
    });
    return full?.get({ plain: true });
  }
  
  /* ────────────────────────────────────────────────────────────────────────── */
  /* READ                                                                      */
  /* ────────────────────────────────────────────────────────────────────────── */
  /** Get a single product by id */
  export async function getProductById(id, ctx = {}) {
    if (!id) return null;
    const row = await ProductBase.findByPk(id, {
      include: defaultIncludes,
      ...opt(ctx),
    });
    return row ? row.get({ plain: true }) : null;
  }
  
  /** List products with optional search/filters/pagination */
  export async function listProducts(
    {
      q,                 // text search: product_name or location
      lowStockOnly,      // boolean: quantity <= threshold
      page = 1,
      pageSize = 20,
      sort = 'added_date',
      dir = 'DESC',
  
      // NEW:
      all = false,                  // return all rows (no limit/offset)
      dateField,                    // 'added_date' | 'updated_at' | 'expiring_date'
      dateFrom,                     // ISO string 'YYYY-MM-DD' (or full timestamp)
      dateTo,                       // ISO string 'YYYY-MM-DD' (or full timestamp)
      expiringOn,                   // exact match for DATEONLY, e.g. '2025-09-01'
    } = {},
    ctx = {}
  ) {
    const whereClause = {};
    const and = [];
  
    // text search
    if (q?.trim()) {
      const s = `%${q.trim()}%`;
      whereClause[Op.or] = [
        { product_name: { [Op.iLike]: s } },
        { location: { [Op.iLike]: s } },
      ];
    }
  
    // low stock
    if (lowStockOnly) {
      and.push(
        where(col('quantity'), Op.lte, col('threshold')),
        { threshold: { [Op.ne]: null } },
      );
    }
  
    // NEW: date filtering
    const allowedDateFields = new Set(['added_date', 'updated_at', 'expiring_date']);
    if (expiringOn) {
      // exact match for DATEONLY column
      and.push({ expiring_date: expiringOn });
    } else if (dateField && allowedDateFields.has(dateField) && (dateFrom || dateTo)) {
      const range = {};
      if (dateFrom) range[Op.gte] = dateFrom; // inclusive start
      if (dateTo)   range[Op.lte] = dateTo;   // inclusive end (pass 'YYYY-MM-DD 23:59:59' for timestamps if needed)
      and.push({ [dateField]: range });
    }
  
    if (and.length) {
      whereClause[Op.and] = [...(whereClause[Op.and] || []), ...and];
    }
  
    // sorting whitelist
    const sortable = new Set([
      'added_date', 'updated_at',
      'product_name', 'quantity', 'threshold',
      'cost_price', 'sale_price', 'expiring_date', 'location',
    ]);
    const order = sortable.has(sort)
      ? [[sort, String(dir).toUpperCase() === 'ASC' ? 'ASC' : 'DESC']]
      : [['added_date', 'DESC']];
  
    // pagination (or all)
    const limit = all ? undefined : Math.max(1, Math.min(200, Number(pageSize) || 20));
    const offset = all ? undefined : Math.max(0, (Number(page) - 1) * (limit || 0));
  
    const { rows, count } = await ProductBase.findAndCountAll({
      where: whereClause,
      include: defaultIncludes,
      order,
      ...(all ? {} : { limit, offset }),
      distinct: true, // safer when includes might create duplicates
      ...opt(ctx),
    });
  
    return {
      rows: rows.map(r => r.get({ plain: true })),
      count,
      page: all ? 1 : Number(page),
      pageSize: all ? rows.length : (limit || 0),
      totalPages: all ? 1 : Math.ceil(count / (limit || 1)) || 1,
    };
  }
  
  /* ────────────────────────────────────────────────────────────────────────── */
  /* UPDATE                                                                    */
  /* ────────────────────────────────────────────────────────────────────────── */
  /** Patch/update a product by id */
  export async function updateProduct(id, patch, ctx = {}) {
    if (!id) return null;
    const data = pickProductFields(patch);
    await ProductBase.update(data, { where: { id }, ...opt(ctx) });
    const row = await ProductBase.findByPk(id, { include: defaultIncludes, ...opt(ctx) });
    return row ? row.get({ plain: true }) : null;
  }
  
  /* ────────────────────────────────────────────────────────────────────────── */
  /* DELETE                                                                    */
  /* ────────────────────────────────────────────────────────────────────────── */
  /** Hard-delete a product */
  export async function deleteProduct(id, ctx = {}) {
    if (!id) return { deleted: 0 };
    const deleted = await ProductBase.destroy({ where: { id }, ...opt(ctx) });
    return { deleted };
  }
  
  /* ────────────────────────────────────────────────────────────────────────── */
  /* UTIL: stock adjustments (optional helpers)                                */
  /* ────────────────────────────────────────────────────────────────────────── */
  /** Decrease quantity by N (e.g., on sale) */
  export async function decrementStock(id, by = 1, ctx = {}) {
    if (!id || !Number.isFinite(by) || by <= 0) return null;
    const row = await ProductBase.findByPk(id, opt(ctx));
    if (!row) return null;
    row.quantity = Math.max(0, Number(row.quantity || 0) - by);
    await row.save(opt(ctx));
    // return with associations
    const full = await ProductBase.findByPk(id, { include: defaultIncludes, ...opt(ctx) });
    return full?.get({ plain: true });
  }
  
  /** Increase quantity by N (e.g., restock) */
  export async function incrementStock(id, by = 1, ctx = {}) {
    if (!id || !Number.isFinite(by) || by <= 0) return null;
    const row = await ProductBase.findByPk(id, opt(ctx));
    if (!row) return null;
    row.quantity = Number(row.quantity || 0) + by;
    await row.save(opt(ctx));
    const full = await ProductBase.findByPk(id, { include: defaultIncludes, ...opt(ctx) });
    return full?.get({ plain: true });
  }