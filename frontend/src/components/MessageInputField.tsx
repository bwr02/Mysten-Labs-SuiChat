import { useState } from "react";
import { useSuiWallet } from '../hooks/useSuiWallet';
import MessageInputBubble from './MessageInputBubble';

export default function MessageInputField() {
  const { keypair, address, balance, loading, error, refreshBalance } = useSuiWallet();
  const [txStatus, setTxStatus] = useState<string>("");

  if (loading) return <div className="loading-state">Connecting to wallet...</div>;
  if (error) return <div className="error-state">Wallet Error: {error}</div>;

  return (
    <div className="message-field-container">
      <div className="wallet-status">
        <div className="wallet-info" style={{ color: 'black' }}>
          <p>Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</p>
          <p>Balance: {balance}</p>
        </div>
        {txStatus && (
          <div className="transaction-status" style={{ color: 'black' }}>
            {txStatus}
          </div>
        )}
      </div>
      <MessageInputBubble 
        address={address}
        keypair={keypair}
        onStatusUpdate={setTxStatus}
        onMessageSent={refreshBalance}
      />
    </div>
  );
}