import React, {memo, useCallback, useState, useRef, useEffect} from "react";
import {useSuiWallet} from '../hooks/useSuiWallet';
import {sendMessage} from '../api/services/messageService';
import {MessageInputFieldProps} from "@/types/types.ts";
import { SendButton } from "./SendButton";


export const MessageInputField = memo(({ recipientAddress, onMessageSent }: MessageInputFieldProps) => {
  const { address, loading, error, refreshBalance, wallet } = useSuiWallet();
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);


  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  }, []);

  // Auto-resize the textarea whenever the message changes.
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"; // Reset to auto
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [message]);

  const handleSendMessage = useCallback(async (
    event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    event.preventDefault();
    
    if (!address || !recipientAddress || !message.trim() || !wallet) {
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

  const handleKeyDown = useCallback((event: React.KeyboardEvent<HTMLTextAreaElement>) => {
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
    <div className="p-4 -mb-2">
      {status && (
        <div className="text-gray-400 text-sm mb-2">
          {status}
        </div>
      )}
      <div className="relative w-full">
        <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Type a message..."
            className="w-full px-5 py-4 text-sm text-gray-200 bg-lighter-blue border-none rounded-2xl outline-none placeholder-gray-500 pr-10 resize-none overflow-hidden"
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={sending}
            style={{minHeight: "3rem"}} // Set your minimum height here
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