import React, { useState, useEffect } from 'react';
import './App.css';
import mockUser from './response.json';

import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Layout from './Layout';
import MainPage from './MainPage';
import LoginPage from './login/LoginPage';
import PaymentPage from './payment/PaymentPage';
import InquiryPage from './inquiry/InquiryPage';

import ChargePointPage from './payment/ChargePointPage';
import SuccessPage from './payment/SuccessPage';
import FailPage from './payment/FailPage';
import UsePointPage from './payment/UsePointPage';

import HistoryPage from './mypage/HistoryPage';
import RefundRequestPage from './mypage/RefundRequestPage';

function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  // (임시) user 확인 로직
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/user/info/1`);
        if (!response.ok) throw new Error('Network response was not ok');
        const data = await response.json();
        setUser(data);
      } catch (err) {
        setError(err.message);
        // ✅ 개발/데모용: 실패하면 mock user 사용
        setUser(mockUser);
      }
    };

    fetchUser();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        {/* ✅ Layout에 user를 넘겨서 전역(챗봇 포함)에서 사용 가능 */}
        <Route path="/" element={<Layout user={user} />}>
          {/* ✅ 각 페이지에서도 user가 필요하면 내려줌 */}
          <Route index element={<MainPage user={user} />} />
          <Route path="login" element={<LoginPage user={user} setUser={setUser} />} />
          <Route path="payment" element={<PaymentPage user={user} />} />
          <Route path="inquiry" element={<InquiryPage user={user} />} />

          <Route path="payment/charge" element={<ChargePointPage user={user} />} />
          <Route path="payment/success" element={<SuccessPage user={user} />} />
          <Route path="payment/fail" element={<FailPage user={user} />} />
          <Route path="payment/use" element={<UsePointPage user={user} />} />

          <Route path="history" element={<HistoryPage user={user} />} />
          <Route path="refund" element={<RefundRequestPage user={user} />} />
        </Route>
      </Routes>

      {/* 필요하면 디버그용으로만 잠깐 사용 */}
      {/* {error && <div style={{position:'fixed', bottom: 10, left: 10}}>Error: {error}</div>} */}
    </BrowserRouter>
  );
}

export default App;
