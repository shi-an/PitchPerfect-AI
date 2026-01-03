const env = (import.meta as any).env || {};
export const API_BASE = (env.VITE_API_BASE || '').replace(/\/$/, '');
export const apiUrl = (path: string) => {
  const p = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE}${p}`;
};
