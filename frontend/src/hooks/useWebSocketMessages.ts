import { useEffect } from 'react';
import { Message, broadcastMessageParams } from '@/types/types';
import { decryptSingleMessage } from '@/api/services/decryptService';
import { formatTimestamp } from '@/api/services/messageService';
import { WalletContextState } from '@suiet/wallet-kit';

export function useWebSocketMessages(
  recipientAddress: string,
  wallet: WalletContextState | null,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) {
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    const handleNewMessage = async (messageData: broadcastMessageParams) => {
      try {
        const decryptedMessage = await decryptSingleMessage(
          messageData.text,
          messageData.publicKey,
        );
    
        const timeString = formatTimestamp(messageData.timestamp);

        setMessages((prev) => [
          ...prev,
          {
            sender: messageData.messageType,
            text: decryptedMessage,
            timestamp: timeString,
            txDigest: messageData.txDigest,
          },
        ]);
      } catch (error) {
        console.error('Error decrypting message:', error);
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new-message') {
        const { sender, recipient } = data.message;
        if (sender === recipientAddress || recipient === recipientAddress) {
          handleNewMessage(data.message);
        }
      }
    };

    return () => ws.close();
  }, [recipientAddress, wallet, setMessages]);
} 