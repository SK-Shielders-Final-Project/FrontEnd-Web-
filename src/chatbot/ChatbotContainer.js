import React, { useState } from "react";
import ChatbotButton from "./ChatbotButton";
import ChatbotWindow from "./ChatbotWindow";
import "./Chatbot.css";

function ChatbotContainer() { // user prop 제거
  const [open, setOpen] = useState(false);

  return (
    <>
      <ChatbotButton onClick={() => setOpen(true)} />

      {open && (
        <ChatbotWindow
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

export default ChatbotContainer;
