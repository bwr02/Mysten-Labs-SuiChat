import { useState, useCallback } from "react";
import { useSuiWallet } from "@/hooks/useSuiWallet";
import { sendMessage } from "@/api/services/messageService";

export const useMessageSending = (
  recipientAddress: string | null,
  recipientPub: Uint8Array | null,
  onMessageSent: (message: string, timestamp: number, txDigest: string) => void,
) => {
  const { address, wallet, refreshBalance } = useSuiWallet();
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  const sendMessageWithWallet = useCallback(
    async (message: string) => {
      if (
        !address ||
        !recipientAddress ||
        !recipientPub ||
        !message.trim() ||
        !wallet
      ) {
        setStatus(
          !address
            ? "Sender address is missing."
            : !recipientAddress
              ? "Recipient address is missing."
              : !message.trim()
                ? "Message cannot be empty."
                : "Wallet is not connected.",
        );
        return false;
      }

      try {
        setSending(true);
        setStatus("Sending message...");

        const result = await sendMessage({
          senderAddress: address,
          recipientAddress,
          recipientPub,
          content: message,
          wallet,
        });

        setStatus(`Message sent! Transaction ID: ${result.txId}`);
        onMessageSent(message, result.timestamp, result.txId);
        await refreshBalance();
        return true;
      } catch (error) {
        console.error("Error:", error);
        setStatus(
          `Error: ${error instanceof Error ? error.message : "Failed to send message"}`,
        );
        return false;
      } finally {
        setSending(false);
      }
    },
    [
      address,
      recipientAddress,
      recipientPub,
      wallet,
      onMessageSent,
      refreshBalance,
    ],
  );

  return { sending, status, sendMessageWithWallet };
};
