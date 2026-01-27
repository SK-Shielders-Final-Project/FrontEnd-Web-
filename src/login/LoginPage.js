import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './LoginPage.css';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/user/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || '로그인에 실패했습니다.');
      }

      const data = await response.json();
      console.log('Login response data:', data); // Add for debugging
      const token = data.jwttoken;
      const userId = data.userId; // Match the lowercase 'userid' from the response

      if (token && userId) {
        localStorage.setItem('token', token);
        localStorage.setItem('userId', userId); // Store the user ID
        console.log('Login successful, token and userId stored.');
        window.location.href = '/mypage/view';
      } else {
        throw new Error('로그인에 성공했지만 토큰 또는 사용자 ID를 받지 못했습니다.');
      }
    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2 className="login-header">로그인</h2>
      <form onSubmit={handleSubmit} className="login-form">
        <div className="input-group">
          <label htmlFor="username">아이디</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <label htmlFor="password">비밀번호</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button type="submit" disabled={isLoading} className="login-button">
          {isLoading ? '로그인 중...' : '로그인'}
        </button>
      </form>
      <div className="sub-links">
        <Link to="/signup">회원가입</Link>
        <span>|</span>
        <Link to="/password-reset-request">비밀번호 찾기</Link>
      </div>
    </div>
  );
};

export default LoginPage;
