import React, {useState} from "react";
import {FaLink} from "react-icons/fa";

export const MessageBubble = React.memo(({message, isLast}) => {
    const [showTimestamp, setShowTimestamp] = useState(false);

    const handleClick = () => {
        setShowTimestamp(true);

        // Hide the timestamp after 5 seconds for non-last messages
        if (!isLast) {
            const timer = setTimeout(() => {
                setShowTimestamp(false);
            }, 5000);

            // Clear timeout if clicked again or component unmounts
            return () => clearTimeout(timer);
        }
    };

    return (
        <div className="mb-2">
            <div className={`flex items-center ${message.sender === 'sent' ? 'justify-end' : 'justify-start'}`}>
                {/* Icon Link for Received Messages (on the left) */}
                {message.txDigest && message.sender === 'received' && (
                    <a
                        href={`https://suiscan.xyz/testnet/tx/${message.txDigest}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center mx-2"
                    >
                        <FaLink/>
                    </a>
                )}

                {/* Message Bubble */}
                <div
                    className={`p-3 rounded-2xl max-w-[50%] text-sm cursor-pointer ${
                        message.sender === 'sent'
                            ? 'bg-blue-700 text-white self-end'
                            : 'bg-gray-200 text-black self-start'
                    }`}
                    onClick={handleClick}
                >
                    <span>{message.text}</span>
                </div>

                {/* Icon Link for Sent Messages (on the right) */}
                {message.txDigest && message.sender === 'sent' && (
                    <a
                        href={`https://suiscan.xyz/testnet/tx/${message.txDigest}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 hover:underline flex items-center mx-2"
                    >
                        <FaLink/>
                    </a>
                )}
            </div>

            {/* Timestamp aligned with the message bubble */}
            {(isLast || showTimestamp) && (
                <div className="flex mt-1">
                    {message.sender === 'received' ? (
                        <div
                            className="text-xs text-gray-500 ml-[calc(2rem+8px)]"> {/* Aligned to start of the bubble */}
                            {message.timestamp}
                        </div>
                    ) : (
                        <div
                            className="text-xs text-gray-500 ml-auto mr-[calc(2rem+8px)]"> {/* Aligned to end of the bubble */}
                            {message.timestamp}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
});