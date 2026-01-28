import axios from 'axios';
import { refreshAccessToken } from './authApi';
import { logoutUser, logoutAdmin } from '../auth/authUtils';

const apiClient = axios.create();

apiClient.interceptors.request.use(
  (config) => {
    const adminToken = localStorage.getItem('adminToken');
    const token = localStorage.getItem('token');

    if (config.url === '/api/auth/refresh') {
        return config;
    }

    if (adminToken) {
      config.headers['Authorization'] = `Bearer ${adminToken}`;
      config.headers['X-Auth-Type'] = 'admin';
    } else if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['X-Auth-Type'] = 'user';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const authType = originalRequest.headers['X-Auth-Type'];

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshTokenName = authType === 'admin' ? 'adminRefreshToken' : 'refreshToken';
      const refreshToken = localStorage.getItem(refreshTokenName);

      if (refreshToken) {
        try {
          const response = await refreshAccessToken(refreshToken);
          const newAccessToken = response.accessToken;

          if (authType === 'admin') {
            localStorage.setItem('adminToken', newAccessToken);
          } else {
            localStorage.setItem('token', newAccessToken);
          }

          originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;
          return apiClient(originalRequest);
        } catch (refreshError) {
          console.error("Token refresh failed", refreshError);
          authType === 'admin' ? logoutAdmin() : logoutUser();
          return Promise.reject(refreshError);
        }
      } else {
        // No refresh token available
        authType === 'admin' ? logoutAdmin() : logoutUser();
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
