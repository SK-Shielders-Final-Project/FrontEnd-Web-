import React, { useState, useEffect } from "react";
import apiClient from "../api/axiosConfig";
import { getCookie } from "../auth/authUtils";

function ChatbotWindow({ onClose }) {
  const [messages, setMessages] = useState([
    { sender: "bot", text: "안녕하세요 😊 무엇을 도와드릴까요?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const storedUserId = getCookie('userId');
    setUserId(storedUserId);
  }, []);

  const sendMessage = async () => {
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

    setMessages((prev) => [...prev, { sender: "user", text: userText }]);

    try {
      setLoading(true);

      /**
       * 💡 수정 포인트: 백엔드 ChatRequestDto 구조에 맞춤
       * 구조: { message: { role, user_id, content } }
       */
      const payload = {
        message: {
          role: "user",
          user_id: Number(userId), // 백엔드가 Long(숫자) 타입을 기대하므로 변환
          content: userText
        }
      };

      const res = await apiClient.post("/api/chat", payload);
      const data = res.data;

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
          disabled={!userId || loading}
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