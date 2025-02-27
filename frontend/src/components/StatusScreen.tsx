import { ConnectButton } from "@suiet/wallet-kit";
import { useState, useEffect } from "react";

interface StatusScreenProps {
    type: 'welcome' | 'initializing' | 'loading';
    error?: string | null;
}

export default function StatusScreen({ type, error }: StatusScreenProps) {
    const [timedOut, setTimedOut] = useState(false);

    useEffect(() => {
        if (type === 'loading') {
            const timeout = setTimeout(() => {
                setTimedOut(true);
            }, 5000);
            return () => clearTimeout(timeout);
        }
    }, [type]);

    const content = {
        welcome: {
            title: "Welcome to SuiChat",
            subtitle: "Connect your Sui Wallet to begin chatting!",
            showLogo: true,
            titleSize: "text-3xl"
        },
        initializing: {
            title: "Initializing wallet...",
            subtitle: error || "",
            showLogo: true,
            titleSize: "text-xl"
        },
        loading: {
            title: "Loading SuiChat...",
            subtitle: timedOut ? "Please refresh or check backend if loading takes too long." : "",
            showLogo: false,
            titleSize: "text-xl"
        }
    }[type];

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-tr from-dark-blue to-sky-700">
            {content.showLogo && (
                <img 
                    src="Sui_Symbol_Sea.svg" 
                    alt="Sui Logo" 
                    className="w-12 h-15 rounded-full object-cover mb-4"
                />
            )}
            <h1 className={`text-white ${content.titleSize} font-bold mb-4`}>
                {content.title}
            </h1>
            {content.subtitle && (
                <p className={`text-${error ? 'red-500' : 'gray-300'} text-base mb-8`}>
                    {content.subtitle}
                </p>
            )}
            <ConnectButton />
        </div>
    );
} 