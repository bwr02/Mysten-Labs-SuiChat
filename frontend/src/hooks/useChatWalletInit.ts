import { useEffect, useState } from 'react';
import { deriveKeysFromSignature, storeKeyPair, getOrCreateSignature } from '@/api/services/cryptoService';
import { registerPublicKeyOnChain, fetchUserPublicKey } from '@/api/services/publicKeyService';
import { ChatWalletState } from '@/types/types';

const STORAGE_KEYS = {
  PRIVATE_KEY: 'chat_private_key',
  PUBLIC_KEY: 'chat_public_key',
  WALLET_SIGNATURE: 'walletSignature'
};

export function useChatWalletInit(wallet: ChatWalletState | null) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeWallet = async () => {
      if (!wallet?.connected || !wallet.address) {
        return;
      }

      try {
        const storedPrivateKey = localStorage.getItem(STORAGE_KEYS.PRIVATE_KEY);
        const storedPublicKey = localStorage.getItem(STORAGE_KEYS.PUBLIC_KEY);
        const storedSignature = localStorage.getItem(STORAGE_KEYS.WALLET_SIGNATURE);

        // If we have all stored data, verify it's registered on chain
        if (storedPrivateKey && storedPublicKey) {
          // Check if public key is registered on chain
          const onChainPublicKey = await fetchUserPublicKey(wallet.address);
          
          if (onChainPublicKey) {
            setIsInitialized(true);
            return;
          }

          // TODO: check logic, why would keys exist but not be registered if we are checking for them on chain
          // If keys exist but aren't registered, only register them
          await registerPublicKeyOnChain(
            wallet.suiWallet, 
            wallet.address, 
            new Uint8Array(Buffer.from(storedPublicKey, 'base64'))
          );
          setIsInitialized(true);
          return;
        }

        // If we have a signature but no keys, derive them
        let signature = storedSignature;
        if (!signature) {
          setMessage("Please sign a message to generate your encryption keys...");
          // Only request signature if we don't have one stored
          signature = await getOrCreateSignature(wallet.suiWallet);
        }

        // Derive keys from signature
        const { privateKey, publicKey } = deriveKeysFromSignature(signature);
        storeKeyPair(publicKey, privateKey);
        
        setMessage("Registering your public key on chain (requires a transaction signature)...");
        // Register public key on chain using the same signature
        await registerPublicKeyOnChain(
          wallet.suiWallet, 
          wallet.address, 
          publicKey
        );

        setIsInitialized(true);
        // TODO: implement UI if user rejects the transaction
        setError(null);
      } catch (error) {
        console.error('Error initializing wallet:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize wallet');
      }
    };

    initializeWallet();
  }, [wallet?.connected, wallet?.address, wallet?.suiWallet]);

  return { isInitialized, message, error };
}