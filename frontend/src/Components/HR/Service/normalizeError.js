export function normalizeError(err) {
    if (err?.response) {
      const status = err.response.status;
      const msg =
        err.response.data?.message ||
        err.response.data?.error ||
        `Request failed (HTTP ${status})`;
      return { message: msg, status };
    }
    if (err?.request) {
      const msg = navigator.onLine
        ? 'Network error: server unreachable.'
        : 'You appear to be offline.';
      return { message: msg };
    }
    return { message: err?.message || 'Unexpected error.' };
  }