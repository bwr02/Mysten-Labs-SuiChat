import  React, { useState } from "react";
import {SidebarConversationParams} from "@/types/SidebarType";
import { getSuiNInfo } from "@/api/services/nameServices";
import { isStringObject } from "util/types";
// component to display all the chat previews on the left handside

interface ChatSidebarProps {
  setRecipientAddress: (address: string) => void;
}
export const ConversationSidebar = ({ setRecipientAddress }: ChatSidebarProps) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const conversations : SidebarConversationParams[] = [
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
    try {
      const targetAddress = await getSuiNInfo("@" + searchText); // Await the result
      if (targetAddress) {
        setRecipientAddress(targetAddress); // Ensure targetAddress is a string
        console.log("Recipient address stored:", targetAddress);
      } else {
        console.log("No target address found for the given name.");
      }
      setSearchText("");
    } catch (error) {
      console.error("Error fetching target address:", error);
    }
    
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