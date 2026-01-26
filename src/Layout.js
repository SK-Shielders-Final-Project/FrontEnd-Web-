import { Outlet, Link } from 'react-router-dom';
import './Layout.css'; // 스타일 파일 임포트

const Layout = () => {
  return (
    <div className="layout-wrapper">
      {/* --- 헤더 (메뉴바) 영역 --- */}
      <header className="header">
        
        {/* 왼쪽: 로고 (필요 없다면 지워도 됩니다) */}
        <div className="logo">
          <Link to="/">작당모빌</Link>
        </div>

        {/* 오른쪽: 메뉴 리스트 */}
        <nav className="nav-menu">
          {/* path="/" 과 연결 (index) */}
          <Link to="/" className="nav-item">메인</Link>
          
          {/* path="login" 과 연결 */}
          <Link to="/login" className="nav-item">로그인</Link>
          
          {/* path="payment" 과 연결 */}
          <Link to="/payment" className="nav-item">결제</Link>
          
          {/* path="inquiry" 과 연결 */}
          <Link to="/inquiry" className="nav-item">문의사항</Link>
        </nav>

      </header>

      {/* --- 본문 (Outlet) 영역 --- */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;