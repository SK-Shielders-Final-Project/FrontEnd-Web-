import React, { useState } from "react";

export default function InquiriesPage() {
  // ✅ 더미 데이터
  const [selectedId, setSelectedId] = useState(null);

  const inquiries = [
    { id: 101, title: "문의 1", status: "OPEN" },
    { id: 102, title: "문의 2", status: "DONE" },
  ];

  function renderDetail() {
    if (!selectedId) {
      return React.createElement("div", { style: { color: "#666" } }, "왼쪽에서 문의를 선택하세요.");
    }

    return React.createElement(
      "div",
      { style: box.card },
      React.createElement("h4", null, `문의 상세 #${selectedId}`),
      React.createElement("p", null, "여기에 문의 내용이 들어갑니다 (더미)."),
      React.createElement("p", { style: { color: "#666" } }, "파일 다운로드/댓글 작성은 다음 단계에서 붙입니다.")
    );
  }

  return React.createElement(
    "div",
    null,
    React.createElement("h3", null, "문의 사항 전체 조회"),
    React.createElement(
      "div",
      { style: box.grid },
      React.createElement(
        "div",
        { style: box.card },
        inquiries.map((q) =>
          React.createElement(
            "div",
            {
              key: q.id,
              style: {
                padding: 10,
                borderRadius: 8,
                border: "1px solid #ddd",
                cursor: "pointer",
                background: selectedId === q.id ? "#f2f2f2" : "#fff",
                marginBottom: 8,
              },
              onClick: () => setSelectedId(q.id),
            },
            `${q.title} (${q.status})`
          )
        )
      ),
      renderDetail()
    )
  );
}

const box = {
  grid: { display: "grid", gridTemplateColumns: "320px 1fr", gap: 12 },
  card: { padding: 12, border: "1px solid #ddd", borderRadius: 10, background: "#fff" },
};
