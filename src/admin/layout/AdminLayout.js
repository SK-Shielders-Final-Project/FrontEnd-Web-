import React from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import { adminLogout } from "../auth";

export default function AdminLayout(props) {
  function onLogout() {
    adminLogout();
    props.onLogout();
  }

  return React.createElement(
    "div",
    { style: styles.wrap },
    React.createElement(Sidebar, {}), // Sidebar no longer controls page state directly
    React.createElement(
      "main",
      { style: styles.main },
      React.createElement(
        "div",
        { style: styles.topbar },
        React.createElement("h2", { style: { margin: 0 } }, "관리자 페이지"),
        React.createElement(
          "button",
          { onClick: onLogout, style: styles.logout },
          "로그아웃"
        )
      ),
      React.createElement("div", { style: styles.content }, <Outlet />) // Render nested routes here
    )
  );
}

const styles = {
  wrap: { display: "flex", minHeight: "100vh", background: "#fafafa" },
  main: { flex: 1, padding: 16 },
  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    border: "1px solid #ddd",
    borderRadius: 10,
    background: "#fff",
  },
  logout: {
    padding: "8px 10px",
    borderRadius: 8,
    border: "1px solid #333",
    background: "#fff",
    cursor: "pointer",
  },
  content: { marginTop: 14 },
};
