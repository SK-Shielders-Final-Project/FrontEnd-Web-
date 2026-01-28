// src/admin/api/memberApi.js
import apiClient from "../../api/axiosConfig";

/**
 * 백엔드가 내려주는 admin_level(0/1/2)을 ROLE 문자열로 바꿔서 프론트에서 쓰기 좋게 만드는 함수
 */
export const LEVEL_TO_ROLE = {
  0: "USER",
  1: "ADMIN",
  2: "SUPER_ADMIN",
};

export const ROLE_TO_LEVEL = {
  USER: 0,
  ADMIN: 1,
  SUPER_ADMIN: 2,
};

// ✅ 회원 목록 조회 API (엔드포인트는 너가 MembersPage에서 쓰던 그대로)
// 서버가 배열을 바로 주거나 {data:[...]} 형태로 주는 것 둘 다 방어
export async function fetchMembers() {
  const res = await apiClient.get("/api/admin/staff");

  const data = res.data;
  const arr = Array.isArray(data) ? data : (data?.data ?? []);

  // 서버 필드명이 user_id / email / admin_lev(or admin_level) 일 수 있어서 방어적으로 처리
  return arr.map((u) => {
    const level =
      u.admin_level !== undefined ? u.admin_level :
      u.admin_lev !== undefined ? u.admin_lev :
      u.adminLevel !== undefined ? u.adminLevel :
      0;

    return {
      id: u.user_id ?? u.userId ?? u.id,
      email: u.email ?? "",
      role: LEVEL_TO_ROLE[level] ?? "USER",
      // 원본도 필요하면 남겨둘 수 있음
      raw: u,
    };
  });
}

/**
 * ✅ 권한 수정 API
 * @param {number} adminId - 헤더 X-ADMIN-ID 로 들어감
 * @param {number} userId  - 수정 대상 유저 ID
 * @param {"USER"|"ADMIN"|"SUPER_ADMIN"} nextRole - 바꿀 권한(프론트 기준)
 */
export async function updateMemberRole(adminId, userId, nextRole) {
  const body = {
    user_id: userId,
    admin_level: ROLE_TO_LEVEL[nextRole],
  };

  // apiClient 사용하면 baseURL, 토큰 인터셉터 자동 적용됨
  // 헤더만 추가로 넣어주면 됨
  const res = await apiClient.put("/api/admin/staff", body, {
    headers: {
      "X-ADMIN-ID": String(adminId),
    },
  });

  // 응답 DTO: { user_id, username, admin_level, updated_at }
  const data = res.data;

  return {
    user_id: data.user_id,
    username: data.username,
    admin_level: data.admin_level,
    role: LEVEL_TO_ROLE[data.admin_level] ?? "USER",
    updated_at: data.updated_at,
    raw: data,
  };
}
