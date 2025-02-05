import React from "react";
import { Message } from "@/types/types";

interface MessageBubbleProps {
  message: Message;
}

export const MessageBubble = React.memo(({ message }: MessageBubbleProps) => (
  <div
    className={`p-3 rounded-2xl max-w-[50%] text-sm ${
      message.sender === "sent"
        ? "bg-blue-700 text-white self-end"
        : "bg-gray-200 text-black self-start"
    }`}
  >
    <span>
      {message.text}
      {message.txDigest && (
        <>
          <br />
          <a
            href={`https://suiscan.xyz/testnet/tx/${message.txDigest}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 underline"
          >
            View on Chain
          </a>
        </>
      )}
    </span>
  </div>
));

MessageBubble.displayName = "MessageBubble";
