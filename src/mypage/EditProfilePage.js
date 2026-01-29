import React, { useState, useEffect } from 'react';
import api from '../api/axiosConfig';
import './EditProfilePage.css';
import { useNavigate } from 'react-router-dom';

const EditProfilePage = () => {
    const [formData, setFormData] = useState({
        username: '',
        name: '', // Added name
        email: '',
        phone: '',
        password: '' // Added password for verification
    });
    const [userId, setUserId] = useState(null); // userId still needed for the initial GET request path
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const storedUserId = localStorage.getItem('userId');
                if (!storedUserId) {
                    alert('로그인 정보에서 사용자 ID를 찾을 수 없습니다. 다시 로그인해주세요.');
                    navigate('/login'); // Redirect to login if no userId
                    return;
                }
                
                setUserId(storedUserId); // Set userId for the submit handler

                const response = await api.get(`/api/user/info/${storedUserId}`);
                // Assuming response now includes 'name'
                const { username, name, email, phone } = response.data;
                setFormData({ 
                    username, 
                    name, 
                    email, 
                    phone,
                    password: '' // Password always starts empty for security
                });
            } catch (err) {
                console.error('Failed to fetch user info:', err);
                alert('사용자 정보를 불러오는데 실패했습니다.');
                // Optionally redirect to a more stable page or login
                // navigate('/mypage/view'); 
            } finally {
                setLoading(false);
            }
        };

        fetchUserInfo();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Ensure password is not empty if it's required for verification
        if (!formData.password) {
            alert('본인 확인을 위해 현재 비밀번호를 입력해주세요.');
            return;
        }

        try {
            const payload = {
                username: formData.username,
                name: formData.name,
                password: formData.password, // For verification
                email: formData.email,
                phone: formData.phone,
            };

            await api.put(`/api/user/info`, payload); // No userId in path
            alert('회원 정보가 성공적으로 수정되었습니다.');
            navigate('/mypage/view');
        } catch (err) {
            console.error('Failed to update user info:', err);
            const errorMessage = err.response?.data?.error || err.message || '정보 수정에 실패했습니다. 다시 시도해주세요.';
            alert(errorMessage);
        }
    };

    if (loading) {
        return <div className="edit-profile-loading">사용자 정보를 불러오는 중...</div>;
    }

    // No dedicated error display, all errors are alerts now.
    // if (error) {
    //     return <div className="edit-profile-error">{error}</div>;
    // }

    return (
        <div className="edit-profile-container">
            <h2 className="edit-profile-header">회원정보 수정</h2>
            <form onSubmit={handleSubmit} className="edit-profile-form">
                <div className="input-group">
                    <label htmlFor="username">아이디</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        value={formData.username}
                        disabled // Username is not editable
                        readOnly // Visually indicate it's not editable
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="name">이름</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="email">이메일</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="phone">연락처</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="input-group">
                    <label htmlFor="password">현재 비밀번호 (본인 확인)</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="edit-profile-actions">
                    <button type="submit" className="edit-profile-button">정보 수정</button>
                </div>
            </form>
        </div>
    );
};

export default EditProfilePage;
