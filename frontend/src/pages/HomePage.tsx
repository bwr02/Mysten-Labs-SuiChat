import { ConnectButton } from "@suiet/wallet-kit";
import "@suiet/wallet-kit/style.css";
import { Box, Flex } from "@radix-ui/themes";
import { ConversationSidebar } from "../components/ConversationSidebar.tsx";
import { ChatPanel } from "../components/ChatPanel";
import '../styles/base.css';
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function HomePage() {
    const location = useLocation();
    const [recipientAddress, setRecipientAddress] = useState<string | null>(null);
    const [recipientPub, setRecipientPub] = useState<Uint8Array | null>(null);
    const [isMinimized, setIsMinimized] = useState(false);

    useEffect(() => {
        // Check if the navigation state contains recipient info from the ContactsPage
        if (location.state) {
            const { recipientAddress, recipientPub } = location.state;
            if (recipientAddress) setRecipientAddress(recipientAddress);
            if (recipientPub) setRecipientPub(recipientPub);
        }
    }, [location]);

    const handleSetRecipient = (address: string, publicKey: Uint8Array) => {
        setRecipientAddress(address);
        setRecipientPub(publicKey);
    };

    useEffect(() => {
        const handleResize = () => {
            setIsMinimized(window.innerWidth < 875);
        };

        handleResize();
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    }, []);

    return (
        <div className="flex flex-col h-screen bg-dark-blue">
            <Flex className="h-full flex-row bg-dark-blue">
                <ConversationSidebar 
                    recipientAddress={recipientAddress}
                    recipientPub={recipientPub}
                    setRecipient={handleSetRecipient}
                />
                {recipientAddress && recipientPub ? (
                    <ChatPanel 
                        recipientAddress={recipientAddress} 
                        recipientPub={recipientPub}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-gray-300">
                        {/* TODO: message should not show if there are no contacts to select */}
                        <p>Select a contact to start chatting</p>
                    </div>
                )}
            </Flex>
            {!isMinimized && (
                <Box
                    style={{
                        position: "absolute",
                        top: "8px",
                        right: "16px",
                        transition: "opacity 0.3s ease-in-out",
                    }}
                >
                    <ConnectButton className="bg-blue-800" />
                </Box>
            )}
        </div>
    );
}
