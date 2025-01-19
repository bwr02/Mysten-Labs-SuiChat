import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Layout from "./layout";
import HomePage from "./pages/HomePage";
import Contacts from "./pages/Contacts";

function App() {
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
