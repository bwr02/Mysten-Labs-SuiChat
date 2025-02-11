import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Layout from "./layout";
import HomePage from "./pages/HomePage";
import Contacts from "./pages/Contacts";
import { useSuiWallet } from "@/hooks/useSuiWallet";
import { useEffect } from 'react';

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

function App() {
    const { address } = useSuiWallet(); // Pull address from Suiet to give to backend
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
                .then(response => response.json())
                .then(data => console.log('Active address set:', data))
                .catch(err => console.error('Error setting active address:', err));
        }
    }, [address]);

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
