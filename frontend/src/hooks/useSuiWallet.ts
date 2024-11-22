import { useWallet } from '@suiet/wallet-kit';
import { checkBalance } from '../api/services/walletService';

export const useSuiWallet = () => {
    const wallet = useWallet();

    const refreshBalance = async () => {
        if (wallet.account?.address) {
            try {
                const balanceInfo = await checkBalance(wallet.account.address);
                return balanceInfo.formattedBalance;
            } catch (error) {
                console.error('Failed to refresh balance:', error);
            }
        }
    };

    const signMessage = async (message: string) => {
        if (!wallet.connected) throw new Error('Wallet not connected');
        
        try {
            const signedMessage = await wallet.signMessage({
                message: new TextEncoder().encode(message)
            });
            return signedMessage;
        } catch (error) {
            console.error('Failed to sign message:', error);
            throw error;
        }
    };

    return { 
        address: wallet.account?.address ?? null,
        connected: wallet.connected,
        loading: wallet.connecting,
        error: wallet.status === 'disconnected' ? 'Wallet disconnected' : null,
        refreshBalance,
        signMessage,
        wallet
    };
};
