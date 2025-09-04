
// utils/passwords.js
import { v4 as uuidv4 } from 'uuid';

export function generateUuidPassword({ length = 12, withSymbols = true } = {}) {
  // 32 hex chars per UUID (minus dashes). Concatenate for extra entropy.
  const pool = (uuidv4() + uuidv4()).replace(/-/g, ''); // 64 hex chars
  let pwd = pool.slice(0, Math.max(8, Math.min(length, 64))); // cap to pool size

  // Ensure basic complexity: upper, lower, digit, (optional) symbol
  const inject = [];
  inject.push('A');         // upper
  inject.push('a');         // lower
  inject.push(String(Math.floor(Math.random() * 10))); // digit
  if (withSymbols) inject.push('!'); // simple symbol

  // Mix them into random positions
  for (const ch of inject) {
    const i = Math.floor(Math.random() * pwd.length);
    pwd = pwd.slice(0, i) + ch + pwd.slice(i + 1);
  }
  return pwd;
}
