import bcrypt from 'bcryptjs';

function required(v, field) {
  if (v == null || String(v).trim() === '') {
    const err = new Error(`${field} is required`);
    err.code = 'VALIDATION_ERROR';
    err.field = field;
    throw err;
  }
}

/** Hash a plaintext password (cost defaults to 10) */
export async function hashPassword(plain, cost = 10) {
  required(plain, 'password');
  // bcryptjs supports Promises in recent versions; fallback shown below if needed
  return bcrypt.hash(String(plain), cost);
}

/** Compare a plaintext password to a stored hash */
export async function comparePassword(plain, hash) {
  required(plain, 'password');
  required(hash, 'password_hash');
  return bcrypt.compare(String(plain), String(hash));
}
