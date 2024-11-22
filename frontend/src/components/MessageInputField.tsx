import { useState } from "react";
import { useSuiWallet } from '../hooks/useSuiWallet';
import MessageInputBubble from './MessageInputBubble';
import { useAccountBalance } from '@suiet/wallet-kit';

interface MessageInputFieldProps {
  recipientAddress: string | null;
  onMessageSent: (message: string, timestamp: number, txDigest: string) => void;
}

export default function MessageInputField({ recipientAddress, onMessageSent }: MessageInputFieldProps) {
  const { address, loading, error, refreshBalance, wallet } = useSuiWallet();
  const [txStatus, setTxStatus] = useState<string>("");

  const { balance } = useAccountBalance();

  if (loading) return <div className="loading-state" style={{ color: 'black' }}>Connecting to wallet...</div>;
  if (error) return <div className="error-state" style={{ color: 'black' }}>Wallet Error: {error}</div>;

  const formattedBalance = balance ? `${Number(balance.toString()) / 10**9} SUI` : '0 SUI';

  return (
    <div className="w-full p-2 bg-purple-50 sticky bottom-0 flex flex-col justify-center">
      <div className="mb-4 text-center">
        <div className="text-black">
          <p>
            Connected: {address?.slice(0, 6)}...{address?.slice(-4)}
          </p>
          <p>Balance: {formattedBalance}</p>
        </div>
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