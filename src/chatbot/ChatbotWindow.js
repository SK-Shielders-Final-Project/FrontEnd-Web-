import React, { useState } from "react";

function ChatbotWindow({ user, onClose }) {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "안녕하세요 😊 무엇을 도와드릴까요?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userText = input;
    setInput("");

    // 1) 사용자 메시지 먼저 화면에 추가
    setMessages((prev) => [...prev, { sender: "user", text: userText }]);

    // 2) userId 결정 (네 user 응답 필드명에 맞춰 여기만 조정)
    const userId = user.user_id;

    try {
      setLoading(true);

      // 3) 백엔드 호출
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          message: userText
        })
      });

      if (!res.ok) {
        throw new Error(`chat api failed: ${res.status}`);
      }

      const data = await res.json(); // { userId, assistantMessage, model }

      // 4) 봇 응답 화면에 추가
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
          placeholder="메시지를 입력하세요"
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        />
        <button onClick={sendMessage} disabled={loading}>전송</button>
      </div>
    </div>
  );
}

export default ChatbotWindow;
