import axios from 'axios';
import { tokenService } from './tokenService';

const API_URL = (import.meta as any)?.env?.VITE_API_URL || 'http://localhost:5000';

export const api = axios.create({
  baseURL: API_URL,
});

// Add token to all requests
api.interceptors.request.use(
  (config) => {
    const token = tokenService.getToken();
    if (token) {
      // eslint-disable-next-line no-param-reassign
      config.headers = config.headers ?? {};
      // attach token using backend's expected header
      // Backend expects `x-auth-token` (see middleware/auth.js)
      (config.headers as any)['x-auth-token'] = token;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle 401 errors (invalid/expired token)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      tokenService.removeToken();
      // redirect to root (login screen)
      try {
        window.location.href = '/';
      } catch (e) {
        // ignore when running in non-browser environments
      }
    }
    return Promise.reject(error);
  }
);

export default api;
