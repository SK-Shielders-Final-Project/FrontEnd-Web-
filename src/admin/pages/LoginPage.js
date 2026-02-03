import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { loginAdmin } from "../api/authApi";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const data = await loginAdmin(username, password);
      
      // 서버에서 2FA가 필요하다고 응답한 경우
      if (data.requires2FA) {
        // 임시 세션에 저장 (아직 정식 로그인이 아님)
        sessionStorage.setItem('tempAdminToken', data.tempAccessToken);
        sessionStorage.setItem('tempAdminId', data.userId);
        sessionStorage.setItem('tempAdminRefreshToken', data.tempRefreshToken);
        
        // 시나리오에 따라: 최초 등록이면 setup-2fa, 이미 등록됐으면 otp-verify
        // 여기서는 흐름상 setup-2fa로 이동
        navigate('/admin/setup-2fa');
      } else {
        setErrorMessage("로그인 정보가 올바르지 않습니다.");
      }
    } catch (error) {
      console.error("Admin login error:", error);
      const message = error.response?.data?.message || "로그인 중 오류가 발생했습니다.";
      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={styles.wrap}>
      <h2 style={{ marginTop: 0 }}>관리자 로그인 (1단계)</h2>
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
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
        <button type="submit" style={styles.btn} disabled={isLoading}>
          {isLoading ? '다음 단계로' : '로그인'}
        </button>
      </form>
    </div>
  );
}

const styles = {
  wrap: { maxWidth: 380, margin: "80px auto", padding: 18, border: "1px solid #ddd", borderRadius: 10, background: "#fff" },
  input: { padding: "10px 12px", borderRadius: 8, border: "1px solid #ccc", outline: "none" },
  btn: { padding: "10px 12px", borderRadius: 8, border: "1px solid #333", background: "#111", color: "#fff", cursor: "pointer" },
  err: { color: "crimson", fontSize: 13 },
};