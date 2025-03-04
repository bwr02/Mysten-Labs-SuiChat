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

