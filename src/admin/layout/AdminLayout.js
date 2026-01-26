import React, { useState } from "react";
import Sidebar from "./Sidebar";
import MembersPage from "../pages/MembersPage";
import InquiriesPage from "../pages/InquiriesPage";
import BikesPage from "../pages/BikesPage";
import { adminLogout } from "../auth";

export default function AdminLayout(props) {
  const [page, setPage] = useState("MEMBERS");

  function renderPage() {
    if (page === "MEMBERS") return React.createElement(MembersPage);
    if (page === "INQUIRIES") return React.createElement(InquiriesPage);
    if (page === "BIKES") return React.createElement(BikesPage);
    return React.createElement("div", null, "페이지 없음");
  }

  function onLogout() {
    adminLogout();
    props.onLogout();
  }

  return React.createElement(
    "div",
    { style: styles.wrap },
    React.createElement(Sidebar, { page, setPage }),
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
      React.createElement("div", { style: styles.content }, renderPage())
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
