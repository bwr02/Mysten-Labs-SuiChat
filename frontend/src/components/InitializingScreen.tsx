import { ConnectButton } from "@suiet/wallet-kit";

export default function InitializingScreen({ error }: { error: string | null }) {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-dark-blue">
            <img src="Sui_Symbol_Sea.svg" alt="avatar" className="w-12 h-15 rounded-full object-cover mb-4"/>
            <h2 className="text-white text-xl mb-4">Initializing wallet...</h2>
            {error && <p className="text-red-500 mb-4">{error}</p>}
            <ConnectButton />
        </div>
    );
}