import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Equipment API
export const equipmentAPI = {
  getAll: (params) => api.get('/equipment', { params }),
  getById: (id) => api.get(`/equipment/${id}`),
  create: (data) => api.post('/equipment', data),
  update: (id, data) => api.put(`/equipment/${id}`, data),
  delete: (id) => api.delete(`/equipment/${id}`),
  generateQR: (id) => api.post(`/equipment/${id}/qr-code`),
  search: (query, params) => api.get(`/equipment/search/${encodeURIComponent(query)}`, { params })
};

// Maintenance API
export const maintenanceAPI = {
  getTasks: (params) => api.get('/maintenance', { params }),
  getTask: (id) => api.get(`/maintenance/${id}`),
  createTask: (data) => api.post('/maintenance', data),
  updateTask: (id, data) => api.put(`/maintenance/${id}`, data),
  completeTask: (id, data) => api.post(`/maintenance/${id}/complete`, data),
  getHistory: (equipmentId, params) => api.get(`/maintenance/equipment/${equipmentId}/history`, { params }),
  getOverdue: () => api.get('/maintenance/overdue')
};

// Issues API
export const issuesAPI = {
  getAll: (params) => api.get('/issues', { params }),
  getById: (id) => api.get(`/issues/${id}`),
  create: (data) => api.post('/issues', data),
  update: (id, data) => api.put(`/issues/${id}`, data),
  assign: (id, userId) => api.put(`/issues/${id}/assign`, { assignedTo: userId }),
  close: (id, data) => api.put(`/issues/${id}/close`, data),
  getCritical: () => api.get('/issues/critical/open')
};

// Dashboard API
export const dashboardAPI = {
  getMetrics: (params) => api.get('/dashboard/metrics', { params }),
  getEquipmentHealth: (params) => api.get('/dashboard/equipment-health', { params }),
  getMaintenanceSchedule: (params) => api.get('/dashboard/maintenance-schedule', { params }),
  getIssueTrends: (params) => api.get('/dashboard/issue-trends', { params }),
  getPerformance: (params) => api.get('/dashboard/performance', { params }),
  getAlerts: (params) => api.get('/dashboard/alerts', { params })
};

// Users API
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getTechnicians: (params) => api.get('/users/technicians', { params }),
  update: (id, data) => api.put(`/users/${id}`, data),
  deactivate: (id) => api.delete(`/users/${id}`)
};

export default api;