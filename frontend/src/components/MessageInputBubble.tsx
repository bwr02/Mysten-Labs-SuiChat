import React, { useState } from "react";
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { sendMessage } from '../api/messageService';

interface MessageInputBubbleProps {
  address: string | null;
  keypair: Ed25519Keypair | null;
  recipientAddress: string | null;
  onStatusUpdate: (status: string) => void;
  onMessageSent: () => Promise<void>;
  onMessageDisplayed: (message: string, timestamp: number, txDigest: string) => void;
}

export default function MessageInputBubble({ 
  address, 
  keypair,
  recipientAddress,
  onStatusUpdate, 
  onMessageSent,
  onMessageDisplayed
}: MessageInputBubbleProps) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };

  const handleSendMessage = async (event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    
    if (!keypair || !address || !recipientAddress || !message.trim()) return;

    try {
      setSending(true);
      onStatusUpdate("Sending message...");

      const result = await sendMessage({
        senderAddress: address,
        recipientAddress, // TODO: Replace with actual recipient "0xc5b4d28027c266bf80603617796513f9b7afc0f66957ead0a94b4d78e1b9671f"
        content: message,
        keypair
      });
      
      onStatusUpdate(`Message sent! Transaction ID: ${result.txId}`);
      onMessageDisplayed(message, result.timestamp, result.txId);
      setMessage("");
      
      await onMessageSent();
    } catch (error) {
      onStatusUpdate(`Error: ${error instanceof Error ? error.message : 'Failed to send message'}`);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      handleSendMessage(event);
    }
  };

  return (
    <div className="message-input">
      <input
        id="message"
        name="message"
        type="text"
        placeholder="Type your message here"
        className="message-input-box"
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={sending}
      />
      <button 
        type="submit" 
        className="message-send-button" 
        onClick={handleSendMessage}
        disabled={sending || !message.trim() || !address}
      >
        {sending ? (
          <div className="loading-spinner" />
        ) : (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
          </svg>
        )}
      </button>
    </div>
  );
}
