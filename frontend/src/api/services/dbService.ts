import { prisma } from '../../../../api/db'
import { Message, SidebarConversationParams } from "@/types/types";

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

