import React, { useState } from "react";
import ChatbotButton from "./ChatbotButton";
import ChatbotWindow from "./ChatbotWindow";
import "./Chatbot.css";

function ChatbotContainer({ user }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <ChatbotButton onClick={() => setOpen(true)} />

      {open && (
        <ChatbotWindow
          user={user}                       // ✅ 여기 핵심
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

export default ChatbotContainer;
