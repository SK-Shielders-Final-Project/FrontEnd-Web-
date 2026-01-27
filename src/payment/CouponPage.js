import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './CouponPage.css'; // 스타일 공유

const CouponPage = () => {
  const navigate = useNavigate();
  
  // 상태 관리
  const [couponCode, setCouponCode] = useState('');
  const [resultData, setResultData] = useState(null); 
  const [errorMsg, setErrorMsg] = useState('');

  // 쿠폰 등록 핸들러
  const handleRegister = async () => {
    if (!couponCode.trim()) {
      alert("쿠폰 번호를 입력해주세요.");
      return;
    }

    try {
      // API 호출 
      const response = await axios.post('/api/coupon/redeem', { couponCode: couponCode });
      const data = response.data;

      setResultData(data); 

    } catch (error) {
      console.error(error);
      setErrorMsg("유효하지 않은 쿠폰이거나 이미 사용된 쿠폰입니다.");
    }
  };

  // --- 렌더링: 성공 화면 (결과 보여주기) ---
  if (resultData) {
    return (
      <div className="charge-container">
        <h2 className="page-title">🎉 쿠폰 등록 완료!</h2>
        
        <div className="coupon-result-card">
          <p className="result-desc">포인트가 정상적으로 적립되었습니다.</p>
          
          <div className="result-row">
            <span>적립된 포인트</span>
            <strong className="highlight">+{resultData.rechargedPoint.toLocaleString()} P</strong>
          </div>
          
          <hr className="divider"/>
          
          <div className="result-row total">
            <span>나의 총 포인트</span>
            <strong>{resultData.totalPoint.toLocaleString()} P</strong>
          </div>

          <button className="btn-confirm" onClick={() => navigate('/payment')}>
            확인
          </button>
        </div>
      </div>
    );
  }

  // --- 렌더링: 입력 화면 (기본) ---
  return (
    <div className="charge-container">
      <h2 className="page-title">쿠폰 등록</h2>
      
      <div className="coupon-input-box">
        <p>가지고 계신 쿠폰 코드를 입력해주세요.</p>
        
        <input 
          type="text" 
          className="input-field"
          placeholder="쿠폰 번호 입력"
          value={couponCode}
          onChange={(e) => {
            setCouponCode(e.target.value);
            setErrorMsg(''); // 입력 시 에러 초기화
          }}
        />
        
        {errorMsg && <p className="error-msg">{errorMsg}</p>}

        <div className="btn-group">
          <button className="btn-cancel" onClick={() => navigate(-1)}>취소</button>
          <button className="btn-submit" onClick={handleRegister}>등록하기</button>
        </div>
      </div>
    </div>
  );
};

export default CouponPage;