import React from "react";

export default function Sidebar(props) {
  const { page, setPage } = props;

  function MenuButton(label, value) {
    const active = page === value;

    return React.createElement(
      "button",
      {
        onClick: () => setPage(value),
        style: {
          padding: "10px 12px",
          textAlign: "left",
          borderRadius: 8,
          border: "1px solid #ddd",
          background: active ? "#f2f2f2" : "#fff",
          cursor: "pointer",
        },
      },
      label
    );
  }

  return React.createElement(
    "aside",
    { style: styles.aside },
    React.createElement("h3", { style: styles.title }, "관리자 메뉴"),
    React.createElement("div", { style: styles.menu }, 
      MenuButton("회원 정보 리스트 조회", "MEMBERS"),
      MenuButton("문의 사항 전체 조회", "INQUIRIES"),
      MenuButton("자전거 리스트", "BIKES")
    )
  );
}

const styles = {
  aside: {
    width: 260,
    padding: 14,
    borderRight: "1px solid #ddd",
    background: "#fff",
  },
  title: { margin: "6px 0 12px" },
  menu: { display: "grid", gap: 10 },
};
