import React from 'react';
import { useNavigate } from 'react-router-dom'; // 1. 네비게이트 임포트
import './PaymentPage.css';

// 2. PointCard가 onClick 함수를 받아서 div에 연결하도록 수정
const PointCard = ({ title, description, icon, onClick }) => {
  return (
    <div className="point-card" onClick={onClick}> {/* 클릭 이벤트 연결 */}
      <div className="card-icon">{icon}</div>
      <h3 className="card-title">{title}</h3>
      <p className="card-description">{description}</p>
    </div>
  );
};

const PaymentPage = () => {
  const navigate = useNavigate(); // 3. 훅 생성

  // 4. 충전권 클릭 시 실행될 함수
  const handleChargeClick = () => {
    navigate('/payment/charge'); 
  };

  const handleDailyClick = () => {
    navigate('/payment/use');
  };

  const handleCouponClick = () => {
    navigate('/payment/coupon');
  };

  return (
    <div className="charge-container">
      <h2 className="page-title">결제하기</h2>
      
      <div className="card-container">
        {/* 첫 번째 카드: 충전권 */}
        <PointCard
          title="충전하기"
          description="포인트를 충전할 수 있습니다."
          icon={<i className="fas fa-ticket-alt"></i>}
          onClick={handleChargeClick} 
        />

        {/* 두 번째 카드: 일일권 */}
        <PointCard
          title="사용하기"
          description="포인트를 사용하여 자전거를 이용할 수 있습니다."
          icon={<i className="fas fa-stopwatch"></i>}
          onClick={handleDailyClick} 
        />
      </div>

      <div className="coupon-section">
        <button className="btn-coupon" onClick={handleCouponClick}>
          🎟️ 쿠폰 등록하고 포인트 받기
        </button>
      </div>
    </div>
  );
};

export default PaymentPage;