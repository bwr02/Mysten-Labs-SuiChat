import React, { memo, useCallback, useState, useRef } from "react";
import { useChatWallet } from '../hooks/useChatWallet';
import { MessageInputFieldProps } from "@/types/types.ts";
import { SendButton } from "./SendButton";
import { useMessageSending } from "@/hooks/useMessageSending";
import { useTextareaAutosize } from "@/hooks/useTextareaAutosize";

export const MessageInputField = memo(({ recipientAddress, recipientPubKey, onMessageSent }: MessageInputFieldProps) => {
  const { address, loading, error, refreshBalance, suiWallet } = useChatWallet();
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const { sending, status, sendMessageHandler } = useMessageSending({
    address: address || "",
    recipientAddress,
    recipientPubKey,
    wallet: suiWallet,
    onMessageSent,
    refreshBalance
  });

  useTextareaAutosize(textareaRef, message);

  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(event.target.value);
  }, []);

  const handleSendMessage = useCallback(async (
    event: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLTextAreaElement>
  ) => {
    event.preventDefault();
    const success = await sendMessageHandler(message);
    if (success) {
      setMessage("");
    }
  }, [message, sendMessageHandler]);

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
          style={{minHeight: "3rem"}}
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