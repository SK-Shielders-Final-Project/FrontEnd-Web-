import apiClient from "../../api/axiosConfig";

const API_LIST = "/api/bikes";
const API_UPDATE = "/api/admin/bike";

// 1) 자전거 목록 조회
export async function fetchBikes() {
  const res = await apiClient.post(API_LIST, {}); // Use apiClient

  // 서버가 배열을 바로 주거나 {data:[...]} 형태로 주는 것 둘 다 방어
  const data = res.data;
  const arr = Array.isArray(data) ? data : (data?.data ?? []);

  return arr; // Assuming the backend returns the list directly or within 'data'
}

// 2) 자전거 상태 변경
export async function updateBikeStatus(bikeId, statusKorean) {
  const body = {
    bike_id: bikeId,
    status: statusKorean, // "사용중"/"가용"/"고장"
  };

  // apiClient 사용하면 baseURL, 토큰 인터셉터 자동 적용됨
  // 헤더는 인터셉터에서 Authorization, X-Auth-Type을 추가하므로 수동으로 X-ADMIN-ID를 추가할 필요 없음.
  const res = await apiClient.put(API_UPDATE, body); // Use apiClient

  // 응답 DTO: { user_id, username, admin_level, updated_at }
  const data = res.data;

  return data; // Assuming the backend returns the updated bike status data
}
