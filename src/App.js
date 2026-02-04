import React, { useState } from 'react';
import './App.css';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, Outlet } from 'react-router-dom';
import LoginPage from './login/LoginPage';
import AdminApp from './admin/AdminApp';
import { AuthProvider, useAuth } from './components/auth/AuthContext';
import ProtectedRoute from './auth/ProtectedRoute';
import MainPage from './MainPage';
import Layout from './Layout';

// User-facing page imports
import SignupPage from './signup/SignupPage';
import InquiryPage from './inquiry/InquiryPage';
import RequestPasswordResetPage from './password-reset/RequestPasswordResetPage';
import ResetPasswordPage from './password-reset/ResetPasswordPage';

// Mypage imports
import MyPage from './mypage/MyPage';
import ViewProfilePage from './mypage/ViewProfilePage';
import EditProfilePage from './mypage/EditProfilePage';
import ChangePasswordPage from './mypage/ChangePasswordPage';
import HistoryPage from './mypage/HistoryPage';
import RefundRequestPage from './mypage/RefundRequestPage';

// Payment imports
import PaymentPage from './payment/PaymentPage';
import ChargePointPage from './payment/ChargePointPage';
import CouponPage from './payment/CouponPage';
import SuccessPage from './payment/SuccessPage';
import FailPage from './payment/FailPage';
import UsePointPage from './payment/UsePointPage';
import PointGiftPage from './payment/PointGiftPage';
import PointGiftHistoryPage from './mypage/PointGiftHistoryPage';



function AppContent() {
  const { isLoggedIn, userId, logout, loading } = useAuth();
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const user = isLoggedIn ? { loggedIn: isLoggedIn, userId: userId } : null;

  const handleLogout = () => {
    logout(); // Use the centralized logout function from AuthContext
    setError(null); // Clear any local error state
    // The logout() function already handles navigation to /login, so no need for navigate('/') here
  };

  return (
    <Routes>
      <Route path="/" element={<Layout user={user} error={error} onLogout={handleLogout} />}>
        <Route index element={<MainPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="signup" element={<SignupPage />} />
        <Route path="inquiry" element={<ProtectedRoute user={isLoggedIn} loading={loading}><InquiryPage /></ProtectedRoute>} />
        <Route path="password-reset-request" element={<RequestPasswordResetPage />} />
        <Route path="password-reset" element={<ResetPasswordPage />} />

        {/* Mypage Routes */}
        <Route path="mypage" element={<ProtectedRoute user={isLoggedIn} loading={loading}><MyPage /></ProtectedRoute>}>
          <Route index element={<Navigate to="view" replace />} />
          <Route path="view" element={<ViewProfilePage />} />
          <Route path="edit" element={<EditProfilePage />} />
          <Route path="change-password" element={<ChangePasswordPage />} />
          <Route path="history" element={<HistoryPage />} />
          <Route path="gift-history" element={<PointGiftHistoryPage />} />
        </Route>

        {/* Payment Routes */}
        <Route path="payment" element={<ProtectedRoute user={isLoggedIn} loading={loading}><Outlet /></ProtectedRoute>}>
          <Route index element={<PaymentPage/>} />
        
          <Route path="charge" element={<ChargePointPage />} />
          <Route path="coupon" element={<CouponPage />} />
          <Route path="success" element={<SuccessPage />} />
          <Route path="fail" element={<FailPage />} />
          <Route path="use" element={<UsePointPage />} />
          <Route path="gift" element={<PointGiftPage />} />
        </Route>

        {/* Top-level History route as in Layout.js link */}
        <Route path="history" element={<ProtectedRoute user={isLoggedIn} loading={loading}><HistoryPage /></ProtectedRoute>} />
        <Route path="refund" element={<ProtectedRoute user={isLoggedIn} loading={loading}><RefundRequestPage /></ProtectedRoute>} />

        {/* Fallback for unmatched routes within the Layout */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>

      <Route path="/admin/*" element={<AdminApp />} />
      {/* Fallback for unmatched routes outside /admin, should ideally be a 404 page */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppContent />
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
