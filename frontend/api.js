/**
 * api.js — centralised API client for VolunteerHub
 * All fetch calls go through here so the base URL is one config change.
 */

const BASE_URL = window.API_BASE_URL || 'http://localhost:5000/api';

// ── Token helpers ──────────────────────────────────────────────────────────
export const getToken  = ()        => localStorage.getItem('vh_token');
export const setToken  = (t)       => localStorage.setItem('vh_token', t);
export const clearToken = ()       => localStorage.removeItem('vh_token');
export const getUser   = ()        => JSON.parse(localStorage.getItem('vh_user') || 'null');
export const setUser   = (u)       => localStorage.setItem('vh_user', JSON.stringify(u));
export const clearUser  = ()       => localStorage.removeItem('vh_user');

// ── Core fetch wrapper ─────────────────────────────────────────────────────
async function request(path, options = {}) {
  const token = getToken();
  const headers = { 'Content-Type': 'application/json', ...(options.headers || {}) };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

// ── Auth ───────────────────────────────────────────────────────────────────
export const auth = {
  register: (body) => request('/auth/register', { method: 'POST', body: JSON.stringify(body) }),
  login:    (body) => request('/auth/login',    { method: 'POST', body: JSON.stringify(body) }),
  me:       ()     => request('/auth/me'),
  changePassword: (body) => request('/auth/change-password', { method: 'POST', body: JSON.stringify(body) }),
};

// ── Volunteers ─────────────────────────────────────────────────────────────
export const volunteers = {
  list:   (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/volunteers${qs ? '?' + qs : ''}`);
  },
  stats:  ()     => request('/volunteers/stats'),
  get:    (id)   => request(`/volunteers/${id}`),
  create: (body) => request('/volunteers', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/volunteers/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  setStatus: (id, status) => request(`/volunteers/${id}/status`, { method: 'PATCH', body: JSON.stringify({ status }) }),
  delete: (id)   => request(`/volunteers/${id}`, { method: 'DELETE' }),
};

// ── Events ─────────────────────────────────────────────────────────────────
export const events = {
  list:   ()     => request('/events'),
  create: (body) => request('/events', { method: 'POST', body: JSON.stringify(body) }),
  update: (id, body) => request(`/events/${id}`, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: (id)   => request(`/events/${id}`, { method: 'DELETE' }),
};

// ── Health ─────────────────────────────────────────────────────────────────
export const health = () => request('/health');
