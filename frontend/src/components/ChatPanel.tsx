import React, {useCallback, useEffect, useRef, useState} from "react";
import {MessageInputField} from "./MessageInputField";
import {
  getDecryptedMessage,
  getMessagesWithAddress,
} from "@/api/services/messageDbService";
import {useSuiWallet} from "@/hooks/useSuiWallet";
import {formatTimestamp} from "@/api/services/messageService";
import {RecipientBar} from "@/components/RecipientBar.tsx";
import {MessageBubble} from "@/components/MessageBubble.tsx";
import {ChatPanelProps, Message, broadcastMessageParams} from "@/types/types.ts";

export const ChatPanel: React.FC<ChatPanelProps> = ({ recipientAddress }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const { wallet } = useSuiWallet();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);



  useEffect(() => {
      const ws = new WebSocket('ws://localhost:8080');

      const handleNewMessage = async (messageData: broadcastMessageParams) => {
        try {
            const decryptedMessage = await getDecryptedMessage(
                recipientAddress,
                wallet,
                messageData.text
            );
      
          const timeString = formatTimestamp(messageData.timestamp);

          setMessages((prev) => [
            ...prev,
            {
              sender: messageData.messageType,
              text: decryptedMessage,
              timestamp: timeString,
              txDigest: messageData.txDigest,
            },
          ]);
        } catch (error) {
            console.error('Error decrypting message:', error);
        }
    }


      ws.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === 'new-message') {
          const { sender, recipient } = data.message;
          if ((sender === recipientAddress || recipient === recipientAddress)) {
            // console.log("New message received:", data);
            handleNewMessage(data.message);
          }
        }
      };
      return () => ws.close(); // Cleanup on unmount
  }, [recipientAddress, wallet]);


  // Fetch initial messages
  useEffect(() => {
    const fetchMessages = async () => {
      const initialMessages = await getMessagesWithAddress(recipientAddress, wallet);
      setMessages(initialMessages);
    };

    fetchMessages();
  }, [recipientAddress, wallet]);

  const handleMessageSent = useCallback(() => {
    setMessages(prev => [...prev]);
  }, []);

  // console.log(messages);

  return (
    <div className="flex flex-col h-screen flex-1 bg-light-blue overflow-auto no-scrollbar">
      <RecipientBar
        recipientAddress={recipientAddress}
      />
      <div className="flex-grow flex flex-col gap-2 px-4 py-2 justify-end mb-4">
        {messages.map((message, index) => (
          <MessageBubble key={`${index}-${message.timestamp}`} message={message} isLast={index === messages.length - 1}/>
        ))}
          {/* Ref element to keep the scroll at the bottom */}
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