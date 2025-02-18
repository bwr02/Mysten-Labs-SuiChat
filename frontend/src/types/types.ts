export interface SidebarConversationParams {
    address: string;
    name: string;
    message: string;
    time: string;
}

export interface Message {
    sender: "sent" | "received";
    text: string | null;
    timestamp?: number;
    txDigest?: string;
}

export interface ChatPanelProps {
    recipientAddress: string | null;
}

export interface ChatSidebarProps {
    setRecipientAddress: (address: string) => void;
}

export interface MessageInputFieldProps {
    recipientAddress: string | null;
    onMessageSent: (message: string, timestamp: number, txDigest: string) => void;
}

export interface RecipientBarProps {
    recipientName: string | null;
    suins: string | null;
    address: string | null;
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