import { useState } from "react";
import MessageInputField from "./MessageInputField";

interface Message {
  sender: "sent" | "received";
  text: string;
  timestamp?: number;
  txDigest?: string;
}

interface ChatPanelProps {
  recipientAddress: string | null;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ recipientAddress }) => {
  const [messages, setMessages] = useState<Message[]>([
    { sender: "sent", text: "Just submit the doc, see you in class" },
    { sender: "received", text: "Can't wait for our standup!" },
  ]);

  const handleMessageSent = (newMessage: string, timestamp: number, txDigest: string) => {
    setMessages((prevMessages) => [
      ...prevMessages,
      { sender: "sent", text: newMessage, timestamp, txDigest },
    ]);
  };

  return (
    <div className="flex flex-col h-screen w-3/4 p-0 bg-white">
      <div className="font-bold text-lg px-6 py-4 mb-4">
        <span className="text-black text-2xl">Sophia</span>
      </div>
      <div className="flex-grow flex flex-col gap-2 px-4 py-2 justify-end mb-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-3 rounded-2xl max-w-[70%] text-sm ${
              message.sender === "sent"
                ? "bg-purple-700 text-white self-end"
                : "bg-gray-200 text-black self-start"
            }`}
          >
            <span>
              {message.text}
              {message.txDigest && (
                <>
                  <br />
                  <a
                    href={`https://suiscan.xyz/testnet/tx/${message.txDigest}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    View on Chain
                  </a>
                </>
              )}
            </span>
          </div>
        ))}
      </div>
      <div className="w-full p-2 bg-purple-50 flex flex-col justify-center sticky bottom-0">
        <MessageInputField
          recipientAddress={recipientAddress}
          onMessageSent={handleMessageSent}
        />
      </div>
    </div>
  );
};
