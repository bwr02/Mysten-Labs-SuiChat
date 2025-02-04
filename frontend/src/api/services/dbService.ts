import { decryptMessage, deriveKeyFromSignature, generateSharedSecret } from './cryptoService';
import { WalletContextState } from '@suiet/wallet-kit'
import { prisma } from '../../../../api/db'
import { SidebarConversationParams } from "@/types/SidebarType";

interface Message {
    sender: "sent" | "received";
    text: string|null;
    timestamp?: number;
    txDigest?: string;
  }
interface Contact {
    address: string;
    suins: string;
    name: string;
    public_key: string;
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

export async function getDecryptedMessage(publicKey: string, wallet: WalletContextState|null, encryptedMessage: string): Promise<string> {
    if (!wallet?.connected) {
        console.log("Wallet is not connected.");
        return "";
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

    const otherPrivKey = deriveKeyFromSignature(signature);
    const sharedSecret = generateSharedSecret(otherPrivKey, publicKey);
    return decryptMessage(encryptedMessage, sharedSecret);
}

 
export async function getMessagesWithAddress(otherAddr: string|null, wallet: WalletContextState | null): Promise<Message[]> {
    try {
        const response = await fetch(`http://localhost:3000/messages/with-given-address/${otherAddr}`);
        if (!response.ok) {
            console.error("Failed to fetch messages. Status:", response.status);
            throw new Error('Failed to fetch messages');
        }

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

export async function getAllContactedAddresses(): Promise<SidebarConversationParams[]> {
    try {
        const response = await fetch('http://localhost:3000/contacts/metadata');
        if (!response.ok) {
            console.error('Failed to fetch contacted addresses. Status:', response.status);
            throw new Error('Failed to fetch contacted addresses');
        }

        // Now we expect an array of SidebarConversationParams from the server
        // Note as of now the server is passing in encrypted messages and the name is address
        const data: SidebarConversationParams[] = await response.json();
        // console.log('Fetched contacted addresses:', data);
        return data;
    } catch (error) {
        console.error('Error fetching contacted addresses:', error);
        return [];
    }
}

export async function addContact(addr: string, suiname?: string, contactName?: string): Promise<void> {
    if(suiname && contactName){
        const contact = await prisma.contact.create({
            data: {
              address: addr,
              suins: suiname,
              name: contactName,
            },
          })
    }
    else if(suiname){
        const contact = await prisma.contact.create({
            data: {
              address: addr,
              suins: suiname,
            },
          })
    }
    else if(contactName){
        const contact = await prisma.contact.create({
            data: {
              address: addr,
              name: contactName,
            },
          })
    }
    else{
        const contact = await prisma.contact.create({
            data: {
            address: addr,
            },
        })
    }
}

export async function getSuiNSByAddress(addr: string): Promise<string|null>{
    const contact = await prisma.contact.findUnique({
        where: {
          address: addr,
        },
      })
    if(contact){
        return contact.suins;
    }
    else{ //null case
        return contact
    }
}

export async function getNameByAddress(addr: string): Promise<string|null>{
    const contact = await prisma.contact.findUnique({
        where: {
          address: addr,
        },
      })
    if(contact){
        return contact.name;
    }
    else{ //null case
        return contact
    }
}

export async function getPublicKeyByAddress(addr: string): Promise<string|null>{
    const contact = await prisma.contact.findUnique({
        where: {
          address: addr,
        },
      })
    if(contact){
        return contact.public_key;
    }
    else{ //null case
        return contact
    }
}

