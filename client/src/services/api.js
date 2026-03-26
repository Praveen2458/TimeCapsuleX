import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api/v1'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const createCapsule = (data) => api.post('/capsules', data);
export const getCapsule = (slug) => api.get(`/capsules/${slug}`);
export const unlockCapsule = (slug, password) =>
  api.post(`/capsules/${slug}/unlock`, { password });
export const getMyCapsules = () => api.get('/capsules/my');

export const register = (data) => api.post('/auth/register', data);
export const login = (data) => api.post('/auth/login', data);

export default api;
