import { useState } from "react";
import { useSuiWallet } from '../hooks/useSuiWallet';
import MessageInputBubble from './MessageInputBubble';

interface MessageInputFieldProps {
  recipientAddress: string | null;
  onMessageSent: (message: string, timestamp: number, txDigest: string) => void;
}

export default function MessageInputField({ recipientAddress, onMessageSent }: MessageInputFieldProps) {
  const { address, loading, error, refreshBalance, wallet } = useSuiWallet();
  const [txStatus, setTxStatus] = useState<string>("");

  if (loading) return <div className="loading-state" style={{ color: 'black' }}>Connecting to wallet...</div>;
  if (error) return <div className="error-state" style={{ color: 'black' }}>Wallet Error: {error}</div>;

  return (
    <div className="w-full p-2 bg-purple-50 sticky bottom-0 flex flex-col justify-center">
      <div className="mb-4 text-center">
        {txStatus && (
          <div className="text-gray-500">
            {txStatus}
          </div>
        )}
      </div>
      <MessageInputBubble 
        address={address}
        recipientAddress={recipientAddress}
        wallet={wallet}
        onStatusUpdate={setTxStatus}
        onMessageSent={async () => { await refreshBalance(); }}
        onMessageDisplayed={onMessageSent}
      />
    </div>
  );
}