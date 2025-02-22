export interface SidebarConversationParams {
    address: string;
    name: string;
    message: string;
    time: string;
}

export interface Message {
    sender: "sent" | "received";
    text: string;
    timestamp: string;
    txDigest?: string;
}

export interface ChatPanelProps {
    recipientAddress: string;
}

export interface ChatSidebarProps {
    recipientAddress: string | null;
    setRecipientAddress: (address: string) => void;
}

export interface MessageInputFieldProps {
    recipientAddress: string | null;
    onMessageSent: (message: string, timestamp: number, txDigest: string) => void;
}

export interface RecipientBarProps {
    recipientName: string | null;
    suins: string | null;
    recipientAddress: string;
}

export interface Contact {
    address: string;
    suins: string;
    name: string;
    public_key: string;
}

export interface SendMessageParams {
    senderAddress: string;
    recipientAddress: string;
    content: string;
    signature: string;
}

export interface broadcastMessageParams {
    messageType: "sent" | "received";
    sender: string;
    recipient: string;
    text: string;
    timestamp: string;
    txDigest: string;
}