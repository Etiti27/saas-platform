import { Sequelize } from 'sequelize';
import { FLOAT, Op, UniqueConstraintError } from 'sequelize';
import { sequelize } from '../../dbconfiguration.js';
import { normalizeUnique, sanitizeSort, opt, } from '../DBSeqFunction.js';
import { EmployeeBase } from "../../models/Employee.js";
import { JobBase } from '../../models/Job.js';
import { PayrollBase } from '../../models/Payroll.js';

/* ------------------------------- Employees -------------------------------- */
const EMP_SORTABLE = new Set(['id', 'email', 'first_name', 'last_name', 'start_date', 'created_at']);






export async function createEmployee({last_name, first_name, email, phone_number,dob, start_date,id_card, job_id, payroll_id}, ctx = {}) {
  try {
    const row = await EmployeeBase.create({  first_name: String(first_name).trim(),
    last_name:    String(last_name).trim(), email: String(email).toLowerCase().trim(),
    phone_number: phone_number ?? null, dob: dob ?? null, start_date:   start_date, id_card: id_card ?? null,
    job_id: job_id, payroll_id:   payroll_id,
  }, ctx);
    return row.get({ plain: true });
  } catch (err) {
    // Sequelize class-based check
    if (err instanceof Sequelize.UniqueConstraintError) {
      const msg =
        err?.errors?.find(e => e.path === 'email')?.message ||
        'Email already exists';
      const e = new Error(msg);
      e.status = 409; // Conflict
      e.code = 'EMAIL_TAKEN';
      throw e;
    }

    // (Optional) PG specific check
    if (err?.original?.code === '23505') { // unique_violation
      const e = new Error('Email already exists');
      e.status = 409;
      e.code = 'EMAIL_TAKEN';
      throw e;
    }

    throw err; // something else
  }
}

// export async function createEmployee({last_name, first_name, email, phone_number,dob, start_date,id_card, job_id, payroll_id}, ctx = {}) {
  // Minimal validation
 /*  const required = ['first_name', 'last_name', 'email', 'start_date', 'job_id', 'payroll_id'];
  for (const f of required) { if (!data[f]) { const e = new Error(`${f} is required`); e.code = 'VALIDATION_ERROR'; e.field = f; throw e; } } */

  /* try {
    const row = await EmployeeBase.create({
      first_name:   String(first_name).trim(),
      last_name:    String(last_name).trim(),
      email:        String(email).toLowerCase().trim(),
      phone_number: phone_number ?? null,
      dob:          dob ?? null,
      start_date:   start_date,
      id_card:      id_card ?? null,
      job_id:       job_id,
      payroll_id:   payroll_id,
    }, { ...opt(ctx) });
    return row.get({ plain: true });
  } catch (err) {
    throw normalizeUnique(err);
  }
} */

export async function getEmployeeById(id, ctx = {}) {
  const row = await EmployeeBase.findByPk(id, {
    include: [
      { model: JobBase, as: 'job' },
      { model: PayrollBase, as: 'payroll' },
    ],
    ...opt(ctx),
  });
  return row ? row.get({ plain: true }) : null;
}

// Exact (case-sensitive) match
export async function getEmployeeByEmail(email, ctx = {}) {
  if (!email) return null;

  const row = await EmployeeBase.findOne({
    where: { email },
    include: [
      { model: JobBase, as: 'job' },
      { model: PayrollBase, as: 'payroll' },
    ],
    ...opt(ctx),
  });

  return row ? row.get({ plain: true }) : null;
}


export async function listEmployees({ page = 1, pageSize = 20, search, job_id, department, position, sortBy = 'created_at', sortDir = 'DESC' } = {}, ctx = {}) {
  const p = Math.max(1, Number(page));
  const ps = Math.min(100, Math.max(1, Number(pageSize)));
  const [sb, sd] = sanitizeSort(EMP_SORTABLE, sortBy, sortDir);

  const where = {};
  if (job_id) where.job_id = job_id;
  if (search) where[Op.or] = [
    { first_name: { [Op.iLike]: `%${String(search).trim()}%` } },
    { last_name:  { [Op.iLike]: `%${String(search).trim()}%` } },
    { email:      { [Op.iLike]: `%${String(search).trim()}%` } },
    { phone_number: { [Op.iLike]: `%${String(search).trim()}%` } },
  ];

  // Optional filtering via joined Job fields
  const jobInclude = { model: JobBase, as: 'job' };
  if (department || position) {
    jobInclude.where = {};
    if (department) jobInclude.where.department = { [Op.iLike]: `%${String(department).trim()}%` };
    if (position)   jobInclude.where.position   = { [Op.iLike]: `%${String(position).trim()}%` };
    jobInclude.required = true; // filter effect
  }

  const { rows, count } = await EmployeeBase.findAndCountAll({
    where,
    include: [ jobInclude, { model: PayrollBase, as: 'payroll' } ],
    order: [[sb, sd]],
    offset: (p - 1) * ps,
    limit: ps,
    ...opt(ctx),
  });
  return { data: rows.map(r => r.get({ plain: true })), page: p, pageSize: ps, total: count, totalPages: Math.ceil(count / ps) };
}

export async function updateEmployee(id, updates = {}, ctx = {}) {
  const row = await EmployeeBase.findByPk(id, opt(ctx));
  if (!row) return null;
  row.set({
    ...(updates.first_name   !== undefined ? { first_name: String(updates.first_name).trim() } : {}),
    ...(updates.last_name    !== undefined ? { last_name:  String(updates.last_name).trim() } : {}),
    ...(updates.email        !== undefined ? { email:     String(updates.email).toLowerCase().trim() } : {}),
    ...(updates.phone_number !== undefined ? { phone_number: updates.phone_number } : {}),
    ...(updates.dob          !== undefined ? { dob: updates.dob } : {}),
    ...(updates.start_date   !== undefined ? { start_date: updates.start_date } : {}),
    ...(updates.id_card      !== undefined ? { id_card: updates.id_card } : {}),
    ...(updates.job_id       !== undefined ? { job_id: updates.job_id } : {}),
    ...(updates.payroll_id   !== undefined ? { payroll_id: updates.payroll_id } : {}),
  });
  try {
    await row.save(opt(ctx));
    return row.get({ plain: true });
  } catch (err) { throw normalizeUnique(err); }
}

export async function deleteEmployee(id, ctx = {}) {
  const n = await EmployeeBase.destroy({ where: { id }, ...opt(ctx) });
  return n > 0;
}
