import React from "react";
import { NavLink } from "react-router-dom";

export default function Sidebar() {

  function getNavLinkStyle({ isActive }) {
    return {
      padding: "10px 12px",
      textAlign: "left",
      borderRadius: 8,
      border: "1px solid #ddd",
      background: isActive ? "#f2f2f2" : "#fff",
      cursor: "pointer",
      textDecoration: "none", // Remove underline
      color: "inherit", // Inherit text color
    };
  }

  return React.createElement(
    "aside",
    { style: styles.aside },
    React.createElement("h3", { style: styles.title }, "관리자 메뉴"),
    React.createElement("div", { style: styles.menu },
      React.createElement(NavLink, { to: "/admin/dashboard", style: getNavLinkStyle }, "대시보드"),
      React.createElement(NavLink, { to: "/admin/members", style: getNavLinkStyle }, "회원 정보 리스트 조회"),
      React.createElement(NavLink, { to: "/admin/inquiries", style: getNavLinkStyle }, "문의 사항 전체 조회"),
      React.createElement(NavLink, { to: "/admin/bikes", style: getNavLinkStyle }, "자전거 리스트")
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
