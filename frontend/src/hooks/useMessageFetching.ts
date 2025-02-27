import { useEffect } from 'react';
import { Message } from '@/types/types';
import { fetchAndDecryptChatHistory } from '@/api/services/decryptService';
import { WalletContextState } from '@suiet/wallet-kit';

export function useMessageFetching(
  recipientAddress: string,
  wallet: WalletContextState | null,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) {
  useEffect(() => {
    const fetchMessages = async () => {
      const initialMessages = await fetchAndDecryptChatHistory(recipientAddress, recipientPub);
      setMessages(initialMessages);
    };

    fetchMessages();
  }, [recipientAddress, wallet, setMessages]);
} 