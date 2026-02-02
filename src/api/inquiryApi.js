import apiClient from './axiosConfig';

const API_WRITE = '/api/user/inquiry/write';
const API_LIST = '/api/user/inquiry';
const API_DETAIL = '/api/user/inquiry'; // GET /api/user/inquiry/{inquiryid}
const API_MODIFY = '/api/user/inquiry/modify';
const API_DELETE = '/api/user/inquiry/delete';
const API_DOWNLOAD = '/api/user/files/download';
const API_VIEW = '/api/files/view';

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
  const res = await apiClient.get(API_LIST, { params: { user_id: userId } });
  const data = res.data;
  return Array.isArray(data) ? data : (data?.data ?? []);
}

/**
 * 문의사항 상세 조회 (GET /api/user/inquiry/{inquiryid})
 * @param {string|number} userId (현재는 inquiryId만 필요하지만, API 명세에 따라 userId가 필요할 수 있어 남겨둠)
 * @param {number} inquiryId
 * @returns {Promise<Object>} 문의 상세 객체
 */
export async function fetchInquiryDetail(inquiryId) {
  const res = await apiClient.get(`${API_DETAIL}/${inquiryId}`);
  return res.data;
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
 * @param {string} filepath - 백엔드에서 받은 파일 경로/이름 (예: uuid.ext)
 * @param {string} originalFilename - 다운로드될 파일명 (브라우저에 표시될 이름)
 */
export async function downloadFile(filepath, originalFilename) {
  if (!filepath) return;
  const res = await apiClient.get(API_DOWNLOAD, {
    params: { file: filepath },
    responseType: 'blob',
  });
  const blob = res.data;
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = originalFilename || 'download';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  window.URL.revokeObjectURL(url);
}

/**
 * 첨부파일 미리보기 (Blob 받아서 새 탭에서 열기)
 * @param {string} filepath - 백엔드에서 받은 파일 경로/이름 (예: uuid.ext)
 */
export async function viewFile(filepath) {
  if (!filepath) return;
  const res = await apiClient.get(API_VIEW, {
    params: { file: filepath },
    responseType: 'blob',
  });
  const blob = res.data;
  const fileURL = window.URL.createObjectURL(blob);
  window.open(fileURL);
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
  // 변경된 API 응답: { result: 'Y', file_id: 123 }
  if (d && d.result === 'Y' && d.file_id != null) return Number(d.file_id);
  if (d && (d.file_id != null || d.id != null)) return Number(d.file_id ?? d.id); // 기존 호환성
  return null;
}
