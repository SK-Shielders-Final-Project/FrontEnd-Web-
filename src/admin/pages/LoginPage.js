import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../api/authApi";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      // 1. 로그인 실행 (백엔드에서 is2faEnabled를 포함해서 보내줘야 함)
      const data = await loginAdmin(username, password);
      console.log("로그인 응답:", data);
      
      // LocalStorage에 임시 저장 (요구 사항 1)
      localStorage.setItem("token", data.tempAccessToken);
      localStorage.setItem("refreshToken", data.tempRefreshToken);
      localStorage.setItem("adminId", data.userId);
      
      const userId = data.userId;
      localStorage.setItem('tempAdminId', userId);
      // Assuming the API returns a temporary access token for 2FA in `data.tempAccessToken`
      if (data.tempAccessToken) {
        localStorage.setItem('tempAdminToken', data.tempAccessToken);
      }

      // 2. 로그인 응답 데이터(data) 내의 is2faEnabled 값으로 즉시 분기
      if (data.is2faEnabled === true) {
        console.log("2FA 설정 완료 사용자 -> 인증 페이지로 이동");
        navigate('/admin/otp-verify', { state: { is2faEnabled: true } });
      } else {
        console.log("2FA 미설정 사용자 -> QR 설정 페이지로 이동");
        navigate('/admin/setup-2fa', { state: { is2faEnabled: false } });
      }

    } catch (error) {
      console.error("로그인 에러:", error);
      setErrorMessage("아이디 또는 비밀번호가 올바르지 않습니다.");
    }
  };

  return (
    <div style={styles.wrap}>
      <h2 style={{ textAlign: 'center', marginBottom: 20 }}>관리자 로그인</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 12 }}>
        <input 
          placeholder="아이디" 
          value={username} 
          onChange={(e) => setUsername(e.target.value)} 
          style={styles.input} 
        />
        <input 
          placeholder="비밀번호" 
          type="password" 
          value={password} 
          onChange={(e) => setPassword(e.target.value)} 
          style={styles.input} 
        />
        {errorMessage && <div style={styles.err}>{errorMessage}</div>}
        <button type="submit" style={styles.btn}>로그인</button>
      </form>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 380, margin: "100px auto", padding: 25, border: "1px solid #eee", borderRadius: 12, boxShadow: "0 4px 10px rgba(0,0,0,0.1)" },
  input: { padding: "12px", borderRadius: 8, border: "1px solid #ddd", fontSize: 14 },
  btn: { padding: "12px", borderRadius: 8, border: "none", background: "#111", color: "#fff", cursor: "pointer", fontSize: 15, fontWeight: "bold" },
  err: { color: "red", fontSize: 13, textAlign: 'center' },
};