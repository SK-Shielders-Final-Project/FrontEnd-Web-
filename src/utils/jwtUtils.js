// src/utils/jwtUtils.js

export const getUsernameFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    // JWT 구조: header.payload.signature
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));

    const decoded = JSON.parse(jsonPayload);
    
    // 백엔드에서 username을 넣은 키값 ('sub' 또는 'username' 등 확인 필요)
    return decoded.sub || decoded.username || decoded.userId; 
  } catch (error) {
    console.error("토큰 디코딩 실패:", error);
    return null;
  }
};