import React, { memo } from "react";
import { SendButtonProps } from "@/types/types";

export const SendButton = memo(
  ({ sending, disabled, onClick }: SendButtonProps) => (
    <button
      type="submit"
      onClick={onClick}
      className={`absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 ${
        disabled ? "opacity-50 cursor-not-allowed" : "hover:text-gray-800"
      }`}
      disabled={disabled}
    >
      {sending ? (
        <div className="w-4 h-4 border-2 border-gray-500 border-t-transparent rounded-full animate-spin" />
      ) : (
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="currentColor"
          viewBox="0 0 24 24"
          width="24"
          height="24"
        >
          <path d="M2 21l21-9L2 3v7l15 2-15 2v7z" />
        </svg>
      )}
    </button>
  ),
);

SendButton.displayName = "SendButton";
