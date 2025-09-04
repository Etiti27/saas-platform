export function normalizeUnique(err) {
    if (!(err instanceof UniqueConstraintError)) return err;
    const fields = Object.keys(err.fields || {});
    const field = fields[0] || 'unique';
    const e = new Error(`${field} must be unique.`);
    e.code = 'UNIQUE_VIOLATION';
    e.field = field;
    return e;
  }
  
  export function sanitizeSort({allowed, by = 'id', dir = 'ASC'}) {
    const sortBy = allowed.has(by) ? by : Array.from(allowed)[0];
    const sortDir = String(dir).toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    return [sortBy, sortDir];
  }
  
  export function opt(ctx) {
    // Normalize { transaction, searchPath }
    return ctx && (ctx.transaction || ctx.searchPath)
      ? { transaction: ctx.transaction, searchPath: ctx.searchPath }
      : {};
  }
  
  export function assertIdentifier({name, label = 'schema'}) {
    if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(String(name))) {
      const e = new Error(`${label} name is invalid`);
      e.code = 'VALIDATION_ERROR';
      e.field = label;
      throw e;
    }
  }
  
  export async function withTenant({schema, fn}) {
    assertIdentifier(schema, 'schema');
    return sequelize.transaction(async (transaction) => {
      // Set search_path LOCAL to this transaction to isolate the tenant schema
      await sequelize.query(`SET LOCAL search_path TO "${schema}", public;`, { transaction });
      return fn({ transaction, searchPath: schema });
    });
  }