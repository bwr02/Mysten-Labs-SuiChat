import React, { useState, useEffect } from "react";
import { getSuiNInfo } from "../api/services/nameServices.ts";
import { addContact, getSuiNSByAddress, getNameByAddress, getAllContacts } from "@/api/services/dbService.ts";
import { useNavigate } from "react-router-dom";
import { Plus } from "lucide-react";

export default function ContactsPage() {
    const [name, setName] = useState("");
    const [suinsName, setSuinsName] = useState("");
    const [suiAddress, setSuiAddress] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false); 

    const navigate = useNavigate();

    useEffect(() => {
        if (suiAddress.trim()) {
            (async () => {
                const fetchedSuins = await getSuiNSByAddress(suiAddress);
                const fetchedName = await getNameByAddress(suiAddress);
                setSuinsName(fetchedSuins || "");
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
        } catch (error) {
            console.error("Error saving contact:", error);
            setMessage("Failed to save contact.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="relative h-screen bg-light-blue flex justify-center items-center">
            <button
                onClick={() => setIsModalOpen(true)}
                className="absolute top-4 right-4 p-3 rounded-full bg-blue-500 text-white shadow-lg hover:bg-blue-600 transition"
            >
                <Plus size={24} />
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-gray-800 shadow-md rounded-lg p-6 w-full max-w-md">
                        <h1 className="text-2xl font-bold text-center text-gray-200 mb-6">New Contact</h1>
                        
                        <form onSubmit={handleSubmit}>
                            <div className="mb-5">
                                <label htmlFor="name" className="block mb-2 text-sm font-medium text-gray-300">
                                    Name (optional)
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter Name"
                                    className="w-full p-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                                />
                            </div>

                            <div className="mb-5">
                                <label htmlFor="suins-name" className="block mb-2 text-sm font-medium text-gray-300">
                                    SuiNS Name (optional)
                                </label>
                                <input
                                    type="text"
                                    id="suins-name"
                                    value={suinsName}
                                    onChange={(e) => setSuinsName(e.target.value)}
                                    onBlur={handleSuiNSBlur}
                                    placeholder="Enter SuiNS Name"
                                    className="w-full p-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                                />
                            </div>

                            <div className="mb-5">
                                <label htmlFor="sui-address" className="block mb-2 text-sm font-medium text-gray-300">
                                    Sui Address
                                </label>
                                <input
                                    type="text"
                                    id="sui-address"
                                    value={suiAddress}
                                    onChange={(e) => setSuiAddress(e.target.value)}
                                    placeholder="Enter Sui Address"
                                    className="w-full p-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                className={`w-full text-white font-medium rounded-lg text-sm px-5 py-2.5 text-center ${
                                    isSubmitting ? "bg-gray-600 cursor-not-allowed" : "bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-500"
                                }`}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? "Saving..." : "Save Contact"}
                            </button>
                        </form>

                        <button
                            onClick={() => setIsModalOpen(false)}
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
