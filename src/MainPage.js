import React from 'react';
import './MainPage.css'; // 스타일 분리
import ChatbotContainer from "./chatbot/ChatbotContainer";
import MapContainer from './components/map/MapContainer';


const MainPage = ({ user }) => {
  return (
    
    <div className="main-container">
      {/* 1. 상단 배너 영역 (이미지 + 타이틀) */}
      <section className="hero-section">
        <div className="image-wrapper">
          <img src="/home.png" alt="작당모빌 메인" className="main-image" />
        </div>
        <div className="hero-content">
          <h1 className="main-title">도시를 달리는 새로운 방법, <span className="highlight">작당모빌</span></h1>
          <p className="main-subtitle">
            복잡한 도심 속, 원하는 곳 어디든 자유롭게 이동하세요.<br />
            당신의 일상에 활력을 더해주는 스마트한 자전거 공유 서비스입니다.
          </p>
        </div>
      </section>

      {/* 지도 표시 영역 */}
      <section className="map-section">
        <h2>실시간 자전거 위치</h2>
        <p>지도를 클릭하여 주변 자전거를 탐색하세요.</p>
        <MapContainer />
      </section>

      {/* 2. 서비스 특징 요약 */}
      <section className="features-section">
        <div className="feature-item">
          <h3>🚲 간편한 대여</h3>
          <p>QR코드 스캔 한 번으로<br/>즉시 출발 가능</p>
        </div>
        <div className="feature-item">
          <h3>💳 포인트 결제</h3>
          <p>충전한 포인트로<br/>알뜰하게 이용</p>
        </div>
        <div className="feature-item">
          <h3>🌳 친환경 이동</h3>
          <p>탄소 배출 없는<br/>건강한 라이딩</p>
        </div>
      </section>

      {/* 3. 사용자 정보 영역 (로그인 시 노출) */}
      <section className="user-info-section">
        {user ? (
          <div className="user-card">
            <div className="user-header">
              <h3>👋 반가워요, {user.username}님!</h3>
            </div>
            <div className="user-details">
              <p><strong>이메일</strong> {user.email}</p>
              <div className="point-box">
                <span>보유 포인트</span>
                <span className="point-value">{user.point ? user.point.toLocaleString() : 0} P</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="guest-msg">
            <p>로그인하고 작당모빌의 서비스를 이용해보세요!</p>
          </div>
        )}
      </section>
    </div>
    
  );
};

export default MainPage;