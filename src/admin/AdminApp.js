import React, { useState } from "react";
import { Routes, Route, useNavigate, Navigate } from "react-router-dom";
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

// 대시보드 임시 컴포넌트
const AdminDashboardPage = () => <div>관리자 대시보드</div>;

export default function AdminApp() {
  const navigate = useNavigate();
  // 쿠키 존재 여부로 로그인 상태 관리
  const [adminLoggedIn, setAdminLoggedIn] = useState(!!getCookie('adminToken'));

  const handleAdminLoginSuccess = (token, userId, refreshToken, is2faEnabled) => {
    const decodedToken = jwtDecode(token);
    const adminLevel = decodedToken.level; 

    setCookie('adminToken', token, 1);
    setCookie('adminId', userId, 1);
    setCookie('adminRefreshToken', refreshToken, 7);
    setCookie('adminLevel', adminLevel, 1);
    
    setAdminLoggedIn(true);

    // 2FA 상태에 따라 리다이렉트 처리
    if (is2faEnabled) {
      // 2FA가 활성화되어 있으면, OTP 인증 페이지로 이동
      navigate('/admin/otp-verify', { state: { is2faEnabled: true } });
    } else {
      // 2FA가 비활성화 상태이면, 2FA 설정 페이지로 이동
      navigate('/admin/setup-2fa', { state: { is2faEnabled: false } });
    }
    // 로그인 직후에는 2FA 설정을 먼저 하도록 유도하거나 대시보드로 이동
    navigate('/admin/dashboard');
  };

  const handleAdminLogout = () => {
    logoutAdmin();
    setAdminLoggedIn(false);
    navigate('/admin', { replace: true });
  };

  return (
    <Routes>
      {/* 1. 로그인하지 않은 사용자가 보는 페이지 */}
      {!adminLoggedIn ? (
        <>
          <Route path="/" element={<LoginPage onLoginSuccess={handleAdminLoginSuccess} />} />
          <Route path="setup-2fa" element={<TwoFactorSetupPage />} />
          <Route path="otp-verify" element={<OtpVerificationPage />} />
          <Route path="*" element={<Navigate to="/admin" replace />} />
        </>
      ) : (
        /* 2. 로그인한 관리자만 접근 가능한 페이지 (AdminLayout 적용) */
        <Route path="/" element={<AdminLayout onLogout={handleAdminLogout} />}>
          <Route index element={<Navigate to="dashboard" replace />} />
          <Route path="dashboard" element={<AdminDashboardPage />} />
          <Route path="inquiries" element={<InquiriesPage />} />
          <Route path="bikes" element={<BikesPage />} />
          <Route path="members" element={<MembersPage />} />
          <Route path="email-templates" element={<EmailTemplatePage />} />
          <Route path="setup-2fa" element={<TwoFactorSetupPage />} />
          <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
      )}
    </Routes>
  );
}