import axios from 'axios';

const BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

const api = axios.create({ baseURL: BASE });

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('access_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(
  res => res,
  async err => {
    if (err.response?.status === 401) {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        try {
          const { data } = await axios.post(`${BASE}/auth/refresh/`, { refresh });
          localStorage.setItem('access_token', data.access);
          err.config.headers.Authorization = `Bearer ${data.access}`;
          return api.request(err.config);
        } catch {
          localStorage.clear();
          window.location.href = '/login';
        }
      }
    }
    return Promise.reject(err);
  }
);

export default api;

export const authApi = {
  login: (username: string, password: string) =>
    axios.post(`${BASE}/auth/login/`, { username, password }),
  me: () => api.get('/auth/me/'),
};

export const regionsApi = {
  list: () => api.get('/regions/'),
  create: (data: any) => api.post('/regions/', data),
  update: (id: number, data: any) => api.patch(`/regions/${id}/`, data),
  delete: (id: number) => api.delete(`/regions/${id}/`),
};

export const vesselsApi = {
  list: (regionId?: number) => api.get('/vessels/', { params: regionId ? { region: regionId } : {} }),
  create: (data: any) => api.post('/vessels/', data),
  update: (id: number, data: any) => api.patch(`/vessels/${id}/`, data),
};

export const ratesApi = {
  list: (params: any) => api.get('/market-rates/', { params }),
  create: (data: any) => api.post('/market-rates/', data),
  update: (id: number, data: any) => api.patch(`/market-rates/${id}/`, data),
  delete: (id: number) => api.delete(`/market-rates/${id}/`),
};

export const performanceApi = {
  aggregated: (params: any) => api.get('/performance/aggregated/', { params }),
  summary: () => api.get('/dashboard/summary/'),
};
