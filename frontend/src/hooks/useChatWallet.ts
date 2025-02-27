import { useWallet } from '@suiet/wallet-kit';
import { checkBalance } from '../api/services/walletService';
import { ChatWalletState } from '@/types/types';

export const useChatWallet = (): ChatWalletState => {
    const wallet = useWallet();

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
