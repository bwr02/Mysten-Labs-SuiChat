import "../styles/ChatSidebar.css";
import React, { useState } from "react";
// component to display all the chat previews on the left handside
interface ChatSidebarProps {
  className?: string;
}
export const ChatSidebar: React.FC<ChatSidebarProps> = ({ className }) => {
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchText, setSearchText] = useState("");
  const conversations = [
    { name: "Ben", message: "Just finished our prd doc!", time: "10 min" },
    { name: "Ashton", message: "LGTM", time: "14 min" },
    { name: "Sophia", message: "Can’t wait for our standup!", time: "21 min" },
    { name: "Chloe", message: "Has anyone seen PR?", time: "23 min" },
    { name: "Bonnie", message: "Where are we meeting...", time: "24 min" },
    { name: "Jane", message: "Have you done 171 HW?", time: "36 min" },
    { name: "John", message: "What time is midterm?", time: "45 min" },
  ];

  // Toggle address book search input visibility
  const toggleSearch = () => {
    setIsSearchOpen(!isSearchOpen);
  };

  return (
    <div className="chat-sidebar">
      <h1 className="chat-title">
        SuiChat
        <svg
          className="book-icon"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          width="24"
          height="24"
          fill="currentColor"
          onClick={toggleSearch}
        >
          <path
            fillRule="evenodd"
            d="M7 2a2 2 0 0 0-2 2v1a1 1 0 0 0 0 2v1a1 1 0 0 0 0 2v1a1 1 0 1 0 0 2v1a1 1 0 1 0 0 2v1a1 1 0 1 0 0 2v1a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H7Zm3 8a3 3 0 1 1 6 0 3 3 0 0 1-6 0Zm-1 7a3 3 0 0 1 3-3h2a3 3 0 0 1 3 3 1 1 0 0 1-1 1h-6a1 1 0 0 1-1-1Z"
            clipRule="evenodd"
          />
        </svg>
        {/* Address book search input field */}
        {isSearchOpen && (
          <div className="search-container">
            <input
              type="text"
              className="book-input"
              placeholder=" "
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
            />
          </div>
        )}
      </h1>
      
      <h2 className="conversations-heading">Conversations</h2>
      <div className="conversations-list">
        {conversations.map((conv, index) => (
          <div key={index} className="conversation">
            <div className="conversation-avatar" />
            <div className="conversation-details">
              <span className="conversation-name">{conv.name}</span>
              <span className="conversation-message">{conv.message}</span>
            </div>
            <span className="conversation-time">{conv.time}</span>
          </div>
        ))}
      </div>
    </div>
  );
}