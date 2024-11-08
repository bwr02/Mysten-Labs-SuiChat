import React, { useState } from "react";
// this component renders input message with a send button
export default function MessageInput() {
  const [message, setMessage] = useState("");
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage(event.target.value);
  };
  const handleSendMessage = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // prevents page reload on button click
    console.log("Message:", message); // logs the message to console
    setMessage(""); // clears the input after logging
  };
  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    // send message with enter button on keyboard
    if (event.key === "Enter") {
      handleSendMessage(event);
    }
  };
    return (
      <div className="message-input">
        <input
          id="message"
          name="message"
          type="text"
          placeholder="Type your message here"
          className="message-input-box"
          value={message}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
        <button type="submit" className="message-send-button" onClick={handleSendMessage}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 24 24"
            width="24"
            height="24"
          >
            <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
          </svg>
        </button>
      </div>
    );
  }