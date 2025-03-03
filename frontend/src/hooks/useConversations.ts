import { useState, useEffect, useCallback } from 'react';
import { SidebarConversationParams } from '@/types/types';
import { WalletContextState } from '@suiet/wallet-kit';
import { getAllContactedAddresses } from '@/api/services/contactDbService';
import { decryptSingleMessage } from '@/api/services/decryptService';
import { formatTimestamp } from '@/api/services/messageService';

interface UseConversationsResult {
  conversations: SidebarConversationParams[];
  refreshConversations: () => Promise<void>;
}

export function useConversations(wallet: WalletContextState | null): UseConversationsResult {
  const [conversations, setConversations] = useState<SidebarConversationParams[]>([]);

  const fetchAndDecryptConversations = useCallback(async () => {
    if (!wallet) return;

    try {
      const contacts = await getAllContactedAddresses();
      const decryptedContacts = await Promise.all(
        contacts.map(async (contact) => {
          try {
            // Convert the public key array back to Uint8Array
            let publicKeyArray: Uint8Array | null = null;
            if (contact.publicKey && Array.isArray(contact.publicKey)) {
              publicKeyArray = new Uint8Array(contact.publicKey);
            }

            if (!publicKeyArray) {
              throw new Error('Invalid public key format');
            }

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
              publicKey: contact.publicKey,
              name: contact.name || contact.address,
              message: "Message encryption error",
              time: contact.time || "",
            };
          }
        })
      );
      
      // Sort conversations by time, most recent first
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

    const handleNewMessage = async (messageData: any) => {
      const { sender, recipient } = messageData;
      const otherAddress = sender === wallet.address ? recipient : sender;

      try {
        const decryptedMessage = await decryptSingleMessage(messageData.text, messageData.publicKey);
        setConversations((prevConversations) => {
          const updatedConversations = prevConversations.filter(conv => conv.address !== otherAddress);
          const existingConversation = prevConversations.find(conv => conv.address === otherAddress);
          
          const newConversation: SidebarConversationParams = {
            address: otherAddress,
            publicKey: existingConversation?.publicKey || messageData.publicKey,
            name: existingConversation?.name || messageData.name || otherAddress,
            message: decryptedMessage || "No Messages",
            time: formatTimestamp(messageData.timestamp),
          };
          
          return [newConversation, ...updatedConversations];
        });
      } catch (error) {
        console.error(`Failed to decrypt message for ${otherAddress}:`, error);
        // Keep the conversation in the list but mark the message as failed
        setConversations((prevConversations) => {
          const updatedConversations = prevConversations.filter(conv => conv.address !== otherAddress);
          const existingConversation = prevConversations.find(conv => conv.address === otherAddress);
          
          const newConversation: SidebarConversationParams = {
            address: otherAddress,
            publicKey: existingConversation?.publicKey || messageData.publicKey,
            name: existingConversation?.name || messageData.name || otherAddress,
            message: "Message encryption error",
            time: formatTimestamp(messageData.timestamp),
          };
          
          return [newConversation, ...updatedConversations];
        });
      }
    };

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

    // Handle WebSocket errors
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