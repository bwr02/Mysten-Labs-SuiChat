import { ConnectButton } from "@suiet/wallet-kit";
import "@suiet/wallet-kit/style.css";
import { Box, Flex } from "@radix-ui/themes";
import { ConversationSidebar } from "../components/ConversationSidebar.tsx";
import { ChatPanel } from "../components/ChatPanel";
import '../styles/base.css';
import { useState } from "react";

export default function HomePage() {
    const [recipientAddress, setRecipientAddress] = useState<string | null>(null);
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
