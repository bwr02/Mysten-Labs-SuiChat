import React, { useEffect, useState, useRef, useCallback } from "react";
import { MessageInputField } from "./MessageInputField";
import { getMessagesWithAddress, getDecryptedMessage } from "../api/services/dbService";
import { useSuiWallet } from "@/hooks/useSuiWallet";

interface Message {
  sender: "sent" | "received";
  text: string | null;
  timestamp?: number;
  txDigest?: string;
}

interface ChatPanelProps {
  recipientAddress: string | null;
}

const RecipientBar: React.FC<{ recipientAddress: string | null }> = ({ recipientAddress }) => {
  return (
    <div className="w-full bg-light-blue text-gray-200 py-4 px-6 flex items-center justify-between shadow-md sticky top-0">
      <h1 className="text-2xl font-bold">
        {recipientAddress
          ? `${recipientAddress.slice(0, 7)}...${recipientAddress.slice(-4)}`
          : "No Contact Selected"}
      </h1>
    </div>
  );
};

const MessageBubble = React.memo(({message}: {message: Message}) => (
  <div
    className={`p-3 rounded-2xl max-w-[70%] text-sm ${
      message.sender === "sent"
        ? "bg-blue-700 text-white self-end"
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
));

export const ChatPanel: React.FC<ChatPanelProps> = ({ recipientAddress }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { wallet } = useSuiWallet();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth"});
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
      const ws = new WebSocket('ws://localhost:8080');

      const handleNewMessage = async (messageData: any) => {
          try {
              const decryptedMessage = await getDecryptedMessage(
                  recipientAddress,
                  wallet,
                  messageData.text
              );
        
            setMessages((prev) => [...prev, {
                sender: messageData.messageType,
                text: decryptedMessage,
                timestamp: messageData.timestamp
              }]);
          } catch (error) {
            console.error('Error decrypting message:', error);
        }
      }


      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new-message') {
          const { sender, recipient } = data.message;
          if ((sender === recipientAddress || recipient === recipientAddress)) {
            handleNewMessage(data.message);
          }
        };
      };
      return () => ws.close(); // Cleanup on unmount
  }, [recipientAddress, wallet]);

  // Fetch initial messages
  useEffect(() => {
      const fetchMessages = async () => {
          const initialMessages = await getMessagesWithAddress(recipientAddress, wallet);
          setMessages(initialMessages);
      };

      if (recipientAddress) {
        fetchMessages();
      }
  }, [recipientAddress, wallet]);

  const handleMessageSent = useCallback((newMessage: string, timestamp: number, txDigest: string) => {
    setMessages(prev => [...prev]);
  }, []);

  return (
    <div className="flex flex-col h-screen w-3/4 bg-light-blue">
      <RecipientBar recipientAddress={recipientAddress} />
      <div className="flex-grow flex flex-col gap-2 px-4 py-2 justify-end mb-4">
        {messages.map((message, index) => (
          <MessageBubble key={`${index}-${message.timestamp}`} message={message}/>
        ))}
          {/* Ref element to keep the scroll at the bottom */}
          <div ref={messagesEndRef} />
      </div>
      <div className="w-full px-4 py-3 bg-light-blue border-t border-gray-700">
        <MessageInputField
          recipientAddress={recipientAddress}
          onMessageSent={handleMessageSent}
        />
      </div>
    </div>
  );
};
