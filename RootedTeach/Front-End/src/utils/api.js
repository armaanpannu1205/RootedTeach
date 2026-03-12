const BASE = 'http://localhost:5001';
async function apiFetch(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(options.headers || {}) };
  if (options.body instanceof FormData) delete headers['Content-Type'];
  const res = await fetch(`${BASE}${path}`, { ...options, headers });
  if (res.status === 401) { localStorage.clear(); window.location.href = '/'; throw new Error('Session expired.'); }
  return res;
}
export const api = {
  get:      (path)       => apiFetch(path, { method: 'GET' }),
  post:     (path, body) => apiFetch(path, { method: 'POST', body: JSON.stringify(body) }),
  postForm: (path, fd)   => apiFetch(path, { method: 'POST', body: fd }),
  del:      (path)       => apiFetch(path, { method: 'DELETE' }),
};
export default api;
