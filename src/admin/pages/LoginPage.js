import React, { useState } from "react";
import { setAdminLoggedIn } from "../auth";

export default function LoginPage(props) {
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");

  function onSubmit(e) {
    e.preventDefault();
    setErr("");

    // ✅ 여기서 백엔드 호출은 "나중에" 넣을 거라서,
    // 지금은 더미로 admin/1234만 통과되게 해둠.
    if (id !== "admin" || pw !== "1234") {
      setErr("아이디/비밀번호가 올바르지 않습니다. (테스트: admin / 1234)");
      return;
    }

    setAdminLoggedIn(true);
    props.onLoginSuccess();
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
        value: id,
        onChange: (e) => setId(e.target.value),
        style: styles.input,
      }),
      React.createElement("input", {
        placeholder: "비밀번호",
        type: "password",
        value: pw,
        onChange: (e) => setPw(e.target.value),
        style: styles.input,
      }),
      err
        ? React.createElement("div", { style: styles.err }, err)
        : null,
      React.createElement("button", { type: "submit", style: styles.btn }, "로그인"),
      React.createElement(
        "div",
        { style: styles.hint },
        "테스트 계정: admin / 1234"
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
