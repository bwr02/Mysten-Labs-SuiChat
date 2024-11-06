export default function MessageInput() {
    return (
      // <div className="message-input">
      //   <input
      //     id="message"
      //     name="message"
      //     type="text"
      //     placeholder="Type your message here"
      //     className="message-input-box"
      //   />
      //   <button type="submit" className="message-send-button">
      //     <svg
      //       // xmlns="http://www.w3.org/2000/svg"
      //       fill="currentColor"
      //       viewBox="0 0 24 24"
      //       width="24"
      //       height="24"
      //     >
      //       <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
      //     </svg>
      //   </button>
      // </div>
      <form>
      <label
        htmlFor="sendmessage"
        className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white"
      >
        Send
      </label>
      <div className="relative">
        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
          <svg
            className="w-4 h-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 20"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M19 19l-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
            />
          </svg>
        </div>
        <input
          type="search"
          id="search"
          className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
          placeholder="Enter to send"
          required
        />
        <button
          type="submit"
          className="text-white absolute end-2.5 bottom-2.5 bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-4 py-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
        >
          Send
        </button>
      </div>
    </form>
    );
  }