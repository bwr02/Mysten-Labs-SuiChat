import { useState, useEffect } from "react";
import { Message, UseListenMessagesProps } from "@/types/types";
import {
  decryptSingleMessage,
  fetchAndDecryptChatHistory,
} from "@/api/services/decryptService";

export const useListenMessages = ({
  recipientAddress,
  recipientPub,
  wallet,
}: UseListenMessagesProps) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  // Load chat history
  useEffect(() => {
    async function loadChatHistory() {
      if (!recipientAddress || !recipientPub || !wallet) return;

      try {
        const history = await fetchAndDecryptChatHistory(
          recipientAddress,
          recipientPub,
          wallet,
        );
        setMessages(history);
      } catch (err) {
        setError("Failed to load chat history");
        console.error(err);
      }
    }

    loadChatHistory();
  }, [recipientAddress, recipientPub, wallet]);

  // Listen for new messages via WebSocket
  useEffect(() => {
    if (!recipientAddress || !recipientPub || !wallet) return;

    const ws = new WebSocket("ws://localhost:8080");

    ws.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "new-message") {
        const { sender, recipient, text, messageType, timestamp } =
          data.message;

        if (sender === recipientAddress || recipient === recipientAddress) {
          try {
            const decryptedText = await decryptSingleMessage(
              text,
              recipientPub,
              wallet,
            );

            setMessages((prev) => [
              ...prev,
              {
                sender: messageType,
                text: decryptedText,
                timestamp,
              },
            ]);
          } catch (err) {
            console.error("Failed to decrypt new message:", err);
          }
        }
      }
    };

    return () => ws.close();
  }, [recipientAddress, recipientPub, wallet]);

  return { messages, error };
};
