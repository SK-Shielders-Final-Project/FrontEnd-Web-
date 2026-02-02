import axios from 'axios';
import { refreshAccessToken } from './authApi';
import { logoutUser, logoutAdmin } from '../auth/authUtils';
import { getCookie, setCookie } from '../utils/cookie';

const apiClient = axios.create();

apiClient.interceptors.request.use(
  (config) => {
    const adminToken = getCookie('adminToken');
    const token = getCookie('token');

    const authEndpoints = ['/api/auth/refresh', '/api/user/auth/login', '/api/admin/auth/login', '/api/user/auth/signup'];
    if (authEndpoints.includes(config.url)) {
        return config;
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      config.headers['X-Auth-Type'] = 'user';
    } else if (adminToken) { // Only check for adminToken if no user token is present
      config.headers['Authorization'] = `Bearer ${adminToken}`;
      config.headers['X-Auth-Type'] = 'admin';
    }
    // NOTE: This prioritizes user token if both user and admin tokens are present,
    // as per user's request ("비교 우선순위?를 user 먼저로 바꿔주라").
    // If different behavior is desired (e.g., admin token for admin paths),
    // more sophisticated logic is required, possibly by checking config.url.

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
      const refreshToken = getCookie(refreshTokenName);

      if (refreshToken) {
        try {
          const response = await refreshAccessToken(refreshToken);
          const newAccessToken = response.accessToken;

          if (authType === 'admin') {
            setCookie('adminToken', newAccessToken, 1);
          } else {
            setCookie('token', newAccessToken, 1);
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
