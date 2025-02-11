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

    useEffect(() => {
        // Check if the navigation state contains a recipientAddress from the ContactsPage
        if (location.state && (location.state as any).recipientAddress) {
            setRecipientAddress((location.state as any).recipientAddress);
        }
    }, [location]);

    return (
        <div className="flex flex-col h-screen bg-dark-blue">
            {/* flex with Sidebar and Chat Panel */}
            <Flex className="h-full flex-row bg-dark-blue">
                <ConversationSidebar setRecipientAddress={setRecipientAddress} />
                <ChatPanel recipientAddress={recipientAddress} />
            </Flex>
            <Box
                style={{
                    position: "absolute",
                    top: "8px",
                    right: "16px",
                }}
            >
            <ConnectButton/>
            </Box>
        </div>
    );
}
