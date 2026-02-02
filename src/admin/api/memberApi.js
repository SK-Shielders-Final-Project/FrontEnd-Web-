import apiClient from "../../api/axiosConfig";

/**
 * 백엔드 admin_level 숫자값을 프론트용 문자열로 매핑
 */
export const LEVEL_TO_ROLE = {
  0: "USER",
  1: "ADMIN",
  2: "SUPER_ADMIN",
};

/**
 * 프론트용 문자열을 백엔드용 숫자값으로 매핑
 */
export const ROLE_TO_LEVEL = {
  USER: 0,
  ADMIN: 1,
  SUPER_ADMIN: 2,
};

/**
 * ✅ 전체 직원 목록 조회
 * DTO 필드: user_id, email, admin_level, user_name, name, phone, card_number
 */
export async function fetchMembers() {
  try {
    const res = await apiClient.get("/api/admin/staff");
    
    // 데이터 추출 (배열 형태 보장)
    const data = res.data;
    const rawList = Array.isArray(data) ? data : (data?.data ?? []);

    // 프론트엔드에서 쓰기 편하게 가공 (CamelCase 변환 및 Role 매핑)
    return rawList.map((u) => ({
      id: u.user_id,             // Long user_id
      email: u.email ?? "",      // String email
      userName: u.user_name,     // Long user_name (DTO에 맞춰 추가)
      name: u.name,              // Long name (DTO에 맞춰 추가)
      phone: u.phone,            // Integer phone

      role: LEVEL_TO_ROLE[u.admin_level] ?? "USER",
      level: u.admin_level,      // 원본 레벨 값
      raw: u,                    // 원본 데이터 전체 (필요시 대비)
    }));
  } catch (error) {
    console.error("fetchMembers Error:", error);
    throw error;
  }
}

/**
 * ✅ 특정 직원의 권한(Role) 수정
 * @param {number} adminId - 요청을 수행하는 관리자의 ID (X-ADMIN-ID 헤더)
 * @param {number} userId - 수정 대상 유저의 ID
 * @param {string} nextRole - 변경할 역할 ("USER", "ADMIN", "SUPER_ADMIN")
 */
export async function updateMemberRole(adminId, userId, nextRole) {
  const body = {
    user_id: userId,
    admin_level: ROLE_TO_LEVEL[nextRole],
  };

  try {
    const res = await apiClient.put("/api/admin/staff", body, {
      headers: {
        "X-ADMIN-ID": String(adminId),
      },
    });

    const data = res.data;

    // 수정 완료 후 반환 데이터 가공
    return {
      id: data.user_id,
      name: data.name,
      userName: data.user_name,
      level: data.admin_level,
      role: LEVEL_TO_ROLE[data.admin_level] ?? "USER",
      updatedAt: data.updated_at,
    };
  } catch (error) {
    console.error("updateMemberRole Error:", error);
    throw error;
  }
}