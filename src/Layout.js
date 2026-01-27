import { Outlet, Link } from 'react-router-dom';
import './Layout.css'; // 스타일 파일 임포트

const Layout = ({ user, error, onLogout }) => {
  return (
    <div className="layout-wrapper">
      {/* --- 에러 메시지 표시 영역 --- */}
      {error && (
        <div style={{ padding: '10px', backgroundColor: '#ffcccb', color: 'black', textAlign: 'center', border: '1px solid red' }}>
          <strong>에러 발생:</strong> {error}
        </div>
      )}

      {/* --- 헤더 (메뉴바) 영역 --- */}
      <header className="header">
        
        <div className="logo">
          <Link to="/">작당모빌</Link>
        </div>

        <nav className="nav-menu">
          <Link to="/" className="nav-item">메인</Link>
          
          {/* 로그인 상태에 따라 다른 메뉴를 보여줍니다 */}
          {user ? (
            <>
              <a href="#" onClick={onLogout} className="nav-item">로그아웃</a>
            </>
          ) : (
            <Link to="/login" className="nav-item">로그인</Link>
          )}
          
          <Link to="/payment" className="nav-item">결제</Link>
          <Link to="/history" className="nav-item">이용내역</Link>
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