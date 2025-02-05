import React, { useState, useCallback, memo } from "react";
import { SendButton } from "./SendButton";
import { useMessageSending } from "@/hooks/useMessageSending";
import { MessageInputFieldProps } from "@/types/types";
import { useSuiWallet } from "@/hooks/useSuiWallet";

export const MessageInputField = memo(
  ({
    recipientAddress,
    recipientPub,
    onMessageSent,
  }: MessageInputFieldProps) => {
    const [message, setMessage] = useState("");
    const { loading, error, address } = useSuiWallet();
    const { sending, status, sendMessageWithWallet } = useMessageSending(
      recipientAddress,
      recipientPub,
      onMessageSent,
    );

    const handleInputChange = useCallback(
      (event: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(event.target.value);
      },
      [],
    );

    const handleSendMessage = useCallback(
      async (
        event:
          | React.MouseEvent<HTMLButtonElement>
          | React.KeyboardEvent<HTMLInputElement>,
      ) => {
        event.preventDefault();
        const success = await sendMessageWithWallet(message);
        if (success) {
          setMessage("");
        }
      },
      [message, sendMessageWithWallet],
    );

    const handleKeyDown = useCallback(
      (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (event.key === "Enter" && !event.shiftKey) {
          handleSendMessage(event);
        }
      },
      [handleSendMessage],
    );

    if (loading) {
      return <div className="text-gray-300">Connecting to wallet...</div>;
    }

    if (error) {
      return <div className="text-red-400">Wallet Error: {error}</div>;
    }

    const isDisabled = sending || !message.trim() || !address;

    return (
      <div className="p-4">
        {status && <div className="text-gray-400 text-sm mb-2">{status}</div>}
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
  },
);

MessageInputField.displayName = "MessageInputField";
