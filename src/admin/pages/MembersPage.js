import React from "react";

export default function MembersPage() {
  // ✅ 더미 데이터 (나중에 API 붙이면 이 부분만 교체)
  const members = [
    { id: 1, email: "user1@test.com", role: "USER" },
    { id: 2, email: "admin1@test.com", role: "ADMIN" },
  ];

  return React.createElement(
    "div",
    null,
    React.createElement("h3", null, "회원 정보 리스트 조회"),
    React.createElement(
      "p",
      { style: { color: "#666" } },
      "※ 지금은 더미 데이터입니다. 나중에 백엔드 API로 교체합니다."
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
          React.createElement("th", { style: tableStyles.th }, "ROLE")
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
            React.createElement("td", { style: tableStyles.td }, m.role)
          )
        )
      )
    ),
    React.createElement(
      "div",
      { style: { marginTop: 12, color: "#666" } },
      "권한 수정(SUPER_ADMIN 전용)은 다음 단계에서 붙입니다."
    )
  );
}

const tableStyles = {
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 10, overflow: "hidden" },
  th: { borderBottom: "1px solid #ddd", padding: 10, textAlign: "left", background: "#f5f5f5" },
  td: { borderBottom: "1px solid #eee", padding: 10 },
};
