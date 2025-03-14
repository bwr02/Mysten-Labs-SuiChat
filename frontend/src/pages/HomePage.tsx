import { ConnectButton } from "@suiet/wallet-kit";
import "@suiet/wallet-kit/style.css";
import { Box, Flex } from "@radix-ui/themes";
import { ConversationSidebar } from "../components/ConversationSidebar.tsx";
import { ChatPanel } from "../components/ChatPanel";
import '../styles/base.css';
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { NonContactAlert } from "@/components/NonContactAlert";

export default function HomePage() {
    const location = useLocation();
    const [recipientAddress, setRecipientAddress] = useState<string | null>(null);
    const [recipientPub, setRecipientPub] = useState<Uint8Array | null>(null);
    const [isMinimized, setIsMinimized] = useState(false);
    const [nonContactSenders, setNonContactSenders] = useState<string[]>([]);

    // Load non-contact messages from localStorage on mount
    useEffect(() => {
        const storedMessages = JSON.parse(localStorage.getItem('nonContactMessages') || '[]');
        console.log('Loading stored non-contact messages:', storedMessages);
        if (storedMessages.length > 0) {
            setNonContactSenders(storedMessages);
            console.log('Set non-contact senders from storage:', storedMessages);
        }
    }, []);

    useEffect(() => {
        // Check if the navigation state contains recipient info from the ContactsPage
        if (location.state) {
            const { recipientAddress, recipientPub } = location.state;
            if (recipientAddress) setRecipientAddress(recipientAddress);
            if (recipientPub) setRecipientPub(recipientPub);
        }
    }, [location]);

    useEffect(() => {
        const handleNonContactMessage = (event: CustomEvent) => {
            const senderAddress = event.detail.senderAddress;
            console.log('Received nonContactMessage event for:', senderAddress);
            setNonContactSenders(prev => {
                if (!prev.includes(senderAddress)) {
                    console.log('Adding new non-contact sender:', senderAddress);
                    return [...prev, senderAddress];
                }
                return prev;
            });
        };

        window.addEventListener('nonContactMessage', handleNonContactMessage as EventListener);
        return () => {
            window.removeEventListener('nonContactMessage', handleNonContactMessage as EventListener);
        };
    }, []);

    const handleAlertDismiss = (dismissedAddress: string) => {
        // Remove from state
        setNonContactSenders(prev => prev.filter(addr => addr !== dismissedAddress));
        
        // Remove from localStorage
        const storedMessages = JSON.parse(localStorage.getItem('nonContactMessages') || '[]');
        const updatedMessages = storedMessages.filter((addr: string) => addr !== dismissedAddress);
        localStorage.setItem('nonContactMessages', JSON.stringify(updatedMessages));
    };

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
        <div className="flex flex-col h-screen bg-dark-blue relative">
            {/* Render alerts in a fixed container above everything */}
            <div className="fixed top-0 right-0 z-[9999] space-y-2 p-4 pointer-events-none">
                {nonContactSenders.map(sender => {
                    console.log('Rendering alert for sender:', sender);
                    return (
                        <div key={sender} className="pointer-events-auto">
                            <NonContactAlert 
                                senderAddress={sender}
                                onDismiss={() => handleAlertDismiss(sender)}
                            />
                        </div>
                    );
                })}
            </div>

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
