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
          user={user}                      
          onClose={() => setOpen(false)}
        />
      )}
    </>
  );
}

export default ChatbotContainer;
