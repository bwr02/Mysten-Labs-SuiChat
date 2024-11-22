import React, { useState } from "react";
import { sendMessage } from '../api/services/messageService';
import { WalletContextState } from '@suiet/wallet-kit'

interface MessageInputBubbleProps {
  address: string | null;
  recipientAddress: string | null;
  wallet: WalletContextState | null;
  onStatusUpdate: (status: string) => void;
  onMessageSent: () => Promise<void>;
  onMessageDisplayed: (message: string, timestamp: number, txDigest: string) => void;
}

export default function MessageInputBubble({ 
  address, 
  recipientAddress,
  wallet,
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
    
    if (!address || !recipientAddress || !message.trim()) return;

    try {
      setSending(true);
      onStatusUpdate("Signing message...");
      
      // Get signature for temporary key derivation
      const messageBytes = new TextEncoder().encode("Random message for key derivation");
      const signatureData = await wallet?.signPersonalMessage({
        message: messageBytes
      });

      if (!signatureData?.signature) {
        throw new Error("Signature is undefined.");
      }

      if (!wallet) {
        throw new Error("Wallet is null.");
      }

      console.log('Signature data:', signatureData);

      onStatusUpdate("Sending message...");
    
      const result = await sendMessage({
        senderAddress: address,
        recipientAddress,
        content: message,
        signatureData,
        wallet,
      });
      
      onStatusUpdate(`Message sent! Transaction ID: ${result.txId}`);
      onMessageDisplayed(message, result.timestamp, result.txId);
      setMessage("");
      
      await onMessageSent();
    } catch (error) {
      console.error('Error:', error);
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
    <div className="relative w-full">
      <input
        id="message"
        name="message"
        type="text"
        placeholder="Type your message here"
        className="w-full px-5 py-4 text-sm text-gray-800 bg-purple-100 border-none rounded-full outline-none placeholder-gray-500 pr-10"
        value={message}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        disabled={sending}
      />
      <button
        type="submit"
        className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 ${
          sending || !message.trim() || !address ? "opacity-50 cursor-not-allowed" : "hover:text-gray-800"
        }`}
        onClick={handleSendMessage}
        disabled={sending || !message.trim() || !address}
      >
        {sending ? (
          <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin"></div>
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
