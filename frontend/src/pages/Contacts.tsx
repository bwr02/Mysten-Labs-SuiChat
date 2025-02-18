import React, { useState, useEffect } from "react";
import { getSuiNInfo } from "../api/services/nameServices.ts";
import { addContact, getSuiNSByAddress, getNameByAddress, getAllContacts } from "@/api/services/dbService.ts";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

interface Contact {
    address: string;
    suins: string;
    name: string;
    public_key: string;
}

export default function ContactsPage() {
    const [contacts, setContacts] = useState<Contact[]>([]);
    const [name, setName] = useState("");
    const [suinsName, setSuinsName] = useState("");
    const [suiAddress, setSuiAddress] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState(""); 
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hoveredContact, setHoveredContact] = useState<string | null>(null);

    const navigate = useNavigate();

    useEffect(() => {
        async function fetchContacts() {
            const data = await getAllContacts();
            setContacts(data);
        }
        fetchContacts();
    }, []);

    useEffect(() => {
        if (suiAddress.trim()) {
            (async () => {
                const fetchedSuins = await getSuiNSByAddress(suiAddress);
                const fetchedName = await getNameByAddress(suiAddress);
                // setSuinsName(fetchedSuins || "");
                setName(fetchedName || "");
            })();
        }
    }, [suiAddress]);

    const handleSuiNSBlur = async () => {
        if (suinsName.trim()) {
            const address = await getSuiNInfo("@" + suinsName);
            if (address) setSuiAddress(address);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setMessage("");

        if (!suiAddress.trim()) {
            setMessage("Sui Address is required.");
            setIsSubmitting(false);
            return;
        }

        try {
            await addContact(suiAddress, suinsName || undefined, name || undefined);
            setMessage("Contact saved successfully!");
            setName("");
            setSuinsName("");
            setSuiAddress("");
            setIsModalOpen(false);
            navigate("/messages", { state: { recipientAddress: suiAddress } });
            setContacts(await getAllContacts());
        } catch (error) {
            console.error("Error saving contact:", error);
            setMessage("Failed to save contact.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-light-blue flex flex-col items-start p-4 flex-1 w-full h-full">
            <h1 className="text-2xl py-3 px-4 font-bold mb-1 self-start border-b border-gray-700 shadow-md w-full">Contacts</h1>
            
            <button
                onClick={() => setIsModalOpen(true)}
                className="absolute top-4 right-4 p-3 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition"
            >
                <Plus size={24} />
            </button>

            <div className="w-full overflow-y-auto rounded-lg bg-light-blue p-4 shadow-md">
                {contacts.length > 0 ? (
                    <ul>
                        {contacts.map((contact, index) => (
                            <li
                                key={index}
                                className="p-3 py-8 border-b last:border-b-0 border-gray-600"
                                onMouseEnter={() => setHoveredContact(contact.address)}
                                onMouseLeave={() => setHoveredContact(null)}
                            >
                                <p className="font-semibold">{contact.name || "(No Name)"}</p>

                                {hoveredContact === contact.address && (
                                    <>
                                        <p className="text-gray-400">{contact.suins || "(No SuiNS)"}</p>
                                        <p className="text-gray-400">{contact.address}</p>
                                    </>
                                )}
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-gray-500 text-center">No contacts found.</p>
                )}
            </div>
            
            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-gray-800 shadow-md rounded-lg p-6 w-full max-w-md">
                        <h1 className="text-2xl font-bold text-center text-gray-200 mb-6">New Contact</h1>
                        <form onSubmit={handleSubmit}>
                            <div className="mb-5">
                                <label className="block mb-2 text-sm font-medium text-gray-300">Name (optional)</label>
                                <input
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
                                />
                            </div>
                            <div className="mb-5">
                                <label className="block mb-2 text-sm font-medium text-gray-300">SuiNS Name (optional)</label>
                                <input
                                    type="text"
                                    value={suinsName}
                                    onChange={(e) => setSuinsName(e.target.value)}
                                    onBlur={handleSuiNSBlur}
                                    className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
                                />
                            </div>
                            <div className="mb-5">
                                <label className="block mb-2 text-sm font-medium text-gray-300">Sui Address</label>
                                <input
                                    type="text"
                                    value={suiAddress}
                                    onChange={(e) => setSuiAddress(e.target.value)}
                                    onFocus={(e) => {
                                        if (!suiAddress && suinsName) {
                                            (async () => {
                                                const address = await getSuiNInfo("@" + suinsName);
                                                setSuiAddress(address || "");
                                            })();
                                        }
                                    }}
                                    className="w-full p-2 border border-gray-600 rounded-lg bg-gray-700 text-white"
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                className={`w-full text-white font-medium rounded-lg px-5 py-2.5 ${isSubmitting ? "bg-gray-600" : "bg-blue-700 hover:bg-blue-800"}`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Saving..." : "Save Contact"}
                            </button>
                            <div className="mt-4 text-center">
                                <p className="text-sm text-gray-400">
                                    Don't have a SuiNS name?{" "}
                                    <a
                                        href="https://suins.io/"
                                        target="_blank"
                                        className="text-blue-500 hover:text-blue-400 font-medium"
                                    >
                                        Register here
                                    </a>
                                </p>
                            </div>
                        </form>

                        <button
                            onClick={() => {
                                setName("");
                                setSuinsName("");
                                setSuiAddress("");
                                setIsModalOpen(false);
                            }}
                            className="mt-4 w-full text-center text-red-500 hover:underline"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
