import {decryptMessage, deriveKeyFromSignature, generateSharedSecret} from './cryptoService';
import {WalletContextState} from '@suiet/wallet-kit'
import {prisma} from '../../../../api/db'
import {Contact, Message, SidebarConversationParams} from "@/types/types.ts";

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

export async function getDecryptedMessage(otherAddr: string|null, wallet: WalletContextState|null, message: string): Promise<string> {
    if (!wallet) {
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

    const tempPrivKey = deriveKeyFromSignature(signature);
    if (!otherAddr) {
        console.log("Other address is not specified.");
        return "";
    }
    const sharedSecret = generateSharedSecret(tempPrivKey, otherAddr);
    const decryptedText = decryptMessage(message, sharedSecret);
    return decryptedText;
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

        const data: SidebarConversationParams[] = await response.json();

        return data;
    } catch (error) {
        console.error('Error fetching contacted addresses:', error);
        return [];
    }
}


export async function getAllContacts(): Promise<Contact[]> {
    try {
        const response = await fetch('http://localhost:3000/contacts/all-contacts');
        if (!response.ok) {
            console.error('Failed to fetch contacted addresses. Status:', response.status);
            throw new Error('Failed to fetch contacted addresses');
        }

        // Now we expect an array of Contact from the server
        // Note as of now the server is passing in encrypted messages and the name is address
        const data: Contact[] = await response.json();
        // console.log('Fetched contacted addresses:', data);
        return data;
    } catch (error) {
        console.error('Error fetching contacted addresses:', error);
        return [];
    }
}

export async function addContact(addr: string, suiname?: string, contactName?: string) {
    try {
        const response = await fetch('http://localhost:3000/add-contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ addr, suiname, contactName }),
        });

        if (!response.ok) {
            throw new Error(`Failed to add contact: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Contact added:', data);
        return data;
    } catch (error) {
        console.error(error);
    }
}

export async function editContact(addr: string, suiname?: string, contactName?: string) {
    try {
        const response = await fetch(`http://localhost:3000/edit-contact/${addr}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ suiname, contactName }),
        });

        if (!response.ok) {
            throw new Error(`Failed to edit contact: ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Contact updated:', data);
        return data;
    } catch (error) {
        console.error(error);
    }
}



export async function getSuiNSByAddress(addr: string): Promise<string|null>{
    try {
        const response = await fetch(`http://localhost:3000/contacts/get-suins/${addr}`);
        if (!response.ok) {
            console.error("Failed to fetch suins. Status:", response.status);
            throw new Error('Failed to fetch suins');
        }

        const suins = await response.json();
        return suins;
    } catch (error) {
        console.error('Error fetching suins:', error);
        return "";
    }
}

export async function getNameByAddress(addr: string): Promise<string|null>{
    try {
        const response = await fetch(`http://localhost:3000/contacts/get-name/${addr}`);
        if (!response.ok) {
            console.error("Failed to fetch name. Status:", response.status);
            throw new Error('Failed to fetch name');
        }

        const name = await response.json();
        return name;
    } catch (error) {
        console.error('Error fetching name:', error);
        return "";
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

