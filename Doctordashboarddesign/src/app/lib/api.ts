const BASE_URL = 'http://localhost:5000/api';

async function request(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem('cliniccortex-token');

  const headers = new Headers(options.headers);
  headers.set('Content-Type', 'application/json');
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const config: RequestInit = {
    ...options,
    headers
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);

  if (response.status === 401 || response.status === 403) {
    // If unauthorized/token expired, clear auth credentials and force redirect to login page
    localStorage.removeItem('cliniccortex-token');
    localStorage.removeItem('cliniccortex-auth');
    if (window.location.pathname !== '/login') {
      window.location.href = '/login';
    }
  }

  const data = await response.json();

  if (!response.ok) {
    const errorMsg = data?.message || response.statusText || 'An error occurred during API request';
    throw new Error(errorMsg);
  }

  return data;
}

export const api = {
  get: (endpoint: string, options?: RequestInit) => request(endpoint, { ...options, method: 'GET' }),
  post: (endpoint: string, body?: any, options?: RequestInit) => request(endpoint, { ...options, method: 'POST', body: JSON.stringify(body) }),
  put: (endpoint: string, body?: any, options?: RequestInit) => request(endpoint, { ...options, method: 'PUT', body: JSON.stringify(body) }),
  patch: (endpoint: string, body?: any, options?: RequestInit) => request(endpoint, { ...options, method: 'PATCH', body: JSON.stringify(body) }),
  delete: (endpoint: string, options?: RequestInit) => request(endpoint, { ...options, method: 'DELETE' })
};

export default api;
