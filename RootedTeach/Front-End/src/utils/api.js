/* api.js - Centralized API helper for all frontend requests. */
/* Automatically attaches the JWT token. Handles both JSON and File uploads! */

const BASE = 'http://localhost:5001';

// Grab the token from localStorage if the user is logged in
function authHeaders() {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

// ── Interceptor logic to handle 401 Unauthorized globally (Optional but handy) ──
async function handleResponse(response) {
  if (response.status === 401) {
    console.warn("Token expired or invalid. Clearing session...");
    localStorage.clear();
    window.location.href = "/"; // Kick them back to login
  }
  return response;
}

export const api = {
  get: async (path) => {
    const res = await fetch(`${BASE}${path}`, { 
      headers: { 'Content-Type': 'application/json', ...authHeaders() } 
    });
    return handleResponse(res);
  },

  post: async (path, body) => {
    // Check if we are uploading a file (FormData) or just sending normal data
    const isFormData = body instanceof FormData;
    const headers = { ...authHeaders() };
    
    // IMPORTANT: If it's a file, let the browser set the Content-Type automatically!
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${BASE}${path}`, {
      method: 'POST',
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(res);
  },

  del: async (path) => {
    const res = await fetch(`${BASE}${path}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json', ...authHeaders() },
    });
    return handleResponse(res);
  },

  put: async (path, body) => {
    const isFormData = body instanceof FormData;
    const headers = { ...authHeaders() };
    
    if (!isFormData) {
      headers['Content-Type'] = 'application/json';
    }

    const res = await fetch(`${BASE}${path}`, {
      method: 'PUT',
      headers,
      body: isFormData ? body : JSON.stringify(body),
    });
    return handleResponse(res);
  },
};