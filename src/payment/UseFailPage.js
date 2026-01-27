import React from 'react';
import './UsePointPage.css';

const UseFailPage = ({ errorMessage, onRetry }) => {
  return (
    <div className="payment-container fail">
      <h2>🚫 결제 실패</h2>
      <p className="description">요청을 처리하는 중 문제가 발생했습니다.</p>
      
      <div className="error-box">
        <p><strong>오류 내용:</strong></p>
        <p>{errorMessage}</p>
      </div>

      <button className="btn btn-fail" onClick={onRetry}>
        다시 시도하기
      </button>
    </div>
  );
};

export default UseFailPage;