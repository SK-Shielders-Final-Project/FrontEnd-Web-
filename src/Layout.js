import { Outlet, Link } from 'react-router-dom';
import './Layout.css';
import ChatbotContainer from "./chatbot/ChatbotContainer";

const Layout = ({ user }) => {   // ✅ user를 props로 받기
  return (
    <div className="layout-wrapper">
      {/* --- 헤더 (메뉴바) 영역 --- */}
      <header className="header">
        {/* 왼쪽: 로고 */}
        <div className="logo">
          <Link to="/" className="logo-link">
            <img src="/zdmb_logo.png" alt="작당모빌 로고" className="logo-img" />
            <span className="logo-text">작당모빌</span>
          </Link>
        </div>

        {/* 오른쪽: 메뉴 리스트 */}
        <nav className="nav-menu">
          <Link to="/" className="nav-item">메인</Link>
          <Link to="/login" className="nav-item">로그인</Link>
          <Link to="/payment" className="nav-item">결제</Link>
          <Link to="/inquiry" className="nav-item">문의사항</Link>
        </nav>
      </header>

      {/* --- 본문 (Outlet) 영역 --- */}
      <main className="main-content">
        <Outlet />

        {/* ✅ 로그인한 사용자만 챗봇 보이게 */}
        {user && <ChatbotContainer user={user} />}
      </main>
    </div>
  );
};

export default Layout;
