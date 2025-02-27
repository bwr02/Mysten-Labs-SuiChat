import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Layout from "./layout";
import HomePage from "@/pages/HomePage";
import Contacts from "@/pages/Contacts";
import StatusScreen from "@/components/StatusScreen";
import { useEffect, useState } from 'react';
import { useChatWallet } from '@/hooks/useChatWallet';
import { useChatWalletInit } from '@/hooks/useChatWalletInit';

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
        return <StatusScreen type="welcome" />;
    }

    if (!isInitialized) {
        return <StatusScreen type="initializing" error={error} />;
    }

    // If wallet is connected but the backend hasn't confirmed the active address, show a loading state.
    if (wallet.address && !activeAddressLoaded) {
        return <StatusScreen type="loading" />;
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
