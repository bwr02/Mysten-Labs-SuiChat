import { useEffect, useState } from 'react';
import { deriveKeysFromSignature, storeKeyPair, getOrCreateSignature } from '@/api/services/cryptoService';
import { registerPublicKeyOnChain } from '@/api/services/publicKeyService';
import { ChatWalletState } from '@/types/types';

export function useChatWalletInit(wallet: ChatWalletState | null) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initializeWallet = async () => {
      if (!wallet?.connected || !wallet.address) {
        return;
      }

      try {
        const signature = await getOrCreateSignature(wallet.suiWallet);
        const { privateKey, publicKey } = deriveKeysFromSignature(signature);
        storeKeyPair(publicKey, privateKey);
        await registerPublicKeyOnChain(wallet.suiWallet, wallet.address, publicKey);
        
        setIsInitialized(true);
        setError(null);
      } catch (error) {
        console.error('Error initializing wallet:', error);
        setError(error instanceof Error ? error.message : 'Failed to initialize wallet');
      }
    };

    initializeWallet();
  }, [wallet]);

  return { isInitialized, error };
}