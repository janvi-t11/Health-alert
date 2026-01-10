import axios from 'axios';

// Use environment variable or fallback to production backend
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://health-alert-backend.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Request interceptor to add auth headers if needed
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

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    return Promise.reject(error);
  }
);

// Reports API
export const reportsAPI = {
  // Get all reports
  getReports: async (params = {}) => {
    const response = await api.get('/reports', { params });
    return response.data;
  },

  // Create a new report
  createReport: async (reportData) => {
    const response = await api.post('/reports', reportData);
    return response.data;
  },

  // Update a report
  updateReport: async (reportId, updates) => {
    const response = await api.patch(`/reports/${reportId}`, updates);
    return response.data;
  },

  // Verify a report (approve/reject)
  verifyReport: async (reportId, verified) => {
    const response = await api.patch(`/reports/${reportId}/verify`, { verified });
    return response.data;
  },

  // Approve a report
  approveReport: async (reportId) => {
    const response = await api.put(`/reports/${reportId}/approve`);
    return response.data;
  },

  // Reject a report
  rejectReport: async (reportId) => {
    const response = await api.put(`/reports/${reportId}/reject`);
    return response.data;
  },

  // Delete a report
  deleteReport: async (reportId) => {
    const response = await api.delete(`/reports/${reportId}`);
    return response.data;
  },

  // Get report by ID
  getReport: async (reportId) => {
    const response = await api.get(`/reports/${reportId}`);
    return response.data;
  }
};

// Alerts API
export const alertsAPI = {
  // Get all alerts
  getAlerts: async (params = {}) => {
    const response = await api.get('/alerts', { params });
    return response.data;
  },

  // Create a new alert
  createAlert: async (alertData) => {
    const response = await api.post('/alerts', alertData);
    return response.data;
  },

  // Update an alert
  updateAlert: async (alertId, updates) => {
    const response = await api.patch(`/alerts/${alertId}`, updates);
    return response.data;
  },

  // Delete an alert
  deleteAlert: async (alertId) => {
    const response = await api.delete(`/alerts/${alertId}`);
    return response.data;
  }
};

// Health check
export const healthAPI = {
  check: async () => {
    const response = await api.get('/health');
    return response.data;
  }
};

// Auth API
export const authAPI = {
  // Login user
  login: async (credentials) => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  // Register user
  register: async (userData) => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  // Admin register
  adminRegister: async (adminData) => {
    const response = await api.post('/auth/admin/register', adminData);
    return response.data;
  }
};

// Export the main api instance for direct use
export { api };

// Export auth methods for backward compatibility
export const { login, register } = authAPI;

// Export individual API methods for backward compatibility
export const {
  getReports,
  createReport,
  updateReport,
  verifyReport,
  approveReport,
  rejectReport,
  deleteReport,
  getReport
} = reportsAPI;

export const {
  getAlerts,
  createAlert,
  updateAlert,
  deleteAlert
} = alertsAPI;