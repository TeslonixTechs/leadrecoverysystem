import axios from 'axios';

const API_BASE_URL = 'https://leadrecoverysystem.onrender.com/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Intercept requests to add Authorization header if token exists
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('serviceflow_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

export default api;
