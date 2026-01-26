import React from 'react';
import './UsePointPage.css'; // 스타일 공유

const UseSuccessPage = ({ responseDto, onConfirm }) => {
  // 백엔드 데이터: { userId, bikeId, currentPoint, startTime, endTime }
  
  // 날짜 포맷팅 (YYYY.MM.DD HH:mm)
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <div className="payment-container success">
      <h2>🎉 결제 완료</h2>
      <p className="description">이용권이 정상적으로 발급되었습니다.</p>
      
      <div className="receipt-card">
        {/* 자전거 번호 */}
        <div className="info-row">
          <span>자전거 번호</span>
          <strong>No. {responseDto.bikeId}</strong>
        </div>
        
        <hr className="divider" />
        
        {/* 시작 시간 (백엔드 데이터 기준) */}
        <div className="info-row">
          <span>시작 시간</span>
          <span>{formatDate(responseDto.startTime)}</span>
        </div>
        
        {/* 종료 시간 (백엔드 데이터 기준) */}
        <div className="info-row">
          <span>종료 시간</span>
          <span>{formatDate(responseDto.endTime)}</span>
        </div>

        <hr className="divider" />
        
        {/* 남은 포인트 (백엔드 데이터 기준) */}
        <div className="info-row total">
          <span>남은 포인트</span>
          <strong className="point-text">
            {responseDto.currentPoint.toLocaleString()} P
          </strong>
        </div>
      </div>

      <button className="btn btn-success" onClick={onConfirm}>
        확인
      </button>
    </div>
  );
};

export default UseSuccessPage;