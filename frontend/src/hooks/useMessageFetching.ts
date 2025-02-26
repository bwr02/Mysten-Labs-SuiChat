import { useEffect } from 'react';
import { Message } from '@/types/types';
import { getMessagesWithAddress } from '@/api/services/messageDbService';
import { WalletContextState } from '@suiet/wallet-kit';

export function useMessageFetching(
  recipientAddress: string,
  wallet: WalletContextState | null,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) {
  useEffect(() => {
    const fetchMessages = async () => {
      const initialMessages = await getMessagesWithAddress(recipientAddress, wallet);
      setMessages(initialMessages);
    };

    fetchMessages();
  }, [recipientAddress, wallet, setMessages]);
} 