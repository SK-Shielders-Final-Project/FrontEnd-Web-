// MainPage.js
import React from 'react';

// user 데이터를 props로 받아와서 보여주게 수정
const MainPage = ({ user }) => {
  return (
    <div style={{ padding: '20px' }}>
      <h1>메인 페이지</h1>
      <p>여기는 메인 화면입니다.</p>
      
      {/* 사용자 정보 보여주기 */}
      {user ? (
         <div style={{ border: '1px solid #ccc', padding: '10px', marginTop: '20px' }}>
           <h3>사용자 정보</h3>
           <p><strong>아이디:</strong> {user.username}</p>
           <p><strong>이메일:</strong> {user.email}</p>
           <p><strong>포인트:</strong> {user.point}</p>
         </div>
       ) : (
         <p>로그인이 필요하거나 데이터를 불러오는 중입니다...</p>
       )}
    </div>
  );
};

export default MainPage;