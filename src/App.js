import React, { useState, useEffect } from 'react';
import './App.css';
import { jwtDecode } from 'jwt-decode'; // Import the decoder
import LoginPage from './login/LoginPage';
import ProtectedRoute from './auth/ProtectedRoute';
import PaymentPage from './payment/PaymentPage';
import InquiryPage from './inquiry/InquiryPage';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import MainPage from './MainPage';
import Layout from './Layout';
import ChargePointPage from './payment/ChargePointPage';
import SuccessPage from './payment/SuccessPage';
import FailPage from './payment/FailPage';
import UsePointPage from './payment/UsePointPage';
import HistoryPage from './mypage/HistoryPage';
import SignupPage from './signup/SignupPage';

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
                              setUser(null);
                            } else {
                              // Token exists and is not expired
                              setUser({ loggedIn: true });
                            }
      } catch (e) {
        // If token is malformed, remove it
        localStorage.removeItem('token');
        setUser(null);
      }
    } else {
      setUser(null);
    }
    setLoading(false); // We are done checking, so set loading to false.
  }, []); // Empty array, runs only once.

  const handleLogout = () => {
    localStorage.removeItem('token');
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
          <Route
            path="payment"
            element={
              <ProtectedRoute user={user} loading={loading}>
                <PaymentPage />
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
          <Route path="inquiry" element={<InquiryPage />} />
          <Route path="payment/charge" element={<ChargePointPage />} />
          <Route path="payment/success" element={<SuccessPage />} />
          <Route path="payment/fail" element={<FailPage />} />
          <Route path="payment/use" element={<UsePointPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
