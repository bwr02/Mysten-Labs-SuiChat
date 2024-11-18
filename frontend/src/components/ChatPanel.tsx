import { useState } from "react";
import "../styles/ChatPanel.css";
import MessageInputField from "./MessageInputField";


interface Message {
  sender: "sent" | "received";
  text: string;
  timestamp?: number;
  txDigest?: string;
}


export const ChatPanel = () => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "sent", text: "Just submit the doc, see you in class"},
    { sender: "received", text: "Can't wait for our standup!"},
  ]);

  const handleMessageSent = (newMessage: string, timestamp: number, txDigest: string) => {
    setMessages(prevMessages => [...prevMessages, {
      sender: "sent",
      text: newMessage,
      timestamp,
      txDigest
    }]);
  };

  return (
    <div className="chat-panel">
      <div className="chat-header">
        <span className="chat-recipient">Sophia</span>
      </div>
      <div className="chat-messages">
        {messages.map((message, index) => (
          <div key={index} className={`message ${message.sender}`}>
            <span className="message-text">
              {message.text}
              {message.txDigest && (
                <>
                  <br />
                  <a
                    href={`https://suiscan.xyz/testnet/tx/${message.txDigest}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="transaction-link"
                  >
                    View Transaction on Chain
                  </a>
                </>
              )}
            </span>
          </div>
        ))}
      </div>
      <div className="message-input-container">
        <MessageInputField onMessageSent={handleMessageSent} />
      </div>
    </div>
  );
};
