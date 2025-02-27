import { useState, useCallback } from 'react';
import { WalletContextState } from '@suiet/wallet-kit';
import { sendMessage } from '../api/services/messageService';
// import { getOrCreateSignature } from '@/api/services/cryptoService';

export interface UseMessageSendingProps {
  address: string;
  recipientAddress: string;
  wallet: WalletContextState | null;
  onMessageSent: (message: string, timestamp: number, txId: string) => void;
  refreshBalance: () => Promise<string | null>;
}

export const useMessageSending = ({
  address,
  recipientAddress,
  wallet,
  onMessageSent,
  refreshBalance
}: UseMessageSendingProps) => {
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  const sendMessageHandler = useCallback(async (message: string): Promise<boolean> => {
    if (!address || !recipientAddress || !message.trim() || !wallet) {
      setStatus(
        !address ? "Sender address is missing." :
        !recipientAddress ? "Recipient address is missing." :
        !message.trim() ? "Message cannot be empty." :
        "Wallet is not connected."
      );
      return false;
    }

    try {
      setSending(true);
      setStatus("Signing message...");

    //   const signature = await getOrCreateSignature(wallet);
    // TODO: fix hardcode walletSignature, this is done for debugging
      const signature = localStorage.getItem("walletSignature");

      if (!signature) {
        throw new Error("Failed to obtain a valid signature.");
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
      await refreshBalance();
      return true;
      
    } catch (error) {
      console.error('Error:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Failed to send message'}`);
      return false;
    } finally {
      setSending(false);
    }
  }, [address, recipientAddress, wallet, onMessageSent, refreshBalance]);

  return {
    sending,
    status,
    sendMessageHandler
  };
}; 