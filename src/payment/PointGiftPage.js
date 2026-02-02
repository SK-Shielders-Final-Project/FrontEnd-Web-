import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import JSEncrypt from 'jsencrypt';
import CryptoJS from 'crypto-js';
import { getUsernameFromToken } from '../utils/jwtUtils'; // 유틸 함수 import 필요
import './PointGiftPage.css';

// [취약점] Math.random()을 이용해 허술한 키 생성 (문자열 반환)
function generateWeakKey() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 16; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result; // 예: "A1b2C3d4..."
}

const PointGiftPage = () => {
  const navigate = useNavigate();
  
  const [receiverName, setReceiverName] = useState(''); // 변수명 수정
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGiftSend = async () => {
    if (!receiverName || !amount) {
      alert("받는 사람과 금액을 입력해주세요.");
      return;
    }
    
    // 1. 유틸 함수로 username 가져오기
    const myUsername = getUsernameFromToken();
    if (!myUsername) {
      alert("로그인 정보가 올바르지 않습니다.");
      return;
    }
    console.log("내 아이디:", myUsername);

    setLoading(true);

    try {
      // --- [Step 1: 공개키 요청] ---
      // apiClient를 쓰면 headers에 토큰을 자동으로 넣어주므로 생략 가능
      const publicKeyRes = await api.get('/api/user/crypto/public-key');
      const serverPublicKey = publicKeyRes.data.publicKey;

      // --- [Step 1.5: 취약한 대칭키 생성] ---
      const aesKeyStr = generateWeakKey(); 
      console.log("😈 생성된 취약한 키:", aesKeyStr);

      // --- [Step 2: 키 교환 (RSA)] ---
      const encryptor = new JSEncrypt();
      encryptor.setPublicKey(serverPublicKey);
      // aesKeyStr는 문자열이므로 바로 암호화 가능
      const encryptedAesKey = encryptor.encrypt(aesKeyStr); 

      await api.post('/api/user/crypto/exchange-key', 
        { encryptedSymmetricKey: encryptedAesKey }
      );

      // --- [Step 3: 데이터 전송 (AES)] ---
      const payload = {
        senderName: myUsername,
        receiverName: receiverName,
        amount: parseInt(amount, 10)
      };

      // ★ 중요: 취약한 키(String)를 CryptoJS Key 객체로 변환
      // Base64가 아니라 Utf8로 파싱해야 합니다!
      const keyParsed = CryptoJS.enc.Utf8.parse(aesKeyStr);

      const encryptedPayload = CryptoJS.AES.encrypt(
        JSON.stringify(payload), 
        keyParsed, 
        { 
            mode: CryptoJS.mode.ECB, 
            padding: CryptoJS.pad.Pkcs7 // Java PKCS5와 호환
        }
      ).toString();

      const giftRes = await api.post('/api/user/point/gift',
        { encryptedPayload: encryptedPayload }
      );

      console.log("성공:", giftRes.data);
      alert("🎁 포인트 선물이 완료되었습니다!");
      navigate('/payment');

    } catch (error) {
      console.error("실패:", error);
      const msg = error.response?.data?.message || error.response?.data || error.message;
      alert("오류 발생: " + msg);
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