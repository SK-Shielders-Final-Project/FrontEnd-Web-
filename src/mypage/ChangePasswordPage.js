import React, { useState } from 'react';
import api from '../api/axiosConfig';
import { useNavigate } from 'react-router-dom';
import { removeCookie, setCookie } from '../utils/cookie';
// Reusing EditProfilePage.css for basic form styling, or create a new one if distinct styles are needed
import './EditProfilePage.css'; // Assuming similar form styling

const ChangePasswordPage = () => {
    const [passwords, setPasswords] = useState({
        currentPassword: '',
        newPassword: '',
        confirmNewPassword: ''
    });
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setPasswords(prevPasswords => ({
            ...prevPasswords,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (passwords.newPassword !== passwords.confirmNewPassword) {
            alert('새 비밀번호와 확인 비밀번호가 일치하지 않습니다.');
            setLoading(false);
            return;
        }

        if (!passwords.currentPassword || !passwords.newPassword) {
            alert('현재 비밀번호와 새 비밀번호를 모두 입력해주세요.');
            setLoading(false);
            return;
        }

        try {
            const payload = {
                current_password: passwords.currentPassword,
                new_password: passwords.newPassword
            };
            await api.put('/api/user/auth/changepw', payload);
            
            // Logout user after successful password change
            removeCookie('token');
            removeCookie('userId');
            setCookie('isLoggingOut', 'true'); // To suppress ProtectedRoute alert
            
            alert('비밀번호가 성공적으로 변경되었습니다. 다시 로그인해주세요.');
            navigate('/login');
        } catch (err) {
            console.error('Failed to change password:', err);
            if (err.response && err.response.status === 401) {
                alert('현재 비밀번호가 올바르지 않습니다.');
            } else {
                alert('비밀번호 변경에 실패했습니다. 다시 시도해주세요.');
            }
        } finally {
            setLoading(false);
        }
    };

    const hintStyle = { color: '#0094B2', fontSize: '0.8rem', marginTop: '4px' };

    return (
        <div className="edit-profile-container"> {/* Reusing container style */}
            <h2 className="edit-profile-header">비밀번호 변경</h2> {/* Reusing header style */}
            <form onSubmit={handleSubmit} className="edit-profile-form"> {/* Reusing form style */}
                <div className="input-group">
                    <label htmlFor="currentPassword">현재 비밀번호</label>
                    <input
                        type="password"
                        id="currentPassword"
                        name="currentPassword"
                        value={passwords.currentPassword}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="newPassword">새 비밀번호</label>
                    <input
                        type="password"
                        id="newPassword"
                        name="newPassword"
                        value={passwords.newPassword}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                    <p style={hintStyle}>영문, 숫자, 특수문자 중 2종류를 조합하여 8자 이상으로 입력해주세요.</p>
                </div>
                <div className="input-group">
                    <label htmlFor="confirmNewPassword">새 비밀번호 확인</label>
                    <input
                        type="password"
                        id="confirmNewPassword"
                        name="confirmNewPassword"
                        value={passwords.confirmNewPassword}
                        onChange={handleChange}
                        required
                        disabled={loading}
                    />
                </div>
                <div className="edit-profile-actions"> {/* Reusing actions style */}
                    <button type="submit" className="edit-profile-button" disabled={loading}>
                        {loading ? '변경 중...' : '비밀번호 변경'}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default ChangePasswordPage;