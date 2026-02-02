import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './SignupPage.css';

const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [name, setName] = useState(''); // Add name state
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState(''); // Add phone state
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setErrorMessage('');

    if (password !== confirmPassword) {
      setErrorMessage('비밀번호가 일치하지 않습니다.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/user/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, name, email, phone, password }), // Include name and phone
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || '회원가입에 실패했습니다.';
        alert(errorMessage);
        throw new Error(errorMessage);
      }

      // Handle successful signup
      alert('회원가입에 성공했습니다! 로그인 페이지로 이동합니다.');
      navigate('/login');

    } catch (error) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const hintStyle = { color: '#0094B2', fontSize: '0.8rem', marginTop: '4px' };

  return (
    <div className="signup-container">
      <h2 className="signup-header">회원가입</h2>
      <form onSubmit={handleSubmit} className="signup-form">
        <div className="input-group">
          <label htmlFor="username">아이디</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
          <p style={hintStyle}>5자 이상, 20자 이하로 입력해주세요.</p>
        </div>
        <div className="input-group">
          <label htmlFor="name">이름</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
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
          />
          <p style={hintStyle}>이메일 형식에 맞게 입력해주세요.</p>
        </div>
        <div className="input-group">
          <label htmlFor="phone">전화번호</label>
          <input
            type="tel" // Use type="tel" for phone numbers
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            // Phone is not NOT NULL in DB, so making it not required in UI too
          />
          <p style={hintStyle}>-를 제외한 11자리 숫자를 입력해주세요. (예: 01012345678)</p>
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
          <p style={hintStyle}>영문, 숫자, 특수문자 중 2종류를 조합하여 8자 이상으로 입력해주세요.</p>
        </div>
        <div className="input-group">
          <label htmlFor="confirmPassword">비밀번호 확인</label>
          <input
            type="password"
            id="confirmPassword"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
          />
        </div>
        {errorMessage && <p className="error-message">{errorMessage}</p>}
        <button type="submit" disabled={isLoading} className="signup-button">
          {isLoading ? '가입 중...' : '회원가입'}
        </button>
      </form>
    </div>
  );
};

export default SignupPage;
