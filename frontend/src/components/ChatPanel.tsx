import React, {useCallback, useEffect, useRef, useState} from "react";
import {MessageInputField} from "./MessageInputField";
import {
  getDecryptedMessage,
  getMessagesWithAddress,
  getNameByAddress,
  getSuiNSByAddress
} from "../api/services/dbService";
import {useSuiWallet} from "@/hooks/useSuiWallet";
import {formatTimestamp} from "@/api/services/messageService";
import {RecipientBar} from "@/components/RecipientBar.tsx";
import {MessageBubble} from "@/components/MessageBubble.tsx";
import {Message, broadcastMessageParams} from "@/types/types.ts";

interface ChatPanelProps {
  recipientAddress: string | null;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({ recipientAddress }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [suiNS, setSuiNS] = useState<string | null>(null);
  const { wallet } = useSuiWallet();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
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
            else{
              setSuiNS(null);
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
        // console.log("No recipient address provided");
        setRecipientName(null);
        setSuiNS(null);
      }
    };
  
    fetchRecipientName();
  }, [recipientAddress]);
  


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

  useEffect(() => {
    const wsEditContact = new WebSocket('ws://localhost:8081');

    wsEditContact.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'edit-contact') {
        setRecipientName(data.contact.contactName);
      }
    };

    return () => {
      wsEditContact.close();
    };
  }, [setRecipientName]);

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

  // console.log(messages);

  return (
    <div className="flex flex-col h-screen flex-1 bg-light-blue overflow-auto no-scrollbar">
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