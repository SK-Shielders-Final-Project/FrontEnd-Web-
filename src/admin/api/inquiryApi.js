import apiClient from '../../api/axiosConfig';

// Admin-specific API endpoints
const API_ADMIN_LIST = '/api/admin/inquiry';
const API_ADMIN_DETAIL = '/api/admin/inquiry'; // Assuming detail endpoint
const API_ADMIN_REPLY = API_ADMIN_LIST;
const API_ADMIN_DELETE = '/api/admin/inquiry/delete';
const API_ADMIN_DOWNLOAD = '/api/admin/files/download'; // Admin download endpoint

export async function fetchAllInquiries(adminLevel, page = 0, size = 10) {
  // Assuming adminLevel might be used for filtering or context on the backend
  const res = await apiClient.post(API_ADMIN_LIST, { admin_level: adminLevel, page, size });
  return res.data;
}

export async function fetchInquiryDetail(adminLevel, inquiryId) {
  const res = await apiClient.post(`${API_ADMIN_DETAIL}/${inquiryId}`, {
    admin_level: adminLevel
  });
  return res.data;
}

export async function writeAdminReply(adminLevel, inquiryId, replyContent) {
  const res = await apiClient.put(API_ADMIN_REPLY, {
    inquiry_id: inquiryId,
    admin_level: adminLevel,
    admin_reply: replyContent,
  });
  return res.data;
}

export async function deleteInquiry(adminLevel, inquiryId) {
  const res = await apiClient.post(API_ADMIN_DELETE, {
    inquiry_id: inquiryId,
    admin_level: adminLevel
  });
  return res.data;
}

// Adapt this if admin download logic is different
export async function downloadFile(filename, adminLevel) {
  if (!filename) return;
  const res = await apiClient.get(API_ADMIN_DOWNLOAD, {
    params: { file: filename, admin_level: adminLevel },
    responseType: 'blob',
  });
  const blob = res.data;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename || 'download';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}
