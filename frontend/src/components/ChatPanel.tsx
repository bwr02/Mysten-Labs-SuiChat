import React, { useRef, useState } from "react";
import { MessageInputField } from "./MessageInputField";
import { useSuiWallet } from "@/hooks/useSuiWallet";
import { RecipientBar } from "@/components/RecipientBar.tsx";
import { MessageBubble } from "@/components/MessageBubble.tsx";
import { ChatPanelProps, Message } from "@/types/types.ts";
import { useWebSocketMessages } from "@/hooks/useWebSocketMessages";
import { useMessageFetching } from "@/hooks/useMessageFetching";
import { useScrollToBottom } from "@/hooks/useScrollToBottom";

export const ChatPanel: React.FC<ChatPanelProps> = ({ recipientAddress }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { wallet } = useSuiWallet();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useWebSocketMessages(recipientAddress, wallet, setMessages);
  useMessageFetching(recipientAddress, wallet, setMessages);
  useScrollToBottom(messagesEndRef, messages);

  const handleMessageSent = () => {
    setMessages(prev => [...prev]);
  };

  return (
    <div className="flex flex-col h-screen flex-1 bg-light-blue overflow-auto no-scrollbar">
      <RecipientBar recipientAddress={recipientAddress} />
      <div className="flex-grow flex flex-col gap-2 px-4 py-2 justify-end mb-4">
        {messages.map((message, index) => (
          <MessageBubble 
            key={`${index}-${message.timestamp}`} 
            message={message} 
            isLast={index === messages.length - 1}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="w-full px-4 py-3 bg-light-blue border-t border-gray-700 sticky bottom-0">
        <MessageInputField
          recipientAddress={recipientAddress}
          onMessageSent={handleMessageSent}
        />
      </div>
    </div>
  );
};