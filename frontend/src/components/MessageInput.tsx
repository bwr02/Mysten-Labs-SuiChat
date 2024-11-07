// this component renders input message with a send button
export default function MessageInput() {
    return (
      <div className="message-input">
        <input
          id="message"
          name="message"
          type="text"
          placeholder="Type your message here"
          className="message-input-box"
        />
        <button type="submit" className="message-send-button">
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