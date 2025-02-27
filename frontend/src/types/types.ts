import { WalletContextState } from '@suiet/wallet-kit';

// Wallet Types
export interface ChatWalletState {
    address: string | null;
    connected: boolean;
    loading: boolean;
    error: string | null;
    refreshBalance: () => Promise<string | null>;
    signPersonalMessage: (message: string) => Promise<{ signature: string }>;
    suiWallet: WalletContextState;
}

// Local Storage Types
export const STORAGE_KEYS = {
  WALLET_SIGNATURE: "wallet_signature",
  PUBLIC_KEY: "public_key",
  PRIVATE_KEY: "private_key",
};

// Conversation Types
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

// Component Props
export interface ChatPanelProps {
    recipientAddress: string;
}

export interface ChatSidebarProps {
    recipientAddress: string | null;
    setRecipientAddress: (address: string) => void;
}

export interface MessageInputFieldProps {
    recipientAddress: string;
    onMessageSent: (message: string, timestamp: number, txDigest: string) => void;
}

export interface RecipientBarProps {
    recipientAddress: string;
}

// Contact Types
export interface Contact {
    address: string;
    suins: string;
    name: string;
    public_key: string;
}

// Message Service Types
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