import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";
import { Contact } from "@/types/types";
import { useContacts } from "@/hooks/useContacts";
import { ContactForm } from "@/components/ContactForm";
import { ContactListItem } from "@/components/ContactListItem";
import { fetchUserPublicKey } from "@/api/services/publicKeyService";

export default function ContactsPage() {
    const navigate = useNavigate();
    const { contacts, isSubmitting, error, handleSuiNSLookup, addNewContact, updateContact, removeContact } = useContacts();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hoveredContact, setHoveredContact] = useState<string | null>(null);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);

    const handleSubmit = async (suiAddress: string, suinsName: string, name: string) => {
        const success = editingContact
            ? await updateContact(suiAddress, suinsName || undefined, name || undefined)
            : await addNewContact(suiAddress, suinsName || undefined, name || undefined);

        if (success) {
            setIsModalOpen(false);
            setEditingContact(null);
            if (!editingContact) {
                // Fetch the public key before navigating
                const publicKey = await fetchUserPublicKey(suiAddress);
                if (publicKey) {
                    navigate("/messages", { 
                        state: { 
                            recipientAddress: suiAddress,
                            recipientPub: publicKey
                        } 
                    });
                }
            }
        }
    };

    const handleMessageClick = async (address: string) => {
        const publicKey = await fetchUserPublicKey(address);
        if (publicKey) {
            navigate("/messages", { 
                state: { 
                    recipientAddress: address,
                    recipientPub: publicKey
                } 
            });
        }
    };

    return (
        <div className="bg-light-blue flex flex-col items-start p-4 flex-1 w-full h-full">
            <h1 className="text-2xl py-3 px-4 font-bold mb-1 self-start border-b border-gray-700 shadow-md w-full">Contacts</h1>
            
            <button
                onClick={() => {
                    setEditingContact(null);
                    setIsModalOpen(true);
                }}
                className="absolute top-4 right-4 p-3 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition"
            >
                <Plus size={24} />
            </button>

            <div className="w-full overflow-y-auto rounded-lg bg-light-blue p-4 shadow-md">
                {contacts.length > 0 ? (
                    <ul>
                        {contacts.map((contact) => (
                            <ContactListItem
                                key={contact.address}
                                contact={contact}
                                isHovered={hoveredContact === contact.address}
                                onHover={setHoveredContact}
                                onMessage={handleMessageClick}
                                onEdit={(contact) => {
                                    setEditingContact(contact);
                                    setIsModalOpen(true);
                                }}
                                onDelete={removeContact}
                            />
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-center">No contacts found.</p>
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-gray-800 shadow-md rounded-lg p-6 w-full max-w-md">
                        <h1 className="text-2xl font-bold text-center text-gray-200 mb-6">
                            {editingContact ? "Edit Contact" : "New Contact"}
                        </h1>
                        <ContactForm
                            editingContact={editingContact}
                            isSubmitting={isSubmitting}
                            error={error}
                            onSubmit={handleSubmit}
                            onCancel={() => {
                                setEditingContact(null);
                                setIsModalOpen(false);
                            }}
                            onSuiNSBlur={handleSuiNSLookup}
                        />
                    </div>
                </div>
            )}
        </div>
    );
}