import  React, { useEffect, useState } from "react";
import {SidebarConversationParams} from "@/types/SidebarType";
import {getAllContactedAddresses, getDecryptedMessage} from "../api/services/dbService";
import { useSuiWallet } from "@/hooks/useSuiWallet";


// component to display all the chat previews on the left handside

interface ChatSidebarProps {
  setRecipientAddress: (address: string) => void;
}
export const ConversationSidebar = ({ setRecipientAddress }: ChatSidebarProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
// This is now controlled by fetched data
  const [conversations, setConversations] = useState<SidebarConversationParams[]>([]);
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

  // Toggle address book search input visibility
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  // // Track open conversation
  // const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  // const handleSelectConversation = (name: string) => {
  //   setSelectedConversation(name);
  // };
  const handleSearchInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  };
  const handleSearchForUser = async () => {
    setRecipientAddress(searchText);
    console.log("Recipient address stored:", searchText);
    setSearchText("");
  }
  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSearchForUser();
      event.stopPropagation();
    }
  };

  return (
    <div className="w-1/4 p-4 bg-purple-100 flex flex-col overflow-auto">
      <h1 className="text-xl font-bold mb-4 flex items-center gap-2 text-black">
        SuiChat
        {/* Address Book Search Icon */}
        <button className="bg-none border-none cursor-pointer p-1 w-8 h-8" onClick={toggleSearch}>
          <svg
              xmlns="http://www.w3.org/2000/svg"
              className="w-6 h-6 text-gray-500 hover:text-gray-800"
              fill="currentColor"
              viewBox="0 0 24 24"
          >
            <path
                fillRule="evenodd"
                d="M7 2a2 2 0 0 0-2 2v1a1 1 0 0 0 0 2v1a1 1 0 0 0 0 2v1a1 1 0 1 0 0 2v1a1 1 0 1 0 0 2v1a1 1 0 1 0 0 2v1a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H7Zm3 8a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm-1 7a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3 1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1Z"
                clipRule="evenodd"
            />
          </svg>
        </button>
      </h1>

      {/* Address Book Search Input */}
      {isSearchOpen && (
          <div className="mb-4">
            <input
                type="text"
                className="border border-gray-300 rounded-full px-3 py-2 w-full bg-gray-100 text-gray-800 text-base focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Search for address"
                value={searchText}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearchKeyDown}
            />
          </div>
      )}
      
      <h2 className="text-base font-semibold text-gray-500 mb-2">Conversations</h2>
      <div className="flex flex-col gap-3">
        {conversations.map((conv, index) => (
          <div key={index} className="flex items-center gap-3 cursor-pointer hover:bg-gray-200 p-1 rounded">
            {/* Conversation Avatar, Currently not populated */}
            <div className="w-10 h-10 bg-gray-300 rounded-full" />
            <div className="flex-grow">
              <span className="font-semibold text-black block">{conv.name}</span>
              <span className="text-gray-500">{conv.message}</span>
            </div>
            <span className="text-gray-500 text-sm">{conv.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}