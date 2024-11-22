import { useState, useEffect } from 'react';
import { checkBalance } from '../api/services/walletService';

export const useSuiWallet = () => {
    const [address, setAddress] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializeSuietWallet = async () => {
            try {
                if (!window.suiet) {
                    throw new Error('Suiet wallet not found');
                }
                const wallet = window.suiet;
                await wallet.connect();
                const accounts = await wallet.getAccounts();

                if (accounts.length === 0) {
                    throw new Error('No accounts found in Suiet wallet');
                }

                const currentAddress = accounts[0];
                setAddress(currentAddress);

                const balanceInfo = await checkBalance(currentAddress);
                setBalance(balanceInfo.formattedBalance);
            } catch (err) {
                console.error('Wallet initialization error: ', err);
                setError(err instanceof Error ? err.message : 'Failed to initialize wallet');
            } finally {
                setLoading(false);
            }
        };
        initializeSuietWallet();
    }, []);

    const refreshBalance = async () => {
        if (address) {
            try {
                const balanceInfo = await checkBalance(address);
                setBalance(balanceInfo.formattedBalance);
            } catch (error) {
                console.error('Failed to refresh balance:', error);
            }
        }
    };

    const signMessage = async (message: string) => {
        try {
            if (!window.suiet) throw new Error('Suiet wallet not found');
            
            const signedMessage = await window.suiet.signMessage({
                message: new TextEncoder().encode(message)
            });
            
            return signedMessage;
        } catch (error) {
            console.error('Failed to sign message:', error);
            throw error;
        }
    };

    return { 
        address, 
        balance, 
        loading, 
        error, 
        refreshBalance,
        signMessage 
    };
};
