import { getOrCreateSignature } from './cryptoService';
import { decryptSingleMessage } from './decryptService';
import {WalletContextState} from '@suiet/wallet-kit'
import {Message} from "@/types/types.ts";

async function fetchMessages(endpoint: string): Promise<Message[]> {
    try {
        const response = await fetch(`http://localhost:3000/${endpoint}`);
        if (!response.ok) {
            console.error("Failed to fetch messages. Status:", response.status);
            throw new Error('Failed to fetch messages');
        }
        return await response.json();
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
}

export async function getAllMessages(): Promise<Message[]> {
    return fetchMessages('messages');
}


export async function getAllBySender(sender: string): Promise<Message[]> {
    return fetchMessages(`messages/by-sender/${sender}`);
}


export async function getAllByRecipient(recipient: string): Promise<Message[]> {
    return fetchMessages(`messages/by-recipient/${recipient}`);
}

 // Fetch and decrypt a single message
export async function getDecryptedMessage(
    recipientPub: Uint8Array,
    wallet: WalletContextState,
    encryptedText: string
): Promise<string> {
    if (!wallet?.connected) {
        console.log("Wallet is not connected.");
        return "";
    }
    try {
        return await decryptSingleMessage(encryptedText, recipientPub, wallet);
    } catch (error) {
        console.error("Error decrypting message:", error);
        return "Decryption Failed";
    }
}

// Fetch & decrypt chat history with another user
export async function getMessagesWithAddress(
    recipientAddress: string,
    recipientPub: Uint8Array,
    wallet: WalletContextState
): Promise<Message[]> {
    try {
        if (!wallet?.connected) {
            console.log("Wallet is not connected.");
            return [];
        }

        // Fetch encrypted messages from API
        const encryptedMessages = await fetchMessages(`messages/with-given-address/${recipientAddress}`);

        if (encryptedMessages.length === 0) {
            console.log("No messages found.");
            return [];
        }

        // Get wallet signature to derive shared secret
        const signature = await getOrCreateSignature(wallet);
        console.log("Using signature for decryption:", signature);

        // Decrypt messages asynchronously
        const decryptedMessages = await Promise.all(
            encryptedMessages.map(async (message) => ({
                ...message,
                text: await decryptSingleMessage(message.text, recipientPub, wallet),
            }))
        );

        return decryptedMessages;
    } catch (error) {
        console.error("Error fetching & decrypting messages:", error);
        return [];
    }
}