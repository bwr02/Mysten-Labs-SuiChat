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
        <div className="h-screen bg-light-blue flex flex-col justify-center items-center">
            <form className="bg-gray-800 shadow-md rounded-lg p-6 w-full max-w-md">
                <h1 className="text-2xl font-bold text-center text-gray-200 mb-6">New Contact</h1>
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
                    className="w-full text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:ring-blue-500 font-medium rounded-lg text-sm px-5 py-2.5 text-center"
                >
                    Save Contact
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
