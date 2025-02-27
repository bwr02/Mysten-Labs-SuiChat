import { ConnectButton } from "@suiet/wallet-kit";

export default function WelcomeScreen() {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gradient-to-tr from-dark-blue to-sky-700">
            <img src="Sui_Symbol_Sea.svg" alt="avatar" className="w-12 h-15 rounded-full object-cover mb-4"/>
            <h1 className="text-white text-3xl font-bold mb-4">Welcome to SuiChat</h1>
            <p className="text-gray-300 text-base mb-8">Connect your Sui Wallet to begin chatting!</p>
            {/* TODO: rename connect button UI to "Connect" */}
            <ConnectButton />
        </div>
    );
} 