import { useState } from "react";
import { useSuiWallet } from '../hooks/useSuiWallet';
import MessageInputBubble from './MessageInputBubble';

interface MessageInputFieldProps {
  onMessageSent: (message: string, timestamp: number, txDigest: string) => void;
}

export default function MessageInputField({ onMessageSent }: MessageInputFieldProps) {
  const { keypair, address, balance, loading, error, refreshBalance } = useSuiWallet();
  const [txStatus, setTxStatus] = useState<string>("");

  if (loading) return <div className="loading-state" style={{ color: 'black' }}>Connecting to wallet...</div>;
  if (error) return <div className="error-state" style={{ color: 'black' }}>Wallet Error: {error}</div>;

  return (
    <div className="message-input-container">
      <div className="wallet-status">
        <div className="wallet-info">
          <p>Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
          <p>Balance: {balance}</p>
        </div>
        {txStatus && (
          <div className="transaction-status">
            {txStatus}
          </div>
        )}
      </div>
      <MessageInputBubble 
        address={address}
        keypair={keypair}
        onStatusUpdate={setTxStatus}
        onMessageSent={refreshBalance}
        onMessageDisplayed={onMessageSent}
      />
    </div>
  );
}