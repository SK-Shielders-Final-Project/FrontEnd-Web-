import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import CryptoJS from 'crypto-js';
import { getUsernameFromToken } from '../utils/jwtUtils';
import './PointGiftPage.css';

const PointGiftPage = () => {
  const navigate = useNavigate();
  const [receiverName, setReceiverName] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  // 페이지 들어오자마자 키가 있는지 검사
  useEffect(() => {
      const savedKey = localStorage.getItem('sessionKey');
      if (!savedKey) {
          alert("보안 키가 없습니다. 다시 로그인해주세요.");
          navigate('/login');
      }
  }, [navigate]);

  const handleGiftSend = async () => {
    if (!receiverName || !amount) return;

    const myUsername = getUsernameFromToken();
    setLoading(true);

    try {
      // 데이터 준비
      const payload = {
        senderName: myUsername,
        receiverName: receiverName,
        amount: parseInt(amount, 10)
      };

      // AES 암호화
      const keyParsed = CryptoJS.enc.Utf8.parse(localStorage.getItem('sessionKey'));
      const encryptedPayload = CryptoJS.AES.encrypt(
        JSON.stringify(payload), 
        keyParsed, 
        { mode: CryptoJS.mode.ECB, padding: CryptoJS.pad.Pkcs7 }
      ).toString();

      // 전송
      const giftRes = await api.post('/api/user/point/gift', { 
          encryptedPayload: encryptedPayload 
      });

      console.log("성공:", giftRes.data);
      alert("🎁 포인트 선물이 완료되었습니다!");
      navigate('/payment');

    } catch (error) {
      console.error("실패:", error);
      alert("오류: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gift-page-container">
      <h2 className="gift-title">🎁 포인트 선물하기</h2>
      <p className="gift-subtitle">소중한 마음을 포인트로 전하세요.</p>

      <div className="gift-form-card">
        <div className="input-group">
          <label>받는 사람 ID</label>
          <input 
            type="text" 
            placeholder="예: friend123"
            value={receiverName}
            onChange={(e) => setReceiverName(e.target.value)}
          />
        </div>

        <div className="input-group">
          <label>선물할 금액 (P)</label>
          <input 
            type="number" 
            placeholder="금액 입력"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        <div className="button-group">
          <button className="btn-cancel" onClick={() => navigate(-1)}>취소</button>
          <button className="btn-send" onClick={handleGiftSend} disabled={loading}>
            {loading ? '암호화 전송 중...' : '선물 보내기'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PointGiftPage;