// auth.js
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const ACCESS_KEY = 'access_token';   // <- define this
const REFRESH_KEY = 'refresh_token'; // optional, if you store it

export function setAccessToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_KEY, token);
  axios.defaults.headers.common.Authorization = `Bearer ${token}`;
}

export function setRefreshToken(token) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(REFRESH_KEY, token);
}

export function getAccessToken() {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_KEY);
}

export const bootstrapAuth=() =>{
  if (typeof window === 'undefined') return { user: null, isAuthenticated: false };

  const token = localStorage.getItem(ACCESS_KEY);
  if (!token) return { user: null, isAuthenticated: false };

  try {
    const decoded = jwtDecode(token); // { sub, email, schema, tenant_id, role, exp, ... }
    const now = Math.floor(Date.now() / 1000);
    if (decoded?.exp && decoded.exp <= now) throw new Error('expired');

    axios.defaults.headers.common.Authorization = `Bearer ${token}`;
    return { user: decoded, isAuthenticated: true };
  } catch {
    // token missing/invalid/expired
    localStorage.removeItem(ACCESS_KEY);
    delete axios.defaults.headers.common.Authorization;
    return { user: null, isAuthenticated: false };
  }
}

export function logout({ redirect } = {}) {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(REFRESH_KEY);
  delete axios.defaults.headers.common.Authorization;

  if (redirect) {
    window.location.replace(redirect);
  } else {
    window.location.reload();
  }
}
