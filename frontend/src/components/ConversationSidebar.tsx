import { useCallback, useEffect } from "react";
import { ChatSidebarProps, SidebarConversationParams } from "@/types/types";
import { useChatWallet } from "@/hooks/useChatWallet";
import { ConversationItem } from "./ConversationItem";
import { useConversations } from "@/hooks/useConversations";
import { useConversationSearch } from "@/hooks/useConversationSearch";

export const ConversationSidebar = ({ recipientAddress, setRecipient }: ChatSidebarProps) => {
  const { suiWallet } = useChatWallet();
  const { conversations } = useConversations(suiWallet);
  const { searchText, handleSearchInputChange, handleSearchKeyDown } = useConversationSearch(setRecipient);

  const handleSelectConversation = useCallback(
    (conv: SidebarConversationParams) => {
      if (conv.publicKey) {
        setRecipient(conv.address, conv.publicKey);
      } else {
        console.error("Public key not found for conversation:", conv.address);
      }
    },
    [setRecipient]
  );

  useEffect(() => {
    // If there are conversations and no recipient is set, use the first one.
    if (conversations.length > 0 && !recipientAddress) {
      const defaultContact = conversations[0];
      if (defaultContact.publicKey) {
      setRecipient(defaultContact.address, defaultContact.publicKey);
      } else {
        console.error("Public key not found for default contact:", defaultContact.address);
      }
    }
  }, [conversations, recipientAddress, setRecipient]);

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
            isSelected={recipientAddress === conv.address}
            onSelect={() => handleSelectConversation(conv)}
          />
        ))}
      </div>
    </div>
  );
};