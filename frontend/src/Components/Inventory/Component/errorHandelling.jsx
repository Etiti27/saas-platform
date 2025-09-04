
import axios from 'axios';
export function normalizeAxiosError(err) {
    if (axios.isCancel(err)) return { kind: 'canceled', message: 'Request cancelled.' };
    if (err?.code === 'ERR_NETWORK') {
      return { kind: 'network', message: navigator.onLine ? 'Network error—server unreachable.' : 'You are offline. Check your connection.' };
    }
    const status = err?.response?.status;
    const apiMsg = err?.response?.data?.message || err?.message || 'Unexpected error';
    if (status) {
      const bucket = status >= 500 ? 'server' : status >= 400 ? 'client' : 'unknown';
      return { kind: bucket, status, message: `${apiMsg}${status ? ` (HTTP ${status})` : ''}` };
    }
    return { kind: 'unknown', message: err?.message || 'Unexpected error' };
  }