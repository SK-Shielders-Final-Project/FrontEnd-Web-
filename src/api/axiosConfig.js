import axios from 'axios';
import { refreshAccessToken } from './authApi';
import { logoutUser, logoutAdmin } from '../auth/authUtils';
import { getCookie, setCookie } from '../utils/cookie';

const apiClient = axios.create({
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 300000, // ✅ 여기에 추가! 이제 모든 apiClient 요청은 5분간 기다립니다.
});

// ... 아래 인터셉터 로직은 그대로 유지 ...

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
    } else if (adminToken) { 
      config.headers['Authorization'] = `Bearer ${adminToken}`;
      config.headers['X-Auth-Type'] = 'admin';
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
    // ... 이하 생략 (기존 코드 유지) ...
    return Promise.reject(error);
  }
);

export default apiClient;