import React, { useRef, useEffect, useState } from "react";
import { MessageInputField } from "./MessageInputField";
import { MessageBubble } from "./MessageBubble";
import { RecipientBar } from "./RecipientBar";
import { useListenMessages } from "@/hooks/useListenMessages";
import { getUserPublicKey } from "@/api/services/publicKeyService";
import { ChatPanelProps } from "@/types/types";
import { useWallet } from "@suiet/wallet-kit";
import { useMessageSending } from "../hooks/useMessageSending";

export const ChatPanel: React.FC<ChatPanelProps> = ({ recipientAddress }) => {
  const wallet = useWallet();
  const [recipientName, setRecipientName] = useState<string | null>(null);
  const [suiNS, setSuiNS] = useState<string | null>(null);
  const [recipientPub, setRecipientPub] = useState<Uint8Array | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages, error: listenError } = useListenMessages({
    recipientAddress,
    recipientPub,
    wallet,
  });

  const handleMessageReceived = (
    message: string,
    timestamp: number,
    txDigest: string,
  ) => {
    // This will be called after a message is successfully sent
    // The message will be picked up by useListenMessages automatically
  };

  const { sending, status, sendMessageWithWallet } = useMessageSending(
    recipientAddress,
    recipientPub,
    handleMessageReceived,
  );

  useEffect(() => {
    async function fetchRecipientKey() {
      if (recipientAddress) {
        const recipPubKey = await getUserPublicKey(recipientAddress);
        setRecipientPub(recipPubKey);
      }
    }
    fetchRecipientKey();
  }, [recipientAddress]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (listenError) {
      console.error("Error listening to messages:", listenError);
    }
  }, [listenError]);

  return (
    <div className="flex flex-col h-screen flex-1 bg-light-blue overflow-auto no-scrollbar">
      <RecipientBar recipientName={recipientName} address={recipientAddress} suins={suiNS}/>
      <div className="flex-grow flex flex-col gap-2 px-4 py-2 justify-end mb-4">
        {messages.map((message, index) => (
          <MessageBubble
            key={`${index}-${message.timestamp}`}
            message={message}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
      <div className="w-full px-4 py-3 bg-light-blue border-t border-gray-700 sticky bottom-0">
        <MessageInputField
          recipientAddress={recipientAddress}
          recipientPub={recipientPub}
          onMessageSent={sendMessageWithWallet}
          disabled={sending}
          status={status}
        />
      </div>
    </div>
  );
};
