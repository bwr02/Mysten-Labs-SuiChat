import { useEffect, useState } from "react";
import {SidebarConversationParams} from "@/types/SidebarType";
import {getAllContactedAddresses, getDecryptedMessage} from "../api/services/dbService";
import { useSuiWallet } from "@/hooks/useSuiWallet";
import { getSuiNInfo } from "@/api/services/nameServices";

// component to display all the chat previews on the left hand-side

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
    <div className="w-1/4 p-4 bg-purple-100 flex flex-col overflow-auto">
      <h1 className="text-xl font-bold mb-4 flex items-center gap-2 text-black">SuiChat</h1>
      <h2 className="text-base font-semibold text-gray-500 mb-2">Conversations</h2>
      <div className="flex flex-col gap-3">
        {conversations.map((conv, index) => (
          <div
              key={index}
              onClick={() => handleSelectConversation(conv.address)}
              className={`flex items-center gap-3 cursor-pointer p-1 rounded
              ${
                  selectedAddress === conv.address
                      ? "bg-blue-200" // Highlight selected
                      : "hover:bg-gray-200" // Hover style
              }`}
          >
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