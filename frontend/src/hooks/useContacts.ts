import { useState, useEffect } from 'react';
import { Contact } from '@/types/types';
import { getAllContacts, addContact, editContact, deleteContact } from '@/api/services/contactDbService';
import { getSuiNInfo } from '@/api/services/nameServices';
import { fetchUserPublicKey } from '@/api/services/publicKeyService';

const sendWebSocketUpdate = () => {
  const ws = new WebSocket('ws://localhost:8081');
  ws.onopen = () => {
    ws.send(JSON.stringify({ type: 'refresh-contacts' }));
    ws.close();
  };
};

export function useContacts() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    const data = await getAllContacts();
    setContacts(data);
  };

  const handleSuiNSLookup = async (suinsName: string): Promise<string | null> => {
    if (suinsName.trim()) {
      const address = await getSuiNInfo("@" + suinsName);
      return address || null;
    }
    return null;
  };

  const addNewContact = async (address: string, suinsName?: string, name?: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      // Check if the user has registered their public key
      const recipientPub = await fetchUserPublicKey(address);
      if (!recipientPub) {
        setError("This user hasn't registered their SuiChat public key yet. They need to register their key before you can add them as a contact.");
        return false;
      }

      await addContact(address, recipientPub, suinsName, name);
      await fetchContacts();
      sendWebSocketUpdate();
      return true;
    } catch (error) {
      console.error("Error adding contact:", error);
      setError("Failed to add contact. Please try again.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateContact = async (address: string, suinsName?: string, name?: string) => {
    setIsSubmitting(true);
    setError(null);
    try {
      await editContact(address, suinsName, name);
      await fetchContacts();
      sendWebSocketUpdate();
      return true;
    } catch (error) {
      console.error("Error updating contact:", error);
      setError("Failed to update contact. Please try again.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeContact = async (contactAddress: string) => {
    setError(null);
    try {
      await deleteContact(contactAddress);
      setContacts((prev) => prev.filter((c) => c.address !== contactAddress));
      sendWebSocketUpdate();
      return true;
    } catch (error) {
      console.error("Error deleting contact:", error);
      setError("Failed to delete contact. Please try again.");
      return false;
    }
  };

  return {
    contacts,
    isSubmitting,
    error,
    handleSuiNSLookup,
    addNewContact,
    updateContact,
    removeContact
  };
} 