import { WalletContextState } from "@suiet/wallet-kit";

export interface Message {
  sender: "sent" | "received";
  text: string | null;
  timestamp?: number;
  txDigest?: string;
}

export interface SendMessageParams {
  senderAddress: string;
  recipientAddress: string;
  recipientPub: Uint8Array;
  content: string;
}

export interface ChatPanelProps {
  recipientAddress: string | null;
}

export interface UseListenMessagesProps {
  recipientAddress: string | null;
  recipientPub: Uint8Array | null;
  wallet: WalletContextState | null;
}

export interface MessageInputFieldProps {
  recipientAddress: string | null;
  recipientPub: Uint8Array | null;
  onMessageSent: (message: string) => Promise<boolean>;
  disabled?: boolean;
  status?: string;
}
export interface SendButtonProps {
  sending: boolean;
  disabled: boolean;
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => void;
}

export interface ChatSidebarProps {
  setRecipientAddress: (address: string) => void;
}

export interface SidebarConversationParams {
  address: string;
  name: string;
  message: string;
  time: string;
}

export interface PublicKeyRegistrationState {
  myPublicKey: Uint8Array | null;
  isLoading: boolean;
  error: Error | null;
}
