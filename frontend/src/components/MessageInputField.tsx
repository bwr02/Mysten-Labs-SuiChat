import { useState } from "react";
import { useSuiWallet } from '../hooks/useSuiWallet';
import MessageInputBubble from './MessageInputBubble';

interface MessageInputFieldProps {
  recipientAddress: string | null;
  onMessageSent: (message: string, timestamp: number, txDigest: string) => void;
}

export default function MessageInputField({ recipientAddress, onMessageSent }: MessageInputFieldProps) {
  const { keypair, address, balance, loading, error, refreshBalance } = useSuiWallet();
  const [txStatus, setTxStatus] = useState<string>("");

  if (loading) return <div className="loading-state" style={{ color: 'black' }}>Connecting to wallet...</div>;
  if (error) return <div className="error-state" style={{ color: 'black' }}>Wallet Error: {error}</div>;

  return (
    <div className="w-full p-2 bg-purple-50 sticky bottom-0 flex flex-col justify-center">
      <div className="mb-4 text-center">
        <div className="text-black">
          <p>
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
          <p>Balance: {balance}</p>
        </div>
        {txStatus && (
          <div className="text-gray-500">
            {txStatus}
          </div>
        )}
      </div>
      <MessageInputBubble 
        address={address}
        keypair={keypair}
        recipientAddress={recipientAddress}
        onStatusUpdate={setTxStatus}
        onMessageSent={refreshBalance}
        onMessageDisplayed={onMessageSent}
      />
    </div>
  );
}