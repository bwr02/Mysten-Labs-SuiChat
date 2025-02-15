import React, { useCallback, useEffect, useState } from "react";
import { SidebarConversationParams } from "@/types/SidebarType";
import { getAllContactedAddresses, getDecryptedMessage, getAllContacts } from "../api/services/dbService";
import { useSuiWallet } from "@/hooks/useSuiWallet";
import { getSuiNInfo } from "@/api/services/nameServices";

interface ChatSidebarProps {
  setRecipientAddress: (address: string) => void;
}

const ConversationItem = React.memo(({ 
  conv, 
  isSelected, 
  onSelect 
}: { 
  conv: SidebarConversationParams;
  isSelected: boolean;
  onSelect: () => void;
}) => (
    <div
        onClick={onSelect}
        className={`flex items-start gap-2 cursor-pointer p-2 rounded
      ${isSelected ? "bg-blue-800" : "hover:bg-gray-600"}`}>
      <img src="user.png" alt="avatar" className="w-10 h-10 rounded-full object-cover"/>
      <div className="flex flex-col flex-grow overflow-hidden">
        <div className="flex items-center justify-between gap-2">
          <div className="font-semibold text-gray-300 text-sm truncate max-w-[70%]">{conv.name}</div>
          <div className="text-gray-400 text-xs whitespace-nowrap">{conv.time}</div>
        </div>
      <div className="text-gray-400 text-sm line-clamp-2 max-h-10 overflow-hidden">
        {conv.message}
        </div>
      </div>
    </div>
));

ConversationItem.displayName = 'ConversationItem';
export const ConversationSidebar = ({ setRecipientAddress }: ChatSidebarProps) => {
  const [conversations, setConversations] = useState<SidebarConversationParams[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [searchText, setSearchText] = useState("");
  const { wallet } = useSuiWallet();

  const handleSearchInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  }, []);

  const handleSearchForUser = useCallback(async () => {
    if (!searchText.trim()) return;

    try {
      const targetAddress = await getSuiNInfo("@" + searchText);
      if (targetAddress) {
        setRecipientAddress(targetAddress);
        setSelectedAddress(targetAddress);
        setSearchText("");
      } else {
        console.log("No target address found for the given name.");
      }
    } catch (error) {
      console.error("Error fetching target address:", error);
    }
  }, [searchText, setRecipientAddress]);

  const handleSearchKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSearchForUser();
      event.stopPropagation();
    }
  }, [handleSearchForUser]);

  const fetchContacts = useCallback(async () => {
    try {
      const initialContacts = await getAllContactedAddresses();
      if (initialContacts.length > 0) {
        const mostRecentContact = initialContacts[0];
        setRecipientAddress(mostRecentContact.address);
        setSelectedAddress(mostRecentContact.address);
      }

      const decryptedContacts = await Promise.all(
        initialContacts.map(async (contact) => {
          try {
            if (!contact.message) {
              return { ...contact, message: "No Messages", timestamp: new Date() };
            }

            const decryptedMessage = await getDecryptedMessage(
              contact.address,
              wallet,
              contact.message
            );
            return { ...contact, message: decryptedMessage || "No Messages", timestamp: contact.timestamp || new Date() };
          } catch (error) {
            console.error(`Failed to decrypt message for ${contact.address}`, error);
            return { ...contact, message: "(decryption error)", timestamp: new Date() };
          }
        })
      );

      setConversations(decryptedContacts);
    } catch (error) {
      console.error("Error fetching contacts:", error);
    }
  }, [wallet, setRecipientAddress]);

  // WebSocket to listen for new messages and update conversations
  useEffect(() => {
    const ws = new WebSocket('ws://localhost:8080');

    const handleNewMessage = async (messageData: any) => {
      try {
        const { sender, recipient, text, timestamp } = messageData;
        const decryptedMessage = await getDecryptedMessage(
          recipient, // Assuming message is intended for recipient
          wallet,
          text
        );

        const updatedConversations = [...conversations];
        const messageTimestamp = new Date(timestamp); // Ensure we use the provided timestamp

        // Find the conversation and update the message and timestamp
        const conversationIndex = updatedConversations.findIndex(
          (conv) => conv.address === sender || conv.address === recipient
        );

        if (conversationIndex > -1) {
          // Update the existing conversation with the new message and timestamp
          updatedConversations[conversationIndex] = {
            ...updatedConversations[conversationIndex],
            message: decryptedMessage || "No Messages",
            timestamp: messageTimestamp,
          };

          // Move the conversation with the new message to the top
          const [updatedConversation] = updatedConversations.splice(conversationIndex, 1);
          updatedConversations.unshift(updatedConversation);
        } else {
          // New conversation, add it to the top
          updatedConversations.unshift({
            address: sender,
            message: decryptedMessage || "No Messages",
            timestamp: messageTimestamp,
          });
        }

        setConversations(updatedConversations);
      } catch (error) {
        console.error('Error decrypting new message:', error);
      }
    };

    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new-message') {
        const { sender, recipient } = data.message;
        if (sender === selectedAddress || recipient === selectedAddress) {
          handleNewMessage(data.message);
        }
      }
    };

    return () => ws.close(); // Cleanup on unmount
  }, [conversations, selectedAddress, wallet]);

  useEffect(() => {
    if (wallet) {
      fetchContacts();
    }
  }, [wallet, fetchContacts]);

  const handleSelectConversation = useCallback((address: string) => {
    setSelectedAddress(address);
    setRecipientAddress(address);
  }, [setRecipientAddress]);

  return (
    <div className="w-80 shrink-0 p-4 bg-medium-blue flex flex-col overflow-y-auto overflow-x-hidden">
      <div className="mb-4">
        <input
          type="text"
          className="border-none rounded-xl px-3 py-1 w-full bg-dark-blue text-gray-300 text-base focus:ring-0"
          placeholder="Find a conversation"
          value={searchText}
          onChange={handleSearchInputChange}
          onKeyDown={handleSearchKeyDown}
        />
      </div>

      <h2 className="text-sm font-semibold text-gray-300 mb-2">DIRECT MESSAGES</h2>
      <div className="flex flex-col gap-3">
        {conversations.map((conv) => (
          <ConversationItem 
            key={conv.address}
            conv={conv}
            isSelected={selectedAddress === conv.address}
            onSelect={() => handleSelectConversation(conv.address)}
          />
        ))}
      </div>
    </div>
  );
};
