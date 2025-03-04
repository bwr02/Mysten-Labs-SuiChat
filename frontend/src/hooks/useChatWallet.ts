import { useWallet } from '@suiet/wallet-kit';
import { checkBalance } from '../api/services/walletService';
import { ChatWalletState } from '@/types/types';
import { useEffect, useRef } from 'react';

export const useChatWallet = (): ChatWalletState => {
    const wallet = useWallet();
    const previousAddressRef = useRef<string | null>(null);

    useEffect(() => {
        const currentAddress = wallet.account?.address;
        const previousAddress = previousAddressRef.current;

        // If we have a new address and it's different from the previous one
        if (currentAddress && previousAddress && currentAddress !== previousAddress) {
            // Clear contacts for the previous wallet
            fetch(`http://localhost:3000/contacts/clear/${previousAddress}`, {
                method: 'DELETE',
            }).catch(error => {
                console.error('Error clearing previous wallet contacts:', error);
            });
        }

        // Update the ref with the current address
        previousAddressRef.current = currentAddress ?? null;
    }, [wallet.account?.address]);

    /**
     * Refresh the user's wallet balance.
     * @returns The formatted balance or null if an error occurs.
     */
    const refreshBalance = async () => {
        if (!wallet.account?.address) return null;

        try {
            const balanceInfo = await checkBalance(wallet.account.address);
            return balanceInfo.formattedBalance;
        } catch (error) {
            console.error(`Failed to refresh balance for address ${wallet.account?.address}:`, error);
            return null;
        }
    };

    /**
     * Sign a personal message using the connected wallet.
     * @param message - The message to sign.
     * @returns The signed message data.
     * @throws Error if the wallet is not connected or signing fails.
     */
    const signPersonalMessage = async (message: string) => {
        if (!wallet.connected) {
            throw new Error('Wallet not connected. Please connect your wallet to sign messages.');
        }

        try {
            const signedMessage = await wallet.signPersonalMessage({
                message: new TextEncoder().encode(message),
            });
            return signedMessage;
        } catch (error) {
            console.error(`Failed to sign message: ${message}`, error);
            throw error;
        }
    };

    return { 
        address: wallet.account?.address ?? null,
        connected: wallet.connected,
        loading: wallet.connecting,
        error: wallet.status === 'disconnected' ? 'Wallet disconnected' : null,
        refreshBalance,
        signPersonalMessage,
        suiWallet: wallet
    };
};
