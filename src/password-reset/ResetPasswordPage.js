import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import api from '../api/axiosConfig';
import './ResetPasswordPage.css';

function ResetPasswordPage() {
    const location = useLocation();
    const navigate = useNavigate();
    
    const [token, setToken] = useState(null);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const tokenFromQuery = params.get('token');
        if (tokenFromQuery) {
            setToken(tokenFromQuery);
        } else {
            setError('유효하지 않은 접근입니다. 토큰이 URL에 포함되어 있는지 확인해주세요.');
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setMessage('');

        if (!token) {
            setError('토큰이 없어 비밀번호를 변경할 수 없습니다.');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError('비밀번호가 일치하지 않습니다.');
            return;
        }

        try {
            await api.post('/api/auth/password-reset/reset', { token, newPassword });
            alert('비밀번호가 성공적으로 변경되었습니다. 새 비밀번호로 로그인해주세요.');
            navigate('/login');
        } catch (err) {
            setError('비밀번호 변경에 실패했습니다. 링크가 유효하지 않거나 만료되었을 수 있습니다.');
            console.error('Password reset failed:', err);
        }
    };

    return (
        <div className="login-container">
            <h2 className="login-header">새 비밀번호 설정</h2>
            <form onSubmit={handleSubmit} className="login-form">
                <div className="input-group">
                    <label htmlFor="new-password">새 비밀번호</label>
                    <input
                        type="password"
                        id="new-password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        required
                        placeholder="새 비밀번호를 입력하세요"
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="confirm-password">새 비밀번호 확인</label>
                    <input
                        type="password"
                        id="confirm-password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        placeholder="새 비밀번호를 다시 입력하세요"
                    />
                </div>
                <button type="submit" className="login-button">비밀번호 변경</button>
                {error && <p className="error-message">{error}</p>}
            </form>
        </div>
    );
}

export default ResetPasswordPage;
