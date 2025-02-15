import React, {useCallback, useEffect, useRef, useState} from "react";
import {MessageInputField} from "./MessageInputField";
import {
  getDecryptedMessage,
  getMessagesWithAddress,
  getNameByAddress,
  getSuiNSByAddress
} from "../api/services/dbService";
import {useSuiWallet} from "@/hooks/useSuiWallet";
import {FaLink} from 'react-icons/fa';
import {RecipientBar} from "@/components/RecipientBar.tsx";


interface Message {
  sender: "sent" | "received";
  text: string | null;
  timestamp?: number;
  txDigest?: string;
}

interface ChatPanelProps {
  recipientAddress: string | null;
}






const MessageBubble = React.memo(({ message, isLast }) => {
  const [showTimestamp, setShowTimestamp] = useState(false);

  const handleClick = () => {
    setShowTimestamp(true);

    // Hide the timestamp after 5 seconds for non-last messages
    if (!isLast) {
      const timer = setTimeout(() => {
        setShowTimestamp(false);
      }, 5000);

      // Clear timeout if clicked again or component unmounts
      return () => clearTimeout(timer);
    }
  };

  return (
    <div className="mb-2">
      <div className={`flex items-center ${message.sender === 'sent' ? 'justify-end' : 'justify-start'}`}>
        {/* Icon Link for Received Messages (on the left) */}
        {message.txDigest && message.sender === 'received' && (
          <a
            href={`https://suiscan.xyz/testnet/tx/${message.txDigest}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline flex items-center mx-2"
          >
            <FaLink />
          </a>
        )}

        {/* Message Bubble */}
        <div
          className={`p-3 rounded-2xl max-w-[50%] text-sm cursor-pointer ${
            message.sender === 'sent'
              ? 'bg-blue-700 text-white self-end'
              : 'bg-gray-200 text-black self-start'
          }`}
          onClick={handleClick}
        >
          <span>{message.text}</span>
        </div>

        {/* Icon Link for Sent Messages (on the right) */}
        {message.txDigest && message.sender === 'sent' && (
          <a
            href={`https://suiscan.xyz/testnet/tx/${message.txDigest}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline flex items-center mx-2"
          >
            <FaLink />
          </a>
        )}
      </div>

      {/* Timestamp aligned with the message bubble */}
      {(isLast || showTimestamp) && (
        <div className="flex mt-1">
          {message.sender === 'received' ? (
            <div className="text-xs text-gray-500 ml-[calc(2rem+8px)]"> {/* Aligned to start of the bubble */}
              {message.timestamp}
            </div>
          ) : (
            <div className="text-xs text-gray-500 ml-auto mr-[calc(2rem+8px)]"> {/* Aligned to end of the bubble */}
              {message.timestamp}
            </div>
          )}
        </div>
      )}
    </div>
  );
});






export const ChatPanel: React.FC<ChatPanelProps> = ({ recipientAddress }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [suiNS, setSuiNS] = useState<string | null>(null);
  const { wallet } = useSuiWallet();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth"});
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);


  useEffect(() => {
    const fetchRecipientName = async () => {
  
      if (recipientAddress) {
        try {
          const name = await getNameByAddress(recipientAddress);
  
          if (name) {
            setRecipientName(name);
            const suiNS = await getSuiNSByAddress(recipientAddress);
  
            if (suiNS) {
              setSuiNS(suiNS);
            }
            return;
          }
  
          const suiNS = await getSuiNSByAddress(recipientAddress);
  
          if (suiNS) {
            setRecipientName(suiNS);
            setSuiNS(suiNS);
            return;
          }
  
          // If no name or SuiNS, use the shortened address
          setRecipientName(`${recipientAddress.slice(0, 7)}...${recipientAddress.slice(-4)}`);
          setSuiNS(null);
        } catch (error) {
          console.error("Error fetching recipient name:", error);
          setRecipientName(`${recipientAddress.slice(0, 7)}...${recipientAddress.slice(-4)}`);
        }
      } else {
        console.log("No recipient address provided");
        setRecipientName(null);
      }
    };
  
    fetchRecipientName();
  }, [recipientAddress]);
  


  useEffect(() => {
      const ws = new WebSocket('ws://localhost:8080');

      const handleNewMessage = async (messageData: any) => {
        try {
            const decryptedMessage = await getDecryptedMessage(
                recipientAddress,
                wallet,
                messageData.text
            );
      
          let timeString = "";
          if (messageData.timestamp) {
            const numericTimestamp = parseInt(messageData.timestamp, 10);

            if (!isNaN(numericTimestamp)) {
              const messageDate = new Date(numericTimestamp);
              const currentDate = new Date();

              // Calculate the difference in milliseconds
              const msDifference = currentDate.getTime() - messageDate.getTime();
              const hoursDifference = msDifference / (1000 * 60 * 60);
              const daysDifference = msDifference / (1000 * 60 * 60 * 24);

              if (messageDate.toDateString() === currentDate.toDateString()) {
                // Same day, show time
                timeString = messageDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
              } else if (daysDifference < 2 && messageDate.getDate() === currentDate.getDate() - 1) {
                  // Yesterday, show "Yesterday"
                  timeString = "Yesterday" +  messageDate.toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                  });
              } else if (daysDifference < 7) {
                  // Within a week, show day of the week (e.g., "Mon")
                  timeString = messageDate.toLocaleDateString(undefined, {
                      weekday: 'short',
                  });
              } else {
                  // More than a week ago, show date (e.g., "Feb 10")
                  timeString = messageDate.toLocaleDateString(undefined, {
                      month: 'short',
                      day: 'numeric',
                  });
              }
            }
          }

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
            console.log("New message received:", data);
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

  const handleMessageSent = useCallback(() => {
    setMessages(prev => [...prev]);
  }, []);

  console.log(messages);

  return (
    <div className="flex flex-col h-screen flex-1 bg-light-blue overflow-auto">
      <RecipientBar recipientName={recipientName} address={recipientAddress} suins={suiNS}/>
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