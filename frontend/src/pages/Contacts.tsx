import { useState } from "react";
import { getSuiNInfo } from "../api/services/nameServices.ts";

export default function ContactsPage() {
    const [name, setName] = useState("");
    const [suinsName, setSuinsName] = useState("");
    const [suiAddress, setSuiAddress] = useState("");

    // Handler to populate Sui Address based on SuiNS name
    const handleSuiNSBlur = async () => {
        if (suinsName.trim()) {
            const address = await getSuiNInfo("@" + suinsName);
            setSuiAddress(address || "");
        }
    };

    return (
        <div className="h-screen bg-purple-200 flex flex-col justify-center items-center">
            <form className="bg-white shadow-md rounded-lg p-6 w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-black mb-6">New Contact</h1>
                <div className="mb-5">
                    <label
                        htmlFor="name"
                        className="block mb-2 text-sm font-medium text-gray-900"
                    >
                        Name (optional)
                    </label>
                    <input
                        type="text"
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter Name"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                    />
                </div>

                <div className="mb-5">
                    <label
                        htmlFor="suins-name"
                        className="block mb-2 text-sm font-medium text-gray-900"
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
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                    />
                </div>

                <div className="mb-5">
                    <label
                        htmlFor="sui-address"
                        className="block mb-2 text-sm font-medium text-gray-900"
                    >
                        Sui Address
                    </label>
                    <input
                        type="text"
                        id="sui-address"
                        value={suiAddress}
                        onChange={(e) => setSuiAddress(e.target.value)}
                        placeholder="Enter Sui Address"
                        className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-black"
                        required
                    />
                </div>

                <button
                    type="submit"
                    className="w-full text-white bg-purple-600 hover:bg-purple-700 focus:ring-4 focus:ring-purple-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                    Save Contact
                </button>
                <div className="mt-4 text-center">
                    <p className="text-sm text-gray-600">
                        Don't have a SuiNS name?{" "}
                        <a
                            href="https://suins.io/"
                            target="_blank"
                            className="text-purple-600 hover:text-purple-700 font-medium"
                        >
                            Register here
                        </a>
                    </p>
                </div>
            </form>
        </div>
    );
}
