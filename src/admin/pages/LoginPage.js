import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';

export default function LoginPage(props) {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setErrorMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/admin/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();
      if (response.ok) {
        if (data.jwttoken && data.userId) {
          props.onLoginSuccess(data.jwttoken, data.userId);
        } else {
          setErrorMessage("로그인에 성공했지만 토큰 또는 관리자 ID를 받지 못했습니다.");
        }
      } else {
        setErrorMessage(data.message || '로그인에 실패했습니다.');
      }
    } catch (error) {
      console.error("Admin login error:", error);
      setErrorMessage("로그인 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }

  return React.createElement(
    "div",
    { style: styles.wrap },
    React.createElement("h2", { style: { marginTop: 0 } }, "관리자 로그인"),
    React.createElement(
      "form",
      { onSubmit, style: { display: "grid", gap: 10 } },
      React.createElement("input", {
        placeholder: "아이디",
        value: username,
        onChange: (e) => setUsername(e.target.value),
        style: styles.input,
      }),
      React.createElement("input", {
        placeholder: "비밀번호",
        type: "password",
        value: password,
        onChange: (e) => setPassword(e.target.value),
        style: styles.input,
      }),
      errorMessage
        ? React.createElement("div", { style: styles.err }, errorMessage)
        : null,
      React.createElement("button", { type: "submit", style: styles.btn, disabled: isLoading },
        isLoading ? '로그인 중...' : '로그인'
      )
    )
  );
}

const styles = {
  wrap: {
    maxWidth: 380,
    margin: "80px auto",
    padding: 18,
    border: "1px solid #ddd",
    borderRadius: 10,
    background: "#fff",
  },
  input: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #ccc",
    outline: "none",
  },
  btn: {
    padding: "10px 12px",
    borderRadius: 8,
    border: "1px solid #333",
    background: "#111",
    color: "#fff",
    cursor: "pointer",
  },
  err: { color: "crimson", fontSize: 13 },
  hint: { color: "#666", fontSize: 12, marginTop: 6 },
};
