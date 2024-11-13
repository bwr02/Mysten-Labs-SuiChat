import { useState, useEffect } from 'react';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { checkBalance } from '../api/walletService';
import { env } from '../config/env';

export const useSuiWallet = () => {
    const [keypair, setKeypair] = useState<Ed25519Keypair | null>(null);
    const [address, setAddress] = useState<string | null>(null);
    const [balance, setBalance] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const initializeWallet = async () => {
            try {
                if (!env.WALLET_MNEMONIC) {
                    throw new Error('Wallet mnemonic not configured in environment variables');
                }

                const kp = Ed25519Keypair.deriveKeypair(env.WALLET_MNEMONIC);
                const addr = kp.getPublicKey().toSuiAddress();
                
                setKeypair(kp);
                setAddress(addr);

                const balanceInfo = await checkBalance(addr);
                setBalance(balanceInfo.formattedBalance);
            } catch (err) {
                console.error('Wallet initialization error:', err);
                setError(err instanceof Error ? err.message : 'Failed to initialize wallet');
            } finally {
                setLoading(false);
            }
        };

        initializeWallet();
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

    return { keypair, address, balance, loading, error, refreshBalance };
};
