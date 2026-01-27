// src/admin/utils/bikeStatus.js

// UI에서 쓸 옵션 (한글로 통일하는게 백엔드랑 가장 잘 맞음)
export const BIKE_STATUS_OPTIONS_KO = ["가용", "사용중", "고장"];

// 백엔드 BikeResponse.status_code -> 한글(참고용)
// (응답에 이미 status 한글이 들어오지만, 혹시나 대비)
export function statusKoFromCode(code) {
  if (code === 0) return "사용중";
  if (code === 1) return "가용";
  if (code === 2) return "고장";
  return "알수없음";
}

// 화면 검색용: 자전거를 표시할 label 만들기
export function makeBikeLabel(bike) {
  // 기존 UI가 BIKE-001 형태라서, serial_number를 그대로 label처럼 보여주는걸 추천
  // 필요하면 "BIKE-" prefix 붙이기 로직도 추가 가능
  return bike.serial_number || `BIKE-${String(bike.bike_id).padStart(3, "0")}`;
}
