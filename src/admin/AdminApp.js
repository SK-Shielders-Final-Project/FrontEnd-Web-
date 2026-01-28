import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminLayout from "./layout/AdminLayout";
import InquiriesPage from "./pages/InquiriesPage";
import BikesPage from "./pages/BikesPage";
import MembersPage from "./pages/MembersPage";
import { logoutAdmin } from "../auth/authUtils";

// Placeholder for DashboardPage if it doesn't exist yet
const AdminDashboardPage = () => <div>관리자 대시보드</div>;

const ProtectedAdminRoute = ({ children }) => {
  const adminToken = localStorage.getItem('adminToken');
  return adminToken ? children : <Navigate to="/admin" replace />;
};

export default function AdminApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminLoggedIn, setAdminLoggedIn] = useState(!!localStorage.getItem('adminToken'));

  const handleAdminLoginSuccess = (token, userId, refreshToken) => {
    localStorage.setItem('adminToken', token);
    localStorage.setItem('adminId', userId);
    localStorage.setItem('adminRefreshToken', refreshToken);
    setAdminLoggedIn(true);
    navigate('/admin/dashboard');
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setAdminLoggedIn(false); // State update after redirect helper is called
  };

  if (!adminLoggedIn) {
    // Render LoginPage if not logged in, which handles its own logic
    return <LoginPage onLoginSuccess={handleAdminLoginSuccess} />;
  }


  return (
    <Routes>
      <Route path="/" element={<AdminLayout onLogout={handleAdminLogout} />}>
        {/* Default route for /admin, redirect to dashboard if logged in */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ProtectedAdminRoute><AdminDashboardPage /></ProtectedAdminRoute>} />
        <Route path="inquiries" element={<ProtectedAdminRoute><InquiriesPage /></ProtectedAdminRoute>} />
        <Route path="bikes" element={<ProtectedAdminRoute><BikesPage /></ProtectedAdminRoute>} />
        <Route path="members" element={<ProtectedAdminRoute><MembersPage /></ProtectedAdminRoute>} />
        {/* Catch-all for any unmatched admin sub-routes, redirect to dashboard */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
       {/* Redirect non-matching /admin/* routes when logged in */}
       <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  );
}
