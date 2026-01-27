import React, { useState } from "react";

function ChatbotWindow({ user, onClose }) {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "안녕하세요 😊 무엇을 도와드릴까요?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // ✅ user가 없을 때(아직 로딩중/로그인 안됨) 대비
  const userId = user.user_id; // user가 없으면 undefined

  const sendMessage = async () => {
    // ✅ 0) 로그인 정보 없으면 여기서 종료 (에러 방지)
    if (!userId) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "로그인 정보를 불러오는 중이거나 로그인 상태가 아닙니다." }
      ]);
      return;
    }

    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");

    // 1) 사용자 메시지 먼저 화면에 추가
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);

    try {
      setLoading(true);

      // 2) 백엔드 호출
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,     // ✅ 여기서 userId는 이미 안전하게 확보됨
          message: userText
        })
      });

      if (!res.ok) {
        const t = await res.text().catch(() => "");
        throw new Error(`chat api failed: ${res.status} ${t}`);
      }

      const data = await res.json(); // { userId, assistantMessage, model }

      // 3) 봇 응답 화면에 추가
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: data.assistantMessage || "(응답 없음)" }
      ]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: "서버 연결에 실패했어요. 잠시 후 다시 시도해 주세요." }
      ]);
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="chatbot-window">
      <div className="chatbot-header">
        <span>챗봇 상담</span>
        <button onClick={onClose}>✖</button>
      </div>

      <div className="chatbot-messages">
        {messages.map((msg, idx) => (
          <div key={idx} className={`chatbot-message ${msg.sender}`}>
            {msg.text}
          </div>
        ))}
        {loading && <div className="chatbot-message bot">답변 생성 중...</div>}
      </div>

      <div className="chatbot-input">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={userId ? "메시지를 입력하세요" : "로그인 후 이용 가능합니다"}
          disabled={!userId || loading}  // ✅ 로그인 전/로딩 중 입력 막기
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} disabled={!userId || loading}>
          전송
        </button>
      </div>
    </div>
  );
}

export default ChatbotWindow;
