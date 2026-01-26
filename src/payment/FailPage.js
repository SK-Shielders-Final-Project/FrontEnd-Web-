import React from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import './FailPage.css'; // ★ CSS 파일 import 필수!

const FailPage = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const message = searchParams.get('message') || "결제 중 오류가 발생했습니다.";
  const code = searchParams.get('code');

  return (
    <div className="fail-wrapper">
      <div className="fail-card">
        {/* 아이콘 */}
        <div className="fail-icon">⚠️</div>
        
        <h1 className="fail-title">결제에 실패했습니다</h1>
        
        {/* 에러 내용 */}
        <div className="error-box">
          <p className="error-message">{message}</p>
          {code && <p className="error-code">에러 코드: {code}</p>}
        </div>

        <div className="button-group">
          {/* 다시 시도 버튼 */}
          <button 
            className="retry-button" 
            onClick={() => navigate('/payment/charge')}
          >
            다시 시도하기
          </button>

          {/* 홈으로 가기 버튼 */}
          <button 
            className="home-button" 
            onClick={() => navigate('/')}
          >
            홈으로 가기
          </button>
        </div>
      </div>
    </div>
  );
};

export default FailPage;