import { useState, useCallback, useEffect } from 'react';
import { WalletContextState } from '@suiet/wallet-kit';
import { sendMessage } from '../api/services/messageService';
import { STORAGE_KEYS } from '../types/types';

export interface UseMessageSendingProps {
  address: string;
  recipientAddress: string;
  recipientPubKey: Uint8Array;
  wallet: WalletContextState | null;
  onMessageSent: (message: string, timestamp: number, txId: string) => void;
  refreshBalance: () => Promise<string | null>;
  setSendingComplete: () => void;
}

export const useMessageSending = ({
  address,
  recipientAddress,
  recipientPubKey,
  wallet,
  onMessageSent,
  refreshBalance,
  setSendingComplete
}: UseMessageSendingProps) => {
  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    const handleMessageSent = (event: CustomEvent) => {
      setSending(false);
      setSendingComplete();
    };

    window.addEventListener('messageSent', handleMessageSent as EventListener);
    return () => {
      window.removeEventListener('messageSent', handleMessageSent as EventListener);
    };
  }, [setSendingComplete]);

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
      const result = await sendMessage({
        senderAddress: address,
        recipientAddress,
        recipientPubKey,
        message,
        wallet,
      });
      
      onMessageSent(message, result.timestamp, result.txId);
      await refreshBalance();
      return true;
      
    } catch (error) {
      console.error('Error:', error);
      setStatus(`Error: ${error instanceof Error ? error.message : 'Failed to send message'}`);
      setSending(false);
      return false;
    }
  }, [address, recipientAddress, wallet, onMessageSent, refreshBalance]);

  return {
    sending,
    status,
    sendMessageHandler
  };
}; 