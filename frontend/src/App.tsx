import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Layout from "./layout";
import HomePage from "./pages/HomePage";
import Contacts from "./pages/Contacts";
import { useSuiWallet } from "@/hooks/useSuiWallet";
import { useEffect, useState } from 'react';
import {ConnectButton} from "@suiet/wallet-kit";

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
    // If wallet is not connected, show a welcome screen in the center of the screen.
    if (!address) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-dark-blue">
                <h1 className="text-white text-3xl font-bold mb-4">Welcome to SuiChat</h1>
                <p className="text-white text-lg mb-8">Press Connect to start</p>
                <ConnectButton />
            </div>
        );
    }

    function LoadingScreen() {
        const [timedOut, setTimedOut] = useState(false);

        useEffect(() => {
            const timeout = setTimeout(() => {
                setTimedOut(true);
            }, 5000);
            return () => clearTimeout(timeout);
        }, []);

        return (
            <div className="flex flex-col items-center justify-center h-screen bg-dark-blue">
                <p className="text-white text-xl mb-4">Loading SuiChat...</p>
                {timedOut && (
                    <p className="text-white text-xl mb-4">
                        Please refresh or check backend if loading takes too long.
                    </p>
                )}
                <ConnectButton/>
            </div>
        );
    }

    // If wallet is connected but the backend hasn't confirmed the active address, show a loading state.
    if (address && !activeAddressLoaded) {
        return  <LoadingScreen />;
    }

    return (
        <Router>
            <Routes>
                {/* Main Layout with nested routes */}
                <Route path="/" element={<Layout><Outlet/></Layout>}>
                    <Route index element={<HomePage />} /> {/* Default route */}
                    <Route path="messages" element={<HomePage />} /> {/* Home route */}
                    <Route path="contacts" element={<Contacts />} /> {/* Contacts route */}
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
