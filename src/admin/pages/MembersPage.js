import React, { useState } from "react";

/* ===============================
   권한 매핑
================================ */
const ROLE_TO_LEVEL = {
  USER: 0,
  ADMIN: 1,
  SUPER_ADMIN: 2,
};

const LEVEL_TO_ROLE = {
  0: "USER",
  1: "ADMIN",
  2: "SUPER_ADMIN",
};

const ROLE_OPTIONS = ["USER", "ADMIN", "SUPER_ADMIN"];

// 실제 API
const API_UPDATE_ROLE = "/api/admin/staff";

// 임시 관리자 ID (로그인 붙이면 교체)
function getAdminId() {
  return 1;
}

export default function MembersPage() {
  // ✅ 아직 목록 API 없으니 더미
  const [members, setMembers] = useState([
    { id: 1, email: "user1@test.com", role: "USER" },
    { id: 2, email: "admin1@test.com", role: "ADMIN" },
  ]);

  const [savingId, setSavingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function onChangeRole(userId, nextRole) {
    setError("");
    setSuccess("");

    const prev = members;

    // 1️⃣ UI 먼저 변경 (낙관적 업데이트)
    setMembers((list) =>
      list.map((m) =>
        m.id === userId ? { ...m, role: nextRole } : m
      )
    );

    setSavingId(userId);

    try {
      const body = {
        user_id: userId,
        admin_level: ROLE_TO_LEVEL[nextRole], // ✅ DTO에 맞춤
      };

      const res = await fetch(API_UPDATE_ROLE, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "X-ADMIN-ID": String(getAdminId()),
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        throw new Error(`권한 수정 실패 (HTTP ${res.status})`);
      }

      const data = await res.json();

      // 🔁 서버 기준으로 다시 동기화
      setMembers((list) =>
        list.map((m) =>
          m.id === data.user_id
            ? { ...m, role: LEVEL_TO_ROLE[data.admin_level] }
            : m
        )
      );

      setSuccess("권한이 성공적으로 수정되었습니다.");
    } catch (e) {
      // 실패 시 롤백
      setMembers(prev);
      setError(e.message);
    } finally {
      setSavingId(null);
    }
  }

  return React.createElement(
    "div",
    null,
    React.createElement("h3", null, "회원 정보 리스트 조회"),

    error &&
      React.createElement(
        "div",
        { style: { color: "crimson", marginBottom: 8 } },
        error
      ),

    success &&
      React.createElement(
        "div",
        { style: { color: "green", marginBottom: 8 } },
        success
      ),

    React.createElement(
      "table",
      { style: tableStyles.table },
      React.createElement(
        "thead",
        null,
        React.createElement(
          "tr",
          null,
          ["ID", "EMAIL", "ROLE", "권한 수정"].map((h) =>
            React.createElement("th", { key: h, style: tableStyles.th }, h)
          )
        )
      ),
      React.createElement(
        "tbody",
        null,
        members.map((m) =>
          React.createElement(
            "tr",
            { key: m.id },
            React.createElement("td", { style: tableStyles.td }, m.id),
            React.createElement("td", { style: tableStyles.td }, m.email),
            React.createElement("td", { style: tableStyles.td }, m.role),
            React.createElement(
              "td",
              { style: tableStyles.td },
              React.createElement(
                "select",
                {
                  value: m.role,
                  disabled: savingId === m.id,
                  onChange: (e) =>
                    onChangeRole(m.id, e.target.value),
                },
                ROLE_OPTIONS.map((r) =>
                  React.createElement("option", { key: r, value: r }, r)
                )
              ),
              savingId === m.id &&
                React.createElement(
                  "span",
                  { style: { marginLeft: 8, fontSize: 12 } },
                  "저장중..."
                )
            )
          )
        )
      )
    )
  );
}

const tableStyles = {
  table: { width: "100%", borderCollapse: "collapse", background: "#fff" },
  th: { padding: 10, background: "#f5f5f5", textAlign: "left" },
  td: { padding: 10, borderBottom: "1px solid #eee" },
};
