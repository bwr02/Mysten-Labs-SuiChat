import { ConnectButton } from "@suiet/wallet-kit";
import { useState, useEffect } from "react";

const LoadingScreen = () => {
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
            <ConnectButton />
        </div>
    );
}

export default LoadingScreen;