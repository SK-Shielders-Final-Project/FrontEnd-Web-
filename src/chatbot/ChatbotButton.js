import React from "react";

function ChatbotButton({ onClick }) {
  return (
    <button className="chatbot-button" onClick={onClick}>
      💬 챗봇 상담
    </button>
  );
}

export default ChatbotButton;
