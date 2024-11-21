import { ConnectButton } from "@mysten/dapp-kit";
import { Box, Flex } from "@radix-ui/themes";
import { ConversationSidebar } from "../components/ConversationSidebar.tsx";
import { ChatPanel } from "../components/ChatPanel";
import '../styles/base.css';
import { useState } from "react";

export default function HomePage() {
    const [recipientAddress, setRecipientAddress] = useState<string | null>(null);
    return (
        <div className="flex flex-col h-screen bg-purple-100">
            {/* flex with Sidebar and Chat Panel */}
            <Flex className="h-full flex-row" style={{ background: "#F3E8FF" }}>
                <ConversationSidebar setRecipientAddress={setRecipientAddress} />
                <ChatPanel recipientAddress={recipientAddress} />
            </Flex>
            <Box
                style={{
                    position: "absolute",
                    top: "16px",
                    right: "16px",
                }}
            >
                <ConnectButton/>
            </Box>
        </div>
    );
}
