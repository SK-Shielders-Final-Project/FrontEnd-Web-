import React, { useState, useEffect } from 'react';
import './App.css';
import config from './config/config.json';
import mockUser from './response.json';

function App() {
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    // In a real application, you would fetch the data.
    // For now, we are just using the mock data.
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/user/info/1`);
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        const data = await response.json();
        setUser(data);
      } catch (error) {
        setError(error.message);
        // As a fallback, use the mock user data
        setUser(mockUser);
      }
    };
    fetchUser();
    // setUser(mockUser); // Directly using the mock user for this example
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>사용자 정보</h1>
        {error && <p>Error: {error}</p>}
        {user ? (
          <div>
            <p><strong>아이디:</strong> {user.username}</p>
            <p><strong>이메일:</strong> {user.email}</p>
            <p><strong>전화번호:</strong> {user.phone}</p>
            <p><strong>카드 번호:</strong> {user.card_number}</p>
            <p><strong>포인트:</strong> {user.point}</p>
          </div>
        ) : (
          <p>사용자 정보를 불러오는 중...</p>
        )}
      </header>
    </div>
  );
}

export default App;
