import React, { useState, useEffect } from "react";
import { Routes, Route, useNavigate, Navigate, useLocation } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import OtpVerificationPage from "./pages/OtpVerificationPage";
import AdminLayout from "./layout/AdminLayout";
import InquiriesPage from "./pages/InquiriesPage";
import BikesPage from "./pages/BikesPage";
import MembersPage from "./pages/MembersPage";
import TwoFactorSetupPage from "./pages/TwoFactorSetupPage";
import EmailTemplatePage from "./pages/EmailTemplatePage";
import { logoutAdmin } from "../auth/authUtils";
import { getCookie, setCookie } from "../utils/cookie";
import { jwtDecode } from "jwt-decode";

const AdminDashboardPage = () => <div>관리자 대시보드</div>;

const ProtectedAdminRoute = ({ children }) => {
  const adminToken = getCookie('adminToken');
  return adminToken ? children : <Navigate to="/admin" replace />;
};

export default function AdminApp() {
  const navigate = useNavigate();
  const location = useLocation();
  const [adminLoggedIn, setAdminLoggedIn] = useState(!!getCookie('adminToken'));

  const handleAdminLoginSuccess = (token, userId, refreshToken) => {
    const decodedToken = jwtDecode(token);
    const adminLevel = decodedToken.level; 

    setCookie('adminToken', token, 1);
    setCookie('adminId', userId, 1);
    setCookie('adminRefreshToken', refreshToken, 7);
    setCookie('adminLevel', adminLevel, 1);
    setAdminLoggedIn(true);
    navigate('/admin/dashboard');
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setAdminLoggedIn(false);
    navigate('/admin', { replace: true });
  };

  return (
    <Routes>
      {/* Top-level Route for '/admin' (base path of AdminApp) */}
      <Route path="/*" element={
        adminLoggedIn ? (
          <AdminLayout onLogout={handleAdminLogout} />
        ) : ( // If not logged in, render specific auth pages or redirect to default login
          location.pathname === '/admin/otp-verify' ? (
            <OtpVerificationPage />
          ) : location.pathname === '/admin/setup-2fa' ? (
            <TwoFactorSetupPage />
          ) : (
            <LoginPage onLoginSuccess={handleAdminLoginSuccess} /> // Keep onLoginSuccess prop if it's explicitly needed for something
          )
        )
      }>
        {/* These nested routes are only active if AdminLayout is rendered (i.e., adminLoggedIn is true) */}
        {adminLoggedIn && (
          <>
            <Route index element={<Navigate to="dashboard" replace />} /> {/* /admin/ default to dashboard */}
            <Route path="dashboard" element={<ProtectedAdminRoute><AdminDashboardPage /></ProtectedAdminRoute>} />
            <Route path="setup-2fa" element={<ProtectedAdminRoute><TwoFactorSetupPage /></ProtectedAdminRoute>} />
            <Route path="inquiries" element={<ProtectedAdminRoute><InquiriesPage /></ProtectedAdminRoute>} />
            <Route path="bikes" element={<ProtectedAdminRoute><BikesPage /></ProtectedAdminRoute>} />
            <Route path="members" element={<ProtectedAdminRoute><MembersPage /></ProtectedAdminRoute>} />
            <Route path="*" element={<Navigate to="/admin/dashboard" replace />} /> {/* Catch-all for logged in */}
          </>
        )}
      <Route path="/" element={<AdminLayout onLogout={handleAdminLogout} />}>
        {/* Default route for /admin, redirect to dashboard if logged in */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="dashboard" element={<ProtectedAdminRoute><AdminDashboardPage /></ProtectedAdminRoute>} />
        <Route path="inquiries" element={<ProtectedAdminRoute><InquiriesPage /></ProtectedAdminRoute>} />
        <Route path="bikes" element={<ProtectedAdminRoute><BikesPage /></ProtectedAdminRoute>} />
        <Route path="members" element={<ProtectedAdminRoute><MembersPage /></ProtectedAdminRoute>} />
        <Route path="email-templates" element={<ProtectedAdminRoute><EmailTemplatePage /></ProtectedAdminRoute>} />
        {/* Catch-all for any unmatched admin sub-routes, redirect to dashboard */}
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Route>
    </Routes>
  );
}