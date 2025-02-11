import React, { useState, useEffect } from "react";
import { getSuiNInfo } from "../api/services/nameServices.ts";
import { addContact, editContact, getSuiNSByAddress, getNameByAddress } from "@/api/services/dbService.ts";
import { useNavigate } from "react-router-dom";


export default function ContactsPage() {
    const [name, setName] = useState("");
    const [suinsName, setSuinsName] = useState("");
    const [suiAddress, setSuiAddress] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");
    const [isEditing, setIsEditing] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (suiAddress.trim()) {
            (async () => {
                const fetchedSuins = await getSuiNSByAddress(suiAddress);
                const fetchedName = await getNameByAddress(suiAddress);
                setSuinsName(fetchedSuins || "");
                setName(fetchedName || "");
                if (fetchedSuins || fetchedName) {
                    setIsEditing(true);
                }
            })();
        }
    }, [suiAddress]);

    // Handler to populate Sui Address based on SuiNS name
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
            if (isEditing) {
                await editContact(suiAddress, suinsName || undefined, name || undefined);
                setMessage("Contact updated successfully!");
            } else {
                await addContact(suiAddress, suinsName || undefined, name || undefined);
                setMessage("Contact saved successfully!");
            }
            setName("");
            setSuinsName("");
            setSuiAddress("");
            navigate("/messages", { state: { recipientAddress: suiAddress } });
        } catch (error) {
            console.error("Error saving contact:", error);
            setMessage("Failed to save contact.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div className="h-screen bg-light-blue flex flex-col justify-center items-center">
            <form onSubmit={handleSubmit} className="bg-gray-800 shadow-md rounded-lg p-6 w-full max-w-md">
                <div className="flex items-center justify-between w-full mb-6">
                    <h1 className="text-2xl font-bold text-gray-200">{isEditing ? "Edit Contact" : "New Contact"}</h1>
                    <button
                        onClick={() => setIsEditing(!isEditing)}
                        className="bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg text-sm px-4 py-2 focus:ring-4 focus:ring-blue-500"
                    >
                        {isEditing ? "New" : "Edit"}
                    </button>
                </div>
                <div className="mb-5">
                    <label
                        htmlFor="name"
                        className="block mb-2 text-sm font-medium text-gray-300"
                    >
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
                    <label
                        htmlFor="suins-name"
                        className="block mb-2 text-sm font-medium text-gray-300"
                    >
                        SuiNS Name (optional)
                    </label>
                    <input
                        type="text"
                        id="suins-name"
                        value={suinsName}
                        onChange={(e) => setSuinsName(e.target.value)}
                        onBlur={handleSuiNSBlur} // Trigger when the user leaves the field
                        placeholder="Enter SuiNS Name"
                        className="w-full p-2 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-700 text-white"
                    />
                </div>

                <div className="mb-5">
                    <label
                        htmlFor="sui-address"
                        className="block mb-2 text-sm font-medium text-gray-300"
                    >
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
                    {isSubmitting ? "Saving..." : isEditing ? "Update Contact" : "Save Contact"}
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
        </div>
    );
}
