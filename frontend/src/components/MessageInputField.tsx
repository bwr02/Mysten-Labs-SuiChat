import React, { useState, useCallback, memo } from "react";
import { useSuiWallet } from '../hooks/useSuiWallet';
import { sendMessage } from '../api/services/messageService';

interface MessageInputFieldProps {
  recipientAddress: string | null;
  recipientPubKey: string | null;
  onMessageSent: (message: string, timestamp: number, txDigest: string) => void;
}

const SendButton = memo(({ sending, disabled, onClick }: { 
  sending: boolean; 
  disabled: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}) => (
  <button
    type="submit"
    onClick={onClick}
    className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 ${
      disabled ? "opacity-50 cursor-not-allowed" : "hover:text-gray-800"
    }`}
    disabled={disabled}
  >
    {sending ? (
      <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
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
));

SendButton.displayName = 'SendButton';

export const MessageInputField = memo(({ recipientAddress, recipientPubKey, onMessageSent }: MessageInputFieldProps) => {
  const { address, loading, error, refreshBalance, wallet } = useSuiWallet();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  }, []);

  const handleSendMessage = useCallback(async (event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    
    if (!address || !recipientAddress || !recipientPubKey || !message.trim() || !wallet) {
      setStatus(
        !address ? "Sender address is missing." :
        !recipientAddress ? "Recipient address is missing." :
        !message.trim() ? "Message cannot be empty." :
        "Wallet is not connected."
      );
      return;
    }

    try {
      setSending(true);
      setStatus("Signing message...");

      // Get or create signature
      let signature = localStorage.getItem('walletSignature');
      if (!signature) {
        const messageBytes = new TextEncoder().encode("Random message for key derivation");
        const signatureData = await wallet?.signPersonalMessage({
          message: messageBytes
        });
        if (!signatureData?.signature) {
          throw new Error("Failed to obtain a valid signature.");
        }
        signature = signatureData.signature;
        localStorage.setItem('walletSignature', signature);
      }

      setStatus("Sending message...");
      const result = await sendMessage({
        senderAddress: address,
        recipientAddress,
        recipientPubKey,
        content: message,
        signature,
        wallet,
      });
      
      setStatus(`Message sent! Transaction ID: ${result.txId}`);
      onMessageSent(message, result.timestamp, result.txId);
      setMessage("");
      await refreshBalance();
      
    } catch (error) {
      console.error('Error:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Failed to send message'}`);
    } finally {
      setSending(false);
    }
  }, [address, recipientAddress, message, wallet, onMessageSent, refreshBalance]);

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      handleSendMessage(event);
    }
  }, [handleSendMessage]);

  if (loading) {
    return <div className="text-gray-300">Connecting to wallet...</div>;
  }

  if (error) {
    return <div className="text-red-400">Wallet Error: {error}</div>;
  }

  const isDisabled = sending || !message.trim() || !address;

  return (
    <div className="p-4">
      {status && (
        <div className="text-gray-400 text-sm mb-2">
          {status}
        </div>
      )}
      <div className="relative w-full">
        <input
          type="text"
          placeholder="Type a message..."
          className="w-full px-5 py-4 text-sm text-gray-200 bg-lighter-blue border-none rounded-2xl outline-none placeholder-gray-500 pr-10"
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={sending}
        />
        <SendButton 
          sending={sending} 
          disabled={isDisabled} 
          onClick={handleSendMessage}
        />
      </div>
    </div>
  );
});

MessageInputField.displayName = 'MessageInputField';