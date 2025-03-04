import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Layout from "./layout";
import HomePage from "@/pages/HomePage";
import Contacts from "@/pages/Contacts";
import StatusScreen from "@/components/StatusScreen";
import { useChatWallet } from '@/hooks/useChatWallet';
import { useChatWalletInit } from '@/hooks/useChatWalletInit';
import { useSetActiveAddress } from "./hooks/useSetActiveAddress";


function App() {
    const wallet = useChatWallet();
    const { isInitialized, message, error } = useChatWalletInit(wallet);
    const { activeAddressLoaded } = useSetActiveAddress(wallet?.address);

    

    if (!wallet?.connected) {
        return <StatusScreen type="welcome" />;
    }

    if (!isInitialized) {
        return <StatusScreen type="initializing" message={message} error={error} />;
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
