import { useSuiWallet } from '../../hooks/useSuiWallet'
import { decryptMessage, deriveKeyFromSignature, generateSharedSecret } from './cryptoService';
interface Message {
    sender: "sent" | "received";
    text: string|null;
    timestamp?: number;
    txDigest?: string;
  }

export async function getAllMessages(): Promise<Message[]> {
    try {
        const response = await fetch(`http://localhost:3000/messages`);
        if (!response.ok) {
            console.error("Failed to fetch messages. Status:", response.status);
            throw new Error('Failed to fetch messages');
        }

        const messages: Message[] = await response.json();
        return messages;
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
}

export async function getAllBySender(sender: string): Promise<Message[]> {
    try {
        // console.log(`Calling API for sender: ${sender}`);
        const response = await fetch(`http://localhost:3000/messages/by-sender/${sender}`);
        if (!response.ok) {
            console.error("Failed to fetch messages. Status:", response.status);
            throw new Error('Failed to fetch messages');
        }

        const messages: Message[] = await response.json();
        // console.log("API response:", messages);
        return messages;
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
}

export async function getAllByRecipient(recipient: string): Promise<Message[]> {
    try {
        // console.log(`Calling API for recipient: ${recipient}`);
        const response = await fetch(`http://localhost:3000/messages/by-recipient/${recipient}`);
        if (!response.ok) {
            console.error("Failed to fetch messages. Status:", response.status);
            throw new Error('Failed to fetch messages');
        }

        const messages: Message[] = await response.json();
        // console.log("API response:", messages);
        return messages;
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
}

export async function getMessagesWithAddress(otherAddr: string|null): Promise<Message[]> {
    try {
        const response = await fetch(`http://localhost:3000/messages/with-given-address/${otherAddr}`);
        if (!response.ok) {
            console.error("Failed to fetch messages. Status:", response.status);
            throw new Error('Failed to fetch messages');
        }

        const { wallet } = useSuiWallet();
        if (!wallet) {
            console.log("Wallet is not connected.");
            return [];
        }

        let signature = localStorage.getItem('walletSignature');
        if (!signature) {
            console.log('No cached signature.')
            const messageBytes = new TextEncoder().encode("Random message for key derivation");
            const signatureData = await wallet?.signPersonalMessage({
            message: messageBytes
            });
            if (!signatureData?.signature) {
            throw new Error("Failed to obtain a valid signature.");
            }
            signature = signatureData.signature;
            localStorage.setItem('walletSignature', signature);
        }

        const tempPrivKey = deriveKeyFromSignature(signature);
        if (!otherAddr) {
            console.log("Other address is not specified.");
            return [];
        }
        const sharedSecret = generateSharedSecret(tempPrivKey, otherAddr);

        const messages: Message[] = await response.json();
        return messages.map((message) =>
            ({
                ...message,
                text: decryptMessage(message.text, sharedSecret), // Apply the transformation to the content field
              }));
    } catch (error) {
        console.error('Error fetching messages:', error);
        return [];
    }
}

export async function getAllContactedAddresses(): Promise<string[]> {
    try {
        const response = await fetch('http://localhost:3000/contacts');
        if (!response.ok) {
            console.error('Failed to fetch contacted addresses. Status:', response.status);
            throw new Error('Failed to fetch contacted addresses');
        }
        const data: string[] = await response.json();
        console.log('Fetched contacted addresses:', data);
        return data;
    } catch (error) {
        console.error('Error fetching contacted addresses:', error);
        return [];
    }
}

