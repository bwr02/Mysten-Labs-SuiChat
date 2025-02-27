import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Layout from "./layout";
import HomePage from "@/pages/HomePage";
import Contacts from "@/pages/Contacts";
import { ConnectButton } from "@suiet/wallet-kit";
import { useEffect, useState } from 'react';
import { useChatWallet } from '@/hooks/useChatWallet';
import { useChatWalletInit } from '@/hooks/useChatWalletInit';
import LoadingScreen from "@/components/LoadingScreen";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;


function App() {
    const wallet = useChatWallet();
    const { isInitialized, error } = useChatWalletInit(wallet);
    const [activeAddressLoaded, setActiveAddressLoaded] = useState(false);

    // When the wallet address becomes available or changes, send it to the backend.
    useEffect(() => {
        if (wallet?.address) {
            fetch(`${BACKEND_URL}/api/setActiveAddress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ activeAddress: wallet.address }),
            })
                .then((res) => {
                    if (!res.ok) {
                        throw new Error("Failed to set active address");
                    }
                    return res.json();
                })
                .then((data) => {
                    if (data.success) {
                        setActiveAddressLoaded(true);
                    }
                })
                .catch((err) => console.error("Error setting active address:", err));
        }
    }, [wallet?.address]);

    if (!wallet?.connected) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-tr from-dark-blue to-sky-700">

                <img src="Sui_Symbol_Sea.svg" alt="avatar" className="w-12 h-15 rounded-full object-cover mb-4"/>
                <h1 className="text-white text-3xl font-bold mb-4">Welcome to SuiChat</h1>
                <p className="text-gray-300 text-base mb-8">Connect your Sui Wallet to begin chatting!</p>
                {/* TODO: rename connect button UI to "Connect" */}
                <ConnectButton />
            </div>
        );
    }

    if (!isInitialized) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-dark-blue">
                <img src="Sui_Symbol_Sea.svg" alt="avatar" className="w-12 h-15 rounded-full object-cover mb-4"/>
                <h2 className="text-white text-xl mb-4">Initializing wallet...</h2>
                {error && <p className="text-red-500 mb-4">{error}</p>}
                <ConnectButton />
            </div>
        );
    }

    // If wallet is connected but the backend hasn't confirmed the active address, show a loading state.
    if (wallet.address && !activeAddressLoaded) {
        return <LoadingScreen />;
    }

    return (
        <Router>
            <Routes>
                <Route path="/" element={<Layout><Outlet /></Layout>}>
                    <Route index element={<HomePage />} />
                    <Route path="messages" element={<HomePage />} />
                    <Route path="contacts" element={<Contacts />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
