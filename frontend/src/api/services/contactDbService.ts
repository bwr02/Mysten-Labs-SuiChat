import { SidebarConversationParams, Contact } from "@/types/types";

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

export async function addContact(addr: string, recipientPub: Uint8Array, suiname?: string, contactName?: string) {
    try {
        console.log('Original recipientPub:', recipientPub);
        // First ensure we have a proper Uint8Array
        const pubKeyArray = Array.from(recipientPub);
        console.log('Public key as array:', pubKeyArray);
        
        // Convert to hex string for storage
        const formattedRecipientPub = Buffer.from(pubKeyArray).toString('hex');
        console.log('Formatted public key (hex):', formattedRecipientPub);
        
        const response = await fetch('http://localhost:3000/add-contact', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ addr, recipientPub: formattedRecipientPub, suiname, contactName }),
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

export async function deleteContact(addr: string): Promise<void> {
    try {
        const response = await fetch(`http://localhost:3000/delete-contact/${addr}`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`Failed to delete contact: ${response.statusText}`);
        }

        console.log('Contact deleted successfully');
    } catch (error) {
        console.error('Error deleting contact:', error);
        throw error; 
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
    try {
        const response = await fetch(`http://localhost:3000/contacts/get-public-key/${addr}`);
        if (!response.ok) {
            console.error("Failed to fetch public key. Status:", response.status);
            return null;
        }

        const publicKey = await response.json();
        return publicKey;
    } catch (error) {
        console.error('Error fetching public key:', error);
        return null;
    }
}