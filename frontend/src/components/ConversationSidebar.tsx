import React, { useCallback, useEffect, useState } from "react";
import { SidebarConversationParams, ChatSidebarProps } from "@/types/types";
import { useSuiWallet } from "@/hooks/useSuiWallet";
import { getSuiNInfo } from "@/api/services/nameServices";
import { fetchAndDecryptChatHistory } from "../api/services/decryptService";
import { useListenMessages } from "../hooks/useListenMessages";


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

  // For the selected conversation
  const [selectedRecipientPub, setSelectedRecipientPub] = useState<Uint8Array | null>(null);

  // Use the hook for the selected conversation
  const { messages: selectedMessages } = useListenMessages({
    recipientAddress: selectedAddress,
    recipientPub: selectedRecipientPub,
    wallet: wallet || null,
  });

  useEffect(() => {
    if (selectedAddress && selectedMessages.length > 0) {
      const latestMessage = selectedMessages[selectedMessages.length - 1];
      setConversations(prevConvs => 
        prevConvs.map(conv => 
          conv.address === selectedAddress 
            ? { 
                ...conv, 
                message: latestMessage.text || "No message content",
                time: latestMessage.timestamp 
                ? new Date(latestMessage.timestamp).toLocaleTimeString()
                : new Date().toLocaleTimeString()
              }
            : conv
        )
      );
    }
  }, [selectedMessages, selectedAddress]);


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

  useEffect(() => {
    const fetchContacts = async () => {
      if (!wallet || !selectedAddress || !selectedRecipientPub) return;

      try {
        const history = await fetchAndDecryptChatHistory(
          selectedAddress,
          selectedRecipientPub,
          wallet
        );
        
        // Convert Message[] to SidebarConversationParams[]
        const conversationPreviews: SidebarConversationParams[] = history.map(msg => ({
          address: selectedAddress,
          name: selectedAddress, // You might want to get a display name from somewhere
          message: msg.text || "No message content",
          time: msg.timestamp 
    ? new Date(msg.timestamp).toLocaleTimeString()
    : new Date().toLocaleTimeString()
        }));

        setConversations(conversationPreviews);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    fetchContacts();
  }, [wallet, selectedAddress, selectedRecipientPub]);

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