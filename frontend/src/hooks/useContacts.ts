import { useState, useEffect } from 'react';
import { Contact } from '@/types/types';
import { getAllContacts, addContact, editContact, deleteContact } from '@/api/services/contactDbService';
import { getSuiNInfo } from '@/api/services/nameServices';

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

  const addNewContact = async (suiAddress: string, suinsName?: string, name?: string) => {
    setIsSubmitting(true);
    try {
      await addContact(suiAddress, suinsName, name);
      await fetchContacts();
      sendWebSocketUpdate();
      return true;
    } catch (error) {
      console.error("Error adding contact:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateContact = async (suiAddress: string, suinsName?: string, name?: string) => {
    setIsSubmitting(true);
    try {
      await editContact(suiAddress, suinsName, name);
      await fetchContacts();
      sendWebSocketUpdate();
      return true;
    } catch (error) {
      console.error("Error updating contact:", error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeContact = async (contactAddress: string) => {
    try {
      await deleteContact(contactAddress);
      setContacts((prev) => prev.filter((c) => c.address !== contactAddress));
      sendWebSocketUpdate();
      return true;
    } catch (error) {
      console.error("Error deleting contact:", error);
      return false;
    }
  };

  return {
    contacts,
    isSubmitting,
    handleSuiNSLookup,
    addNewContact,
    updateContact,
    removeContact
  };
} 