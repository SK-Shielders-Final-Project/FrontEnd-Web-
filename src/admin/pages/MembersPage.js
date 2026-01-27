import React, { useState } from "react";

export default function MembersPage() {
  // ✅ 더미 데이터 (나중에 API 붙이면 이 부분만 교체)
  const [members, setMembers] = useState([
    { id: 1, email: "user1@test.com", role: "USER" },
    { id: 2, email: "admin1@test.com", role: "ADMIN" },
  ]);

  // 드롭다운에서 선택 가능한 권한 목록
  const ROLE_OPTIONS = ["USER", "ADMIN", "SUPER_ADMIN"];

  function onChangeRole(memberId, nextRole) {
    // (나중에 API 붙일 자리)
    // 1) 서버에 PATCH/PUT 요청 보내고
    // 2) 성공하면 setMembers로 반영
    // 지금은 프론트 더미 상태만 변경
    setMembers((prev) =>
      prev.map((m) => (m.id === memberId ? { ...m, role: nextRole } : m))
    );
  }

  return React.createElement(
    "div",
    null,
    React.createElement("h3", null, "회원 정보 리스트 조회"),
    React.createElement(
      "p",
      { style: { color: "#666" } },
      "※ 지금은 더미 데이터입니다. 드롭다운으로 권한 변경 UI만 구현했습니다."
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
          React.createElement("th", { style: tableStyles.th }, "ID"),
          React.createElement("th", { style: tableStyles.th }, "EMAIL"),
          React.createElement("th", { style: tableStyles.th }, "ROLE"),
          React.createElement("th", { style: tableStyles.th }, "권한 수정")
        )
      ),
      React.createElement(
        "tbody",
        null,
        members.map((m) =>
          React.createElement(
            "tr",
            { key: m.id },
            React.createElement("td", { style: tableStyles.td }, String(m.id)),
            React.createElement("td", { style: tableStyles.td }, m.email),
            // 현재 권한 표시는 남겨도 되고 빼도 됨 (지금은 남겨둠)
            React.createElement("td", { style: tableStyles.td }, m.role),
            // ✅ 드롭다운으로 수정
            React.createElement(
              "td",
              { style: tableStyles.td },
              React.createElement(
                "select",
                {
                  value: m.role,
                  onChange: (e) => onChangeRole(m.id, e.target.value),
                  style: tableStyles.select,
                },
                ROLE_OPTIONS.map((role) =>
                  React.createElement("option", { key: role, value: role }, role)
                )
              )
            )
          )
        )
      )
    ),
    React.createElement(
      "div",
      { style: { marginTop: 12, color: "#666" } },
      "※ 나중에 백엔드 API 연결 시, onChangeRole()에서 서버 업데이트 후 성공하면 상태를 갱신하도록 바꾸면 됩니다."
    )
  );
}

const tableStyles = {
  table: {
    width: "100%",
    borderCollapse: "collapse",
    background: "#fff",
    borderRadius: 10,
    overflow: "hidden",
  },
  th: {
    borderBottom: "1px solid #ddd",
    padding: 10,
    textAlign: "left",
    background: "#f5f5f5",
  },
  td: { borderBottom: "1px solid #eee", padding: 10 },
  select: {
    padding: "6px 8px",
    borderRadius: 6,
    border: "1px solid #ccc",
    background: "#fff",
    cursor: "pointer",
  },
};
