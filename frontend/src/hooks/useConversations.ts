import { useState, useEffect, useCallback } from 'react';
import { SidebarConversationParams } from '@/types/types';
import { WalletContextState } from '@suiet/wallet-kit';
import { getAllContactedAddresses, getPublicKeyByAddress } from '@/api/services/contactDbService';
import { decryptSingleMessage } from '@/api/services/decryptService';
import { formatTimestamp } from '@/api/services/messageService';

interface UseConversationsResult {
  conversations: SidebarConversationParams[];
  refreshConversations: () => Promise<void>;
}

export function useConversations(wallet: WalletContextState | null): UseConversationsResult {
  const [conversations, setConversations] = useState<SidebarConversationParams[]>([]);

  const getPublicKeyForAddress = async (address: string): Promise<Uint8Array> => {
    const storedPublicKey = await getPublicKeyByAddress(address);
    if (!storedPublicKey) {
      throw new Error('No public key available');
    }
    return new Uint8Array(Buffer.from(storedPublicKey, 'hex'));
  };

  const handleNewMessage = async (messageData: any) => {
    const { sender, recipient, text, timestamp, name } = messageData;
    const otherAddress = sender === wallet?.address ? recipient : sender;

    try {
      const publicKeyArray = await getPublicKeyForAddress(otherAddress);
      const decryptedMessage = await decryptSingleMessage(text, publicKeyArray);

      setConversations(prevConversations => {
        const updatedConversations = prevConversations.filter(conv => conv.address !== otherAddress);
        const existingConv = prevConversations.find(conv => conv.address === otherAddress);
        
        const newConversation: SidebarConversationParams = {
          address: otherAddress,
          publicKey: publicKeyArray,
          name: existingConv?.name || name || otherAddress,
          message: decryptedMessage || "No Messages",
          time: formatTimestamp(timestamp),
        };
        
        return [newConversation, ...updatedConversations];
      });
    } catch (error) {
      console.error(`Failed to decrypt message for ${otherAddress}:`, error);
      setConversations(prevConversations => {
        const updatedConversations = prevConversations.filter(conv => conv.address !== otherAddress);
        const existingConv = prevConversations.find(conv => conv.address === otherAddress);
        
        const newConversation: SidebarConversationParams = {
          address: otherAddress,
          publicKey: null,
          name: existingConv?.name || name || otherAddress,
          message: "Message encryption error",
          time: formatTimestamp(timestamp),
        };
        
        return [newConversation, ...updatedConversations];
      });
    }
  };

  const fetchAndDecryptConversations = useCallback(async () => {
    if (!wallet) return;

    try {
      const contacts = await getAllContactedAddresses();
      const decryptedContacts = await Promise.all(
        contacts.map(async (contact) => {
          try {
            const publicKeyArray = await getPublicKeyForAddress(contact.address);
            const decryptedMessage = contact.message 
              ? await decryptSingleMessage(contact.message, publicKeyArray)
              : "No Messages";

            return {
              address: contact.address,
              publicKey: publicKeyArray,
              name: contact.name || contact.address,
              message: decryptedMessage,
              time: contact.time || "",
            };
          } catch (error) {
            console.error(`Failed to decrypt message for ${contact.address}:`, error);
            return {
              address: contact.address,
              publicKey: null,
              name: contact.name || contact.address,
              message: "Message encryption error",
              time: contact.time || "",
            };
          }
        })
      );
      
      const sortedContacts = decryptedContacts.sort((a, b) => {
        const timeA = a.time ? new Date(a.time).getTime() : 0;
        const timeB = b.time ? new Date(b.time).getTime() : 0;
        return timeB - timeA;
      });
      
      setConversations(sortedContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
      setConversations([]);
    }
  }, [wallet]);

  useEffect(() => {
    if (wallet) {
      fetchAndDecryptConversations();
    }
  }, [wallet, fetchAndDecryptConversations]);

  useEffect(() => {
    if (!wallet) return;

    const wsNewMessage = new WebSocket('ws://localhost:8080');
    const wsEditContact = new WebSocket('ws://localhost:8081');

    wsNewMessage.onmessage = async (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new-message') {
        await handleNewMessage(data.message);
      }
    };

    wsEditContact.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'edit-contact' || data.type === 'refresh-contacts') {
        fetchAndDecryptConversations();
      }
    };

    const handleWsError = (ws: WebSocket, name: string) => {
      ws.onerror = (error) => {
        console.error(`${name} WebSocket error:`, error);
      };
      ws.onclose = () => {
        console.log(`${name} WebSocket closed, attempting to reconnect in 5s...`);
        setTimeout(() => {
          if (wallet) {
            fetchAndDecryptConversations();
          }
        }, 5000);
      };
    };

    handleWsError(wsNewMessage, 'Message');
    handleWsError(wsEditContact, 'Contact');

    return () => {
      wsNewMessage.close();
      wsEditContact.close();
    };
  }, [wallet, fetchAndDecryptConversations]);

  return { 
    conversations,
    refreshConversations: fetchAndDecryptConversations
  };
} 