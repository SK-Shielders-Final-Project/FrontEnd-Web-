import React, { useMemo, useState } from "react";

export default function BikesPage() {
  // ✅ 더미 데이터
  const [q, setQ] = useState("");
  const [bikes, setBikes] = useState([
    { id: 1, label: "BIKE-001", status: "AVAILABLE" },
    { id: 2, label: "BIKE-002", status: "IN_USE" },
    { id: 3, label: "BIKE-003", status: "REPAIR" },
  ]);

  const filtered = useMemo(() => {
    if (!q.trim()) return bikes;
    const keyword = q.trim().toLowerCase();
    return bikes.filter((b) => b.label.toLowerCase().includes(keyword));
  }, [q, bikes]);

  function changeStatus(id, status) {
    // ✅ 지금은 프론트에서 상태만 바꿔보는 더미 동작
    setBikes((prev) => prev.map((b) => (b.id === id ? { ...b, status } : b)));
  }

  return React.createElement(
    "div",
    null,
    React.createElement("h3", null, "자전거 리스트"),
    React.createElement(
      "div",
      { style: { display: "flex", gap: 8, marginBottom: 12 } },
      React.createElement("input", {
        value: q,
        onChange: (e) => setQ(e.target.value),
        placeholder: "조회/검색 (예: BIKE-001)",
        style: { padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", flex: 1 },
      }),
      React.createElement(
        "button",
        { style: { padding: "10px 12px", borderRadius: 8, border: "1px solid #333", background: "#fff" } },
        "검색"
      )
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
          React.createElement("th", { style: tableStyles.th }, "LABEL"),
          React.createElement("th", { style: tableStyles.th }, "STATUS"),
          React.createElement("th", { style: tableStyles.th }, "상태 수정")
        )
      ),
      React.createElement(
        "tbody",
        null,
        filtered.map((b) =>
          React.createElement(
            "tr",
            { key: b.id },
            React.createElement("td", { style: tableStyles.td }, String(b.id)),
            React.createElement("td", { style: tableStyles.td }, b.label),
            React.createElement("td", { style: tableStyles.td }, b.status),
            React.createElement(
              "td",
              { style: tableStyles.td },
              React.createElement(
                "select",
                {
                  value: b.status,
                  onChange: (e) => changeStatus(b.id, e.target.value),
                },
                React.createElement("option", { value: "AVAILABLE" }, "AVAILABLE"),
                React.createElement("option", { value: "IN_USE" }, "IN_USE"),
                React.createElement("option", { value: "REPAIR" }, "REPAIR"),
                React.createElement("option", { value: "DISABLED" }, "DISABLED")
              )
            )
          )
        )
      )
    )
  );
}

const tableStyles = {
  table: { width: "100%", borderCollapse: "collapse", background: "#fff", borderRadius: 10, overflow: "hidden" },
  th: { borderBottom: "1px solid #ddd", padding: 10, textAlign: "left", background: "#f5f5f5" },
  td: { borderBottom: "1px solid #eee", padding: 10 },
};
