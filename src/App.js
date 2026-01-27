import React, { useState, useEffect } from 'react';
import './App.css';
import { jwtDecode } from 'jwt-decode'; // Import the decoder
import LoginPage from './login/LoginPage';
import ProtectedRoute from './auth/ProtectedRoute';
import PaymentPage from './payment/PaymentPage';
import InquiryPage from './inquiry/InquiryPage';
import { BrowserRouter, Route, Routes, Navigate, Outlet } from 'react-router-dom';
import MainPage from './MainPage';
import Layout from './Layout';
import ChargePointPage from './payment/ChargePointPage';
import SuccessPage from './payment/SuccessPage';
import FailPage from './payment/FailPage';
import UsePointPage from './payment/UsePointPage';
import HistoryPage from './mypage/HistoryPage';
import RefundRequestPage from './mypage/RefundRequestPage';
import CouponPage from './payment/CouponPage';
import SignupPage from './signup/SignupPage';
import RequestPasswordResetPage from './password-reset/RequestPasswordResetPage';
import ResetPasswordPage from './password-reset/ResetPasswordPage';
import MyPage from './mypage/MyPage';
import ViewProfilePage from './mypage/ViewProfilePage';
import EditProfilePage from './mypage/EditProfilePage';
import ChangePasswordPage from './mypage/ChangePasswordPage';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // This effect runs only once when the app first loads.
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
                            // Check if the token is expired
                            if (decodedToken.exp * 1000 < Date.now()) {
                              localStorage.removeItem('token');
                              localStorage.removeItem('userId'); // Also remove userId
                              setUser(null);
                            } else {
                              // Token exists and is not expired
                              setUser({ loggedIn: true });
                            }
      } catch (e) {
        // If token is malformed, remove it
        localStorage.removeItem('token');
        localStorage.removeItem('userId'); // Also remove userId
        setUser(null);
      }
    } else {
      // Also clear userId if token doesn't exist, for safety
      localStorage.removeItem('userId');
      setUser(null);
    }
    setLoading(false); // We are done checking, so set loading to false.
  }, []); // Empty array, runs only once.

  const handleLogout = () => {
    localStorage.setItem('isLoggingOut', 'true'); // Set flag before logout
    localStorage.removeItem('token');
    localStorage.removeItem('userId'); // Remove userId on logout
    setUser(null);
    setError(null);
    window.location.href = '/login';
  };

  return (
    <BrowserRouter>
      <Routes>
        {/* Pass the error state to the Layout component */}
        <Route path="/" element={<Layout user={user} error={error} onLogout={handleLogout} />}>
          <Route index element={<MainPage />} />
          <Route path="login" element={<LoginPage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="password-reset-request" element={<RequestPasswordResetPage />} />
          <Route path="password-reset" element={<ResetPasswordPage />} />
          <Route
            path="payment"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <Outlet />
              </ProtectedRoute>
            }
          >
            <Route index element={<PaymentPage />}/>
            <Route path="charge" element={<ChargePointPage />} />
            <Route path="success" element={<SuccessPage />} />
            <Route path="fail" element={<FailPage />} />
            <Route path="use" element={<UsePointPage />} />          
            <Route path="coupon" element={<CouponPage />} />
          </Route>
          <Route
            path="refund"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <RefundRequestPage />
              </ProtectedRoute>
              }
          />
           <Route
            path="history"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <HistoryPage />
              </ProtectedRoute>
            }
          />
          <Route 
            path="mypage"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <MyPage />
              </ProtectedRoute>
            }
          >
            <Route index element={<Navigate to="view" replace />} />
            <Route path="view" element={<ViewProfilePage />} />
            <Route path="edit" element={<EditProfilePage />} />
            <Route path="change-password" element={<ChangePasswordPage />} />
          </Route>
          <Route path="inquiry" element={<InquiryPage />} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
