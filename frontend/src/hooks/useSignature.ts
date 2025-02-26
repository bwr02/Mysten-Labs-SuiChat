import { WalletContextState } from '@suiet/wallet-kit';

export function useSignature() {
  const getOrCreateSignature = async (wallet: WalletContextState): Promise<string> => {
    let signature = localStorage.getItem('walletSignature');
    if (!signature) {
      const messageBytes = new TextEncoder().encode("Random message for key derivation");
      const signatureData = await wallet.signPersonalMessage({
        message: messageBytes
      });
      if (!signatureData?.signature) {
        throw new Error("Failed to obtain a valid signature.");
      }
      signature = signatureData.signature;
      localStorage.setItem('walletSignature', signature);
    }
    return signature;
  };

  return { getOrCreateSignature };
} 