import React, { useState } from 'react';
import api from '../api/axiosConfig';
import './RequestPasswordResetPage.css';
import { Link } from 'react-router-dom';

function RequestPasswordResetPage() {
    const [username, setUsername] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');
        try {
            await api.post('/api/auth/password-reset/request', { username, email });
            setMessage('비밀번호 재설정 링크가 이메일로 전송되었습니다.<br />이메일을 확인해주세요.');
        } catch (err) {
            setError('오류가 발생했습니다. 다시 시도해주세요.');
            console.error('Password reset request failed:', err);
        }
    };

    return (
        <div className="login-container">
            <h2 className="login-header">비밀번호 찾기</h2>
            <form onSubmit={handleSubmit} className="login-form">
                <div className="input-group">
                    <label htmlFor="username">아이디</label>
                    <input
                        type="text"
                        id="username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                        placeholder="아이디를 입력하세요"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="email">이메일</label>
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        placeholder="가입한 이메일을 입력하세요"
                    />
                </div>
                <button type="submit" className="login-button">비밀번호 재설정 링크 받기</button>
                {message && <p className="success-message" dangerouslySetInnerHTML={{ __html: message }}></p>}
                {error && <p className="error-message">{error}</p>}
            </form>
            <div className="sub-links">
                <Link to="/login">로그인으로 돌아가기</Link>
            </div>
        </div>
    );
}

export default RequestPasswordResetPage;
