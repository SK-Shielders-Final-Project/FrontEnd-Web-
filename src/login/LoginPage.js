import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/auth/AuthContext';
import { loginUser } from '../api/authApi';
import './LoginPage.css';
import { performKeyExchange } from '../utils/cryptoUtils'; 

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const data = await loginUser(username, password);
      console.log('Login API response data:', data); // Add this line for debugging
      const { accessToken, refreshToken, userId } = data;

      if (accessToken && refreshToken && userId) {
        login(accessToken, refreshToken, userId);
        // navigate('/mypage/view');
      } else {
        throw new Error('로그인에 성공했지만 토큰 또는 사용자 ID를 받지 못했습니다.');
      }

      // 로그인 시 대칭키 교환 (e2e)
        const keyExchangeSuccess = await performKeyExchange();

        if (keyExchangeSuccess) {
            alert("로그인 및 보안 채널 생성 완료!");
            navigate('/'); // 홈으로 이동
        } else {
            alert("로그인은 됐는데 보안 키 설정에 실패했습니다.");
        }

    } catch (error) {
      console.error("Login API call failed:", error); // Add this line
      const message = error.response?.data?.error || error.message || '로그인에 실패했습니다.';
      alert(message);
      setErrorMessage(message);
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
