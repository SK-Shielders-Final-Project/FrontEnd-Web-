import { Outlet, Link } from 'react-router-dom';
import './Layout.css'; // 스타일 파일 임포트

const Layout = () => {
  return (
    <div className="layout-wrapper">
      {/* --- 헤더 (메뉴바) 영역 --- */}
      <header className="header">
        
        {/* 왼쪽: 로고 */}
        <div className="logo">
          <Link to="/" className='logo-link'>
            <img src='/logo.png' alt='작당모빌 로고' className='logo-img'/> 
            <span className='logo-text'>작당모빌</span>
          </Link>
        </div>

        {/* 오른쪽: 메뉴 리스트 */}
        <nav className="nav-menu">
          {/* path="/" 과 연결 (index) */}
          <Link to="/" className="nav-item">메인</Link>
          <Link to="/login" className="nav-item">로그인</Link>
          <Link to="/payment" className="nav-item">결제</Link>
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