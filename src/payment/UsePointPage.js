import React, { useState } from 'react';
import UseSuccessPage from './UseSuccessPage'; // 파일 분리됨
import UseFailPage from './UseFailPage';       // 파일 분리됨
import './UsePointPage.css';
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom'; 

const UsePointPage = () => {
  // 화면 상태: 'INPUT' | 'LOADING' | 'SUCCESS' | 'FAIL'
  const [viewState, setViewState] = useState('INPUT');
  const navigate = useNavigate();

  // 입력 상태
  const [bikeId, setBikeId] = useState('');
  const [hoursToUse, setHoursToUse] = useState(1);

  // 결과 데이터 (RentalResponseDto 구조)
  const [responseData, setResponseData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const POINT_PER_HOUR = 1000;

  // 결제 핸들러
  const handlePayment = async () => {
    // 1. 입력값 검증
    if (!bikeId) {
      alert('자전거 번호를 입력해주세요.');
      return;
    }

    const cost = hoursToUse * POINT_PER_HOUR;
    if (!window.confirm(`${hoursToUse}시간 이용권을 구매하시겠습니까?\n(${cost.toLocaleString()} 포인트 차감)`)) {
      return;
    }

    setViewState('LOADING');

    // 2. Request DTO 생성
    const requestDto = {
      hoursToUse: parseInt(hoursToUse),
      bikeId: parseInt(bikeId) // Long 타입
    };

    try {

      const response = await axios.post('/api/user/point', requestDto);
      const result = response.data;
      
      setResponseData(result);
      setViewState('SUCCESS');

    } catch (error) {
      console.error(error);
      setErrorMessage(error.response?.data?.message || "서버 연결에 실패했습니다.");
      setViewState('FAIL');
    }
  };

  // 1. 성공 화면 (백엔드 데이터 전달)
  if (viewState === 'SUCCESS' && responseData) {
    return (
      <UseSuccessPage 
        responseDto={responseData} 
        onConfirm={() => {
          navigate('/');
        }} 
      />
    );
  }

  // 2. 실패 화면
  if (viewState === 'FAIL') {
    return (
      <UseFailPage 
        errorMessage={errorMessage} 
        onRetry={() => setViewState('INPUT')} 
      />
    );
  }

  // 3. 입력(메인) 화면
  return (
    <div className="payment-container">
      <h2>🚲 포인트로 이용권 구매</h2>
      
      <div className="form-group">
        <label className="form-label">자전거 번호</label>
        <input 
          type="number" 
          className="input-field"
          placeholder="자전거에 적힌 번호 입력"
          value={bikeId}
          onChange={(e) => setBikeId(e.target.value)}
        />
      </div>

      <div className="form-group">
        <label className="form-label">이용 시간</label>
        <div className="time-selector">
          <button className="time-btn" onClick={() => setHoursToUse(Math.max(1, hoursToUse - 1))}>-</button>
          <span className="time-display">{hoursToUse}시간</span>
          <button className="time-btn" onClick={() => setHoursToUse(hoursToUse + 1)}>+</button>
        </div>
      </div>

      <div className="summary-box">
        <div className="info-row">
          <span>시간당 요금</span>
          <span>{POINT_PER_HOUR.toLocaleString()} P</span>
        </div>
        <hr className="divider" />
        <div className="info-row total">
          <strong>결제 예정 금액</strong>
          <strong className="point-text warning">
            {(hoursToUse * POINT_PER_HOUR).toLocaleString()} P
          </strong>
        </div>
      </div>

      <button 
        className="btn btn-primary"
        onClick={handlePayment}
        disabled={viewState === 'LOADING'}
      >
        {viewState === 'LOADING' ? '처리 중...' : '결제하기'}
      </button>
    </div>
  );
};

export default UsePointPage;