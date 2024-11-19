import { BrowserRouter as Router, Routes, Route, Outlet } from "react-router-dom";
import Layout from "./layout";
import HomePage from "./pages/HomePage";

function App() {
    return (
        <Router>
            <Routes>
                {/* Main Layout with nested routes */}
                <Route path="/" element={<Layout><Outlet /></Layout>}>
                    <Route index element={<HomePage />} /> {/* Default route */}
                </Route>
            </Routes>
        </Router>
    );
}

export default App;
