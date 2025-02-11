import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Layout from "./layout";
import HomePage from "./pages/HomePage";
import Contacts from "./pages/Contacts";
import { useSuiWallet } from "@/hooks/useSuiWallet";
import { useEffect, useState } from 'react';
import {ConnectButton} from "@suiet/wallet-kit";
import {Box} from "@radix-ui/themes";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function App() {
    const { address } = useSuiWallet(); // Pull address from Suiet to give to backend
    const [activeAddressLoaded, setActiveAddressLoaded] = useState(false);
    // When the wallet address becomes available or changes, send it to the backend.
    useEffect(() => {
        if (address) {
            fetch(`${BACKEND_URL}/api/setActiveAddress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ activeAddress: address }),
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
    }, [address]);

    // Do not load full SuiChat until active address is set and show welcome screen
    if (!activeAddressLoaded) {
        return (
            <div className="flex flex-col h-screen bg-dark-blue">
                <Box
                    style={{
                        position: "absolute",
                        top: "8px",
                        right: "16px",
                    }}
                >
                    <ConnectButton/>
                </Box>
            </div>
        );
    }

    return (
        <Router>
            <Routes>
                {/* Main Layout with nested routes */}
                <Route path="/" element={<Layout><Outlet /></Layout>}>
                    <Route index element={<HomePage />} /> {/* Default route */}
                    <Route path="messages" element={<HomePage />} /> {/* Home route */}
                    <Route path="contacts" element={<Contacts />} /> {/* Contacts route */}
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
