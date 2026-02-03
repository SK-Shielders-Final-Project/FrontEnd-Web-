import apiClient from '../../api/axiosConfig';

export const getTemplate = async (templateName) => {
    const response = await apiClient.get(`/api/admin/email-templates/${templateName}`);
    return response.data.data;
};

export const updateTemplate = async (templateName, data) => {
    const response = await apiClient.put(`/api/admin/email-templates/${templateName}`, data);
    return response.data;
};

export const getPreview = async (content) => {
    const response = await apiClient.post('/api/admin/email-templates/preview', { content });
    return response.data.data;
};
