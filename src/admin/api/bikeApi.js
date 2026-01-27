// src/admin/api/bikeApi.js

const API_LIST = "/api/bikes";
const API_UPDATE = "/api/admin/bike";

// 관리자 ID 가져오는 함수 (나중에 로그인 붙이면 여기만 교체)
export function getAdminId() {
  const v = localStorage.getItem("admin_id");
  return v ? Number(v) : 1; // 임시
}

// 1) 자전거 목록 조회 (컨트롤러가 POST만 받음)
export async function fetchBikes() {
  const res = await fetch(API_LIST, {
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
    },
    // body를 안 받는 컨트롤러지만, POST라서 빈 body를 보내도 무방
    body: JSON.stringify({}),
  });

  if (!res.ok) {
    throw new Error(`자전거 목록 조회 실패 (HTTP ${res.status})`);
  }

  return res.json(); // List<BikeResponse>
}

// 2) 자전거 상태 변경
export async function updateBikeStatus(bikeId, statusKorean) {
  const adminId = getAdminId();

  const res = await fetch(API_UPDATE, {
    method: "PUT",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json",
      "X-ADMIN-ID": String(adminId),
    },
    body: JSON.stringify({
      bike_id: bikeId,
      status: statusKorean, // "사용중"/"가용"/"고장"
    }),
  });

  // 권한 없으면 403, 관리자ID 틀리면 404 등 날 수 있음
  if (!res.ok) {
    throw new Error(`상태 수정 실패 (HTTP ${res.status})`);
  }

  return res.json(); // BikeStatusUpdateResponse
}
