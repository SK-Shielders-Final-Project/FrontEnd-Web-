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
        

        {/* 왼쪽: 로고 */}
        <div className="logo">
          <Link to="/" className='logo-link'>
            <img src='/logo.png' alt='작당모빌 로고' className='logo-img'/> 
            <span className='logo-text'>작당모빌</span>
          </Link>
        </div>

        <nav className="nav-menu">
          
          {/* 로그인 상태에 따라 다른 메뉴를 보여줍니다 */}
          {user ? (
            <>
              <Link to="/mypage" className="nav-item">마이페이지</Link>
              <a href="#" onClick={onLogout} className="nav-item">로그아웃</a>
              <Link to="/payment" className="nav-item">결제</Link>
              <Link to="/history" className="nav-item">이용내역</Link>
            </>
          ) : (
            <>
              <Link to="/login" className="nav-item">로그인</Link>
              <Link to="/signup" className="nav-item">회원가입</Link>
            </>
          )}
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