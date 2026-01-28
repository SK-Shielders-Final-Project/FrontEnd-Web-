import apiClient from './axiosConfig';

const API_WRITE = '/api/user/inquiry/write';
const API_LIST = '/api/user/inquiry';
const API_MODIFY = '/api/user/inquiry/modify';
const API_DELETE = '/api/user/inquiry/delete';
const API_DOWNLOAD = '/api/user/files/download';

/**
 * 문의사항 작성
 * @param {string|number} userId
 * @param {{ title: string, content: string, file_id?: number|null }} body
 * @returns {Promise<Object>} 작성된 문의 객체
 */
export async function writeInquiry(userId, { title, content, file_id = null }) {
  const payload = {
    user_id: Number(userId),
    title,
    content,
    file_id: file_id != null ? Number(file_id) : null,
  };
  const res = await apiClient.post(API_WRITE, payload);
  return res.data;
}

/**
 * 내 문의사항 목록 조회 (POST)
 * @param {string|number} userId
 * @returns {Promise<Array>}
 */
export async function fetchMyInquiries(userId) {
  const res = await apiClient.post(API_LIST, { user_id: Number(userId) });
  const data = res.data;
  return Array.isArray(data) ? data : (data?.data ?? []);
}

/**
 * 문의사항 수정
 * @param {string|number} userId
 * @param {number} inquiryId
 * @param {{ title: string, content: string, file_id?: number|null }} body
 * @returns {Promise<{ result: string }>}
 */
export async function updateInquiry(userId, inquiryId, { title, content, file_id = null }) {
  const payload = {
    user_id: Number(userId),
    inquiry_id: Number(inquiryId),
    title,
    content,
    file_id: file_id != null ? Number(file_id) : null,
  };
  const res = await apiClient.put(API_MODIFY, payload);
  return res.data;
}

/**
 * 문의사항 삭제
 * @param {string|number} userId
 * @param {number} inquiryId
 * @returns {Promise<{ result: string }>}
 */
export async function deleteInquiry(userId, inquiryId) {
  const res = await apiClient.post(API_DELETE, {
    user_id: Number(userId),
    inquiry_id: Number(inquiryId),
  });
  return res.data;
}

/**
 * 첨부파일 다운로드 (Blob 받아서 브라우저 다운로드)
 * @param {string} filename - DB/로컬 파일명
 */
export async function downloadFile(filename) {
  if (!filename) return;
  const res = await apiClient.get(API_DOWNLOAD, {
    params: { file: filename },
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

const API_IMAGE = '/api/image';
const API_FILES_UPLOAD = '/api/files/upload';

/**
 * Summernote용 이미지 파일 업로드 → /api/image
 * @param {File} file
 * @returns {Promise<string>} 이미지 URL
 */
export async function uploadImageFile(file) {
  if (!file) return '';
  const form = new FormData();
  form.append('file', file);
  form.append('image', file);
  const res = await apiClient.post(API_IMAGE, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const d = res.data;
  return (d && (d.url ?? d.imageUrl ?? d.path)) || '';
}

/**
 * Summernote용 이미지 URL 전송 → /api/image
 * @param {string} url
 * @returns {Promise<string>} 저장된 이미지 URL
 */
export async function uploadImageUrl(url) {
  if (!url || typeof url !== 'string') return '';
  const res = await apiClient.post(API_IMAGE, { url: url.trim() });
  const d = res.data;
  return (d && (d.url ?? d.imageUrl ?? d.path)) || url;
}

/**
 * 문의 첨부파일 업로드 (로컬 파일) → /api/files/upload
 * @param {File} file
 * @returns {Promise<number|null>} file_id 또는 null
 */
export async function uploadAttachmentFile(file) {
  if (!file) return null;
  const form = new FormData();
  form.append('file', file);
  const res = await apiClient.post(API_FILES_UPLOAD, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  const d = res.data;
  if (d && (d.file_id != null || d.id != null)) return Number(d.file_id ?? d.id);
  return null;
}
