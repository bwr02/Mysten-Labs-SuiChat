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
            } else {
              // If we don't have a public key in the contact, try to fetch it
              console.log(`Fetching public key for ${contact.address} from database`);
              const storedPublicKey = await getPublicKeyByAddress(contact.address);
              if (storedPublicKey) {
                const keyBuffer = Buffer.from(storedPublicKey, 'hex');
                publicKeyArray = new Uint8Array(keyBuffer);
                console.log(`Retrieved public key for ${contact.address}:`, publicKeyArray);
              }
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
            // Try to get the public key even in error case
            let publicKey = null;
            try {
              const storedPublicKey = await getPublicKeyByAddress(contact.address);
              if (storedPublicKey) {
                const keyBuffer = Buffer.from(storedPublicKey, 'hex');
                publicKey = new Uint8Array(keyBuffer);
              }
            } catch (e) {
              console.error(`Failed to get public key for ${contact.address}:`, e);
            }
            
            return {
              address: contact.address,
              publicKey: publicKey,
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

      console.log('Setting conversations with public keys:', sortedContacts.map(c => ({
        address: c.address,
        hasPublicKey: !!c.publicKey,
        publicKeyLength: c.publicKey?.length
      })));
      
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
        // First try to get the public key from existing conversations
        const existingConversation = conversations.find(conv => conv.address === otherAddress);
        console.log('Found existing conversation:', {
          address: otherAddress,
          hasExistingConv: !!existingConversation,
          existingPublicKey: existingConversation?.publicKey,
          publicKeyLength: existingConversation?.publicKey?.length
        });

        let publicKeyArray = existingConversation?.publicKey;

        if (!publicKeyArray) {
          console.log('No existing conversation found, fetching public key from contacts');
          // Try to fetch the public key from contacts database
          const storedPublicKey = await getPublicKeyByAddress(otherAddress);
          console.log('Retrieved stored public key:', storedPublicKey);
          
          if (storedPublicKey) {
            // Convert the hex string to Uint8Array
            const keyBuffer = Buffer.from(storedPublicKey, 'hex');
            publicKeyArray = new Uint8Array(keyBuffer);
            console.log('Converted public key to Uint8Array:', {
              length: publicKeyArray.length,
              bytes: Array.from(publicKeyArray)
            });
          } else {
            console.error('No public key found in contacts database');
            throw new Error('No public key available');
          }
        }

        if (!publicKeyArray) {
          console.error('No public key available for decryption');
          throw new Error('No public key available');
        }

        console.log('Attempting decryption with public key:', {
          length: publicKeyArray.length,
          bytes: Array.from(publicKeyArray)
        });

        const decryptedMessage = await decryptSingleMessage(messageData.text, publicKeyArray);
        setConversations((prevConversations) => {
          const updatedConversations = prevConversations.filter(conv => conv.address !== otherAddress);
          const existingConv = prevConversations.find(conv => conv.address === otherAddress);
          
          const newConversation: SidebarConversationParams = {
            address: otherAddress,
            publicKey: publicKeyArray,
            name: existingConv?.name || messageData.name || otherAddress,
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
            publicKey: existingConversation?.publicKey || null,
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