import { useState, useEffect } from 'react';
import { SidebarConversationParams } from '@/types/types';
import { WalletContextState } from '@suiet/wallet-kit';
import { getAllContactedAddresses } from '@/api/services/contactDbService';
import { decryptSingleMessage } from '@/api/services/decryptService';
import { formatTimestamp } from '@/api/services/messageService';

export function useConversations(wallet: WalletContextState | null) {
  const [conversations, setConversations] = useState<SidebarConversationParams[]>([]);

  const fetchAndDecryptConversations = async () => {
    try {
      const initialContacts = await getAllContactedAddresses();
      const decryptedContacts = await Promise.all(
        initialContacts.map(async (contact) => {
          try {
            if (!contact.message) {
              return { ...contact, message: "No Messages" };
            }
            if (!wallet) {
                throw new Error("Wallet is not available");
            }
            const decryptedMessage = await decryptSingleMessage(
              contact.message,
              contact.publicKey,
            );
            return { ...contact, message: decryptedMessage || "No Messages" };
          } catch (error) {
            console.error(`Failed to decrypt message for ${contact.address}`, error);
            return { ...contact, message: "(decryption error)" };
          }
        })
      );
      setConversations(decryptedContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  };

  useEffect(() => {
    if (wallet) {
      fetchAndDecryptConversations();
    }
  }, [wallet]);

  useEffect(() => {
    if (!wallet) return;

    const wsNewMessage = new WebSocket('ws://localhost:8080');
    const wsEditContact = new WebSocket('ws://localhost:8081');

    wsNewMessage.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new-message') {
        const { sender, recipient } = data.message;
        const otherAddress = sender === wallet.address ? recipient : sender;

        try {
          const decryptedMessage = await decryptSingleMessage(data.message.text, data.message.publicKey);
          setConversations((prevConversations) => {
            const updatedConversations = prevConversations.filter(conv => conv.address !== otherAddress);
            const existingConversation = prevConversations.find(conv => conv.address === otherAddress);
            const newConversation: SidebarConversationParams = {
              address: otherAddress,
              publicKey: existingConversation?.publicKey || new Uint8Array(),
              name: existingConversation?.name || data.message.name || otherAddress,
              message: decryptedMessage || "No Messages", 
              time: formatTimestamp(data.message.timestamp),
            };
            return [newConversation, ...updatedConversations];
          });
        } catch (error) {
          console.error(`Failed to decrypt message for ${otherAddress}`, error);
        }
      }
    };

    wsEditContact.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'edit-contact' || data.type === 'refresh-contacts') {
        fetchAndDecryptConversations();
      }
    };

    return () => {
      wsNewMessage.close();
      wsEditContact.close();
    };
  }, [wallet]);

  return { conversations };
} 