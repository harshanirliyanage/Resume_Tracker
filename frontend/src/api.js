import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({ baseURL: API_BASE });

// Attach auth token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Auth
export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);
export const getMe = () => api.get('/auth/me');

// Analysis
export const analyzeResume = (formData) =>
  api.post('/analyze', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    timeout: 60000,
  });

export const getHistory = () => api.get('/analyze/history');
export const getAnalysis = (id) => api.get(`/analyze/${id}`);
export const deleteAnalysis = (id) => api.delete(`/analyze/${id}`);

export default api;
