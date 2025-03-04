import { useEffect, useState } from 'react';
import { deriveKeysFromSignature, storeKeyPair, getOrCreateSignature } from '@/api/services/cryptoService';
import { registerPublicKeyOnChain, fetchUserPublicKey } from '@/api/services/publicKeyService';
import { ChatWalletState, STORAGE_KEYS } from '@/types/types';


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
        // First check if public key is already registered on chain
        const onChainPublicKey = await fetchUserPublicKey(wallet.address);
       
        const storedSignature = localStorage.getItem(STORAGE_KEYS.WALLET_SIGNATURE);
        const storedPrivateKey = localStorage.getItem(STORAGE_KEYS.PRIVATE_KEY);
        const storedPublicKey = localStorage.getItem(STORAGE_KEYS.PUBLIC_KEY);

        // Case 1: Public key is on chain
        if (onChainPublicKey) {
          // TODO: implement animated UI with checkmarks or list item screen so this message displays and is not overridded by 'Please sign a message...'
          setMessage("Found public key associated with your wallet on chain...");
          if (storedPrivateKey && storedPublicKey) {
            setIsInitialized(true);
            return;
          }

          // Case 1.1: Stored signature but no keys, derive and store keys
          if (storedSignature) {
            const { privateKey, publicKey } = deriveKeysFromSignature(storedSignature);
            storeKeyPair(publicKey, privateKey);
            setIsInitialized(true);
            return;
          }

          // Case 1.2: No stored signature or keys, derive and store all
          setMessage("Please sign a message to generate your encryption keys...");
          const signature = await getOrCreateSignature(wallet.suiWallet);
          const { privateKey, publicKey } = deriveKeysFromSignature(signature);
          storeKeyPair(publicKey, privateKey);
          setIsInitialized(true);
          return;
        }

        // Case 2: No public key on chain - need to register
        let signature = storedSignature;
        if (!signature) {
          setMessage("Please sign a message to generate your encryption keys...");
          signature = await getOrCreateSignature(wallet.suiWallet);
        }

        // Derive keys if we don't have them stored
        if (!storedPrivateKey || !storedPublicKey) {
          const { privateKey, publicKey } = deriveKeysFromSignature(signature);
          storeKeyPair(publicKey, privateKey);
        }

        // Register the public key on chain
        setMessage("Registering your public key on chain (requires a transaction signature)...");
        await registerPublicKeyOnChain(
          wallet.suiWallet,
          wallet.address,
          new Uint8Array(Buffer.from(localStorage.getItem(STORAGE_KEYS.PUBLIC_KEY)!, 'base64'))
        );
        // TODO: implement UI if user rejects the transaction

        setIsInitialized(true);
        setMessage(null);
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