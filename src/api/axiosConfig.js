import axios from 'axios';

// Create a dedicated axios instance for authenticated API calls
const apiClient = axios.create();

// Add a request interceptor to this specific instance
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;
