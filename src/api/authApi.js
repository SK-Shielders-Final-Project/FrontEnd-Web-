import apiClient from "./axiosConfig";

export const loginUser = async (username, password) => {
    const response = await apiClient.post('/api/user/auth/login', { username, password });
    return response.data;
};

export const refreshAccessToken = async (refreshToken) => {
    const response = await apiClient.post('/api/auth/refresh', { refreshToken });
    return response.data;
};
