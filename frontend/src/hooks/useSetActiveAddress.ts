import { useEffect, useState } from "react";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;

export function useSetActiveAddress(walletAddress: string | null) {
    const [activeAddressLoaded, setActiveAddressLoaded] = useState(false);
    
    // When the wallet address becomes available or changes, send it to the backend.
    useEffect(() => {
        if (walletAddress) {
            fetch(`${BACKEND_URL}/api/setActiveAddress`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ activeAddress: walletAddress }),
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
    }, [walletAddress]);

    return { activeAddressLoaded };
}