import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import './MyPageLayout.css';

const MyPage = () => {
    return (
        <div className="mypage-layout-container">
            <aside className="mypage-nav">
                <h3>마이페이지</h3>
                <ul>
                    <li>
                        <NavLink to="/mypage/view">회원정보 조회</NavLink>
                    </li>
                </ul>
            </aside>
            <main className="mypage-content">
                <Outlet />
            </main>
        </div>
    );
};

export default MyPage;
