import apiClient from "../../api/axiosConfig";

export const loginAdmin = async (username, password) => {
    const response = await apiClient.post('/api/admin/auth/login', { username, password });
    return response.data;
};
