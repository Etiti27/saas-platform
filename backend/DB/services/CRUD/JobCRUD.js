import { Op} from 'sequelize';

import { sanitizeSort, opt} from '../DBSeqFunction.js';
import { JobBase} from "../../models/Job.js";

const JOB_SORTABLE = new Set(['id', 'position', 'department']);

export async function createJob({ position, department }, ctx = {}) {
  if (!position || !department) {
    const e = new Error('position and department are required');
    e.code = 'VALIDATION_ERROR';
    throw e;
  }
  const row = await JobBase.create({ position: position.trim(), department: department.trim() }, opt(ctx));
  return row.get({ plain: true });
}

export async function getJobById(id, ctx = {}) {
  const row = await JobBase.findByPk(id, opt(ctx));
  return row ? row.get({ plain: true }) : null;
}

export async function listJobs({ page = 1, pageSize = 20, search, department, position, sortBy = 'id', sortDir = 'ASC' } = {}, ctx = {}) {
  const p = Math.max(1, Number(page));
  const ps = Math.min(100, Math.max(1, Number(pageSize)));
  const [sb, sd] = sanitizeSort({allowed:JOB_SORTABLE, by:sortBy, dir: sortDir});

  const where = {};
  if (department) where.department = { [Op.iLike]: `%${String(department).trim()}%` };
  if (position)   where.position   = { [Op.iLike]: `%${String(position).trim()}%` };
  if (search)     where[Op.or]     = [
    { position:   { [Op.iLike]: `%${String(search).trim()}%` } },
    { department: { [Op.iLike]: `%${String(search).trim()}%` } },
  ];

  const { rows, count } = await JobBase.findAndCountAll({
    where,
    order: [[sb, sd]],
    offset: (p - 1) * ps,
    limit: ps,
    ...opt(ctx),
  });
  return { data: rows.map(r => r.get({ plain: true })), page: p, pageSize: ps, total: count, totalPages: Math.ceil(count / ps) };
}

export async function updateJob(id, updates = {}, ctx = {}) {
  const row = await JobBase.findByPk(id, opt(ctx));
  if (!row) return null;
  row.set({
    ...(updates.position   != null ? { position: String(updates.position).trim() } : {}),
    ...(updates.department != null ? { department: String(updates.department).trim() } : {}),
  });
  await row.save(opt(ctx));
  return row.get({ plain: true });
}

export async function deleteJob(id, ctx = {}) {
  try {
    const n = await JobBase.destroy({ where: { id }, ...opt(ctx) });
    return n > 0;
  } catch (err) {
    // FK protection if DB constraints exist (employees.job_id references jobs.id)
    if (err?.original?.code === '23503') {
      const e = new Error('Cannot delete job: it is referenced by employee(s).');
      e.code = 'FK_VIOLATION';
      throw e;
    }
    throw err;
  }
}
