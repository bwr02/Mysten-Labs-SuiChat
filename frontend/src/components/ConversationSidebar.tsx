import  React, { useCallback, useEffect, useState } from "react";
import {SidebarConversationParams} from "@/types/SidebarType";
import { getSuiNInfo } from "@/api/services/nameServices";
import { getAllContactedAddresses, getDecryptedMessage } from "../api/services/dbService";
import { useSuiWallet } from "../hooks/useSuiWallet";
// component to display all the chat previews on the left handside

const INITIAL_CONVERSATIONS: SidebarConversationParams[] = [
  { address:"0xPlaceholder", name: "Ben", message: "Just finished our prd doc!", time: "10 min" },
  { address:"0xPlaceholder", name: "Ashton", message: "LGTM", time: "14 min" },
  { address:"0xPlaceholder", name: "Sophia", message: "Can’t wait for our standup!", time: "21 min" },
  { address:"0xPlaceholder", name: "Chloe", message: "Has anyone seen PR?", time: "23 min" },
  { address:"0xPlaceholder", name: "Bonnie", message: "Where are we meeting...", time: "24 min" },
  { address:"0xPlaceholder", name: "Jane", message: "Have you done 171 HW?", time: "36 min" },
  { address:"0xPlaceholder", name: "John", message: "What time is midterm?", time: "45 min" },
  { address:"0xPlaceholder", name: "Adam", message: "I requested changes on your PR", time: "49 min" },
  { address:"0xPlaceholder", name: "Ryan", message: "What is on the quiz?", time: "53 min" },
  { address:"0xPlaceholder", name: "Emma", message: "Did you study yet?", time: "56 min" },
];

interface ChatSidebarProps {
  setRecipientAddress: (address: string) => void;
}

const ConversationItem = React.memo(({ conv }: { conv: SidebarConversationParams }) => (
  <div className="flex items-center gap-3 cursor-pointer hover:bg-gray-600 p-1 rounded">
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
  const [searchText, setSearchText] = useState("");
  const handleSearchInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  }, []);

  const handleSearchForUser = useCallback(async () => {
    if (!searchText.trim()) return;

    try {
      const targetAddress = await getSuiNInfo("@" + searchText);
      if (targetAddress) {
        setRecipientAddress(targetAddress);
        console.log("Recipient address stored:", targetAddress);
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
interface ChatSidebarProps {
  setRecipientAddress: (address: string) => void;
}
export const ConversationSidebar = ({ setRecipientAddress }: ChatSidebarProps) => {
  // const [isSearchOpen, setIsSearchOpen] = useState(false);
  // const [searchText, setSearchText] = useState("");

  // This is now controlled by fetched data
  const [conversations, setConversations] = useState<SidebarConversationParams[]>([]);
  // Track which conversation is selected (for highlighting)
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);


// Pull in your wallet context (used for key derivation)
  const { wallet } = useSuiWallet();


  // Fetch initial "contacts" and decrypt their most recent messages
  useEffect(() => {
    const fetchContacts = async () => {
      try {
        // 1) Get the array of contacts with encrypted messages
        const initialContacts = await getAllContactedAddresses();
        // console.log("Contacts from server (encrypted):", initialContacts);

        // 2) Decrypt each contact's message
        const decryptedContacts = await Promise.all(
            initialContacts.map(async (contact) => {
              try {
                if (!contact.message) {
                  // If message is null or empty, show "No Messages"
                  return { ...contact, message: "No Messages" };
                } else {
                  // Otherwise, decrypt the message
                  const decryptedMessage = await getDecryptedMessage(
                      contact.address, // otherAddr
                      wallet,
                      contact.message  // encrypted text
                  );
                  return { ...contact, message: decryptedMessage || "No Messages" };
                }
              } catch (error) {
                console.error(`Failed to decrypt message for ${contact.address}`, error);
                // Fall back to showing an error or "No Messages"
                return { ...contact, message: "(decryption error)" };
              }
            })
        );

        setConversations(decryptedContacts);
      } catch (error) {
        console.error("Error fetching contacts:", error);
      }
    };

    // Only fetch/decrypt if wallet is ready (optional check)
    if (wallet) {
      fetchContacts();
    }
  }, [wallet]);

  // Handler for selecting a conversation
  const handleSelectConversation = (address: string) => {
    setSelectedAddress(address);
    setRecipientAddress(address);
  };


  return (
    <div className="w-1/4 p-4 bg-medium-blue flex flex-col overflow-auto">
      <div className="mb-4">
        <input
          type="text"
          className="border border-gray-800 rounded px-3 py-1 w-full bg-dark-blue text-gray-300 text-base focus:ring-0"
          placeholder="Find a conversation"
          value={searchText}
          onChange={handleSearchInputChange}
          onKeyDown={handleSearchKeyDown}
        />
      </div>

      <h2 className="text-sm font-semibold text-gray-300 mb-2">DIRECT MESSAGES</h2>
      <div className="flex flex-col gap-3">
        {INITIAL_CONVERSATIONS.map((conv, index) => (
          <ConversationItem key={conv.address + index} conv={conv} />
        ))}
      </div>
    </div>
  );
};