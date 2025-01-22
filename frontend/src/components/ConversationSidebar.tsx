import React, { useCallback, useEffect, useState } from "react";
import { SidebarConversationParams } from "@/types/SidebarType";
import { getAllContactedAddresses, getDecryptedMessage } from "../api/services/dbService";
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
    className={`flex items-center gap-3 cursor-pointer p-1 rounded
      ${isSelected 
        ? "bg-blue-800" 
        : "hover:bg-gray-600"
      }`}
  >
    <img src="user.png" alt="avatar" className="w-10 h-10 rounded-full object-cover" />
    <div className="flex-grow">
      <span className="font-semibold text-gray-300 block">{conv.name}</span>
      <span className="text-gray-400">{conv.message}</span>
    </div>
    <span className="text-gray-400 text-sm">{conv.time}</span>
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

  useEffect(() => {
    const fetchContacts = async () => {
      try {
        const initialContacts = await getAllContactedAddresses();
        
        const decryptedContacts = await Promise.all(
          initialContacts.map(async (contact) => {
            try {
              if (!contact.message) {
                return { ...contact, message: "No Messages" };
              }
              
              const decryptedMessage = await getDecryptedMessage(
                contact.address,
                wallet,
                contact.message
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

    if (wallet) {
      fetchContacts();
    }
  }, [wallet]);

  const handleSelectConversation = useCallback((address: string) => {
    setSelectedAddress(address);
    setRecipientAddress(address);
  }, [setRecipientAddress]);

  return (
    <div className="w-1/4 p-4 bg-medium-blue flex flex-col overflow-auto">      
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