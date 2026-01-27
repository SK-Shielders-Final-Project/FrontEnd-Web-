import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/axiosConfig';
import './ViewProfilePage.css';

const ViewProfilePage = () => {
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const userId = localStorage.getItem('userId');
                if (!userId) {
                    setError('로그인 정보에서 사용자 ID를 찾을 수 없습니다.');
                    setLoading(false);
                    return;
                }

                const response = await api.get(`/api/user/info/${userId}`);
                setUserData(response.data);
            } catch (err) {
                console.error('Failed to fetch user info:', err);
                setError('사용자 정보를 불러오는데 실패했습니다.');
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    if (loading) {
        return <div className="mypage-loading">사용자 정보를 불러오는 중...</div>;
    }

    if (error) {
        return <div className="mypage-error">{error}</div>;
    }

    if (!userData) {
        return <div className="mypage-error">사용자 정보를 찾을 수 없습니다.</div>;
    }

    return (
        <div className="mypage-container">
            <h2 className="mypage-header">내 정보</h2>
            <div className="user-info-section">
                <div className="info-item">
                    <span className="info-label">아이디</span>
                    <span className="info-value">{userData.username}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">이름</span>
                    <span className="info-value">{userData.name}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">이메일</span>
                    <span className="info-value">{userData.email}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">연락처</span>
                    <span className="info-value">{userData.phone}</span>
                </div>
                <div className="info-item">
                    <span className="info-label">총 포인트</span>
                    <span className="info-value">{userData.total_point.toLocaleString()} P</span>
                </div>
                <div className="info-item">
                    <span className="info-label">가입일</span>
                    <span className="info-value">{new Date(userData.created_at).toLocaleDateString()}</span>
                </div>
                {userData.updated_at && (
                    <div className="info-item">
                        <span className="info-label">최근 업데이트</span>
                        <span className="info-value">{new Date(userData.updated_at).toLocaleDateString()}</span>
                    </div>
                )}
            </div>
            <div className="mypage-actions">
                <Link to="/mypage/edit" className="action-button">정보 수정</Link>
            </div>
        </div>
    );
};

export default ViewProfilePage;
