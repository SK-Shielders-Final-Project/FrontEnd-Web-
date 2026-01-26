import React, { useState } from "react";
import { isAdminLoggedIn } from "./auth";
import LoginPage from "./pages/LoginPage";
import AdminLayout from "./layout/AdminLayout";

export default function AdminApp() {
  // 최초 진입 시 로그인 여부 체크
  const [loggedIn, setLoggedIn] = useState(isAdminLoggedIn());

  if (!loggedIn) {
    return React.createElement(LoginPage, {
      onLoginSuccess: () => setLoggedIn(true),
    });
  }

  return React.createElement(AdminLayout, {
    onLogout: () => setLoggedIn(false),
  });
}
