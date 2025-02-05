import { useEffect, useState } from "react";
import { useSuiWallet } from "@/hooks/useSuiWallet";
import {
  getUserPublicKey,
  registerPublicKey,
} from "../api/services/publicKeyService";
import { PublicKeyRegistrationState } from "../types/types";
import {
  getOrCreateSignature,
  deriveKeysFromSignature,
  getStoredKeyPair,
  storeKeyPair,
  clearStoredKeys,
} from "../api/services/cryptoService";

export const usePublicKeyRegistration = () => {
  const { wallet, address } = useSuiWallet();
  const [state, setState] = useState<PublicKeyRegistrationState>({
    myPublicKey: null,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    async function checkAndRegister() {
      if (!wallet || !address) return;

      setState((prev) => ({ ...prev, isLoading: true, error: null }));

      try {
        const storedKeys = getStoredKeyPair();
        // case #1: public and private keys are in localStorage
        if (storedKeys.publicKey && storedKeys.privateKey) {
          setState((prev) => ({
            ...prev,
            myPublicKey: storedKeys.publicKey,
            isLoading: false,
          }));
          return;
        }

        // case #2: keys are not in localStorage
        const signature = await getOrCreateSignature(wallet);
        const existingKey = await getUserPublicKey(address);

        // case #2.1: public key is on chain, must re-generate private key
        if (existingKey) {
          const { publicKey, privateKey } = deriveKeysFromSignature(signature);
          storeKeyPair(publicKey, privateKey);

          setState((prev) => ({
            ...prev,
            myPublicKey: publicKey,
            isLoading: false,
          }));
        } else {
          // case #2.1: public key is not on chain
          const { publicKey, privateKey } = deriveKeysFromSignature(signature);
          try {
            await registerPublicKey(wallet, publicKey);
            storeKeyPair(publicKey, privateKey);

            setState((prev) => ({
              ...prev,
              myPublicKey: publicKey,
              isLoading: false,
            }));
          } catch (error) {
            console.error("Failed to register public key", error);
            setState((prev) => ({
              ...prev,
              error: error as Error,
              isLoading: false,
            }));
          }
        }
      } catch (error) {
        console.error("Error in key registration process:", error);
        setState((prev) => ({
          ...prev,
          error: error as Error,
          isLoading: false,
        }));
      }
    }
    checkAndRegister();
  }, [wallet, address]);

  const clearKeys = () => {
    localStorage.removeItem("walletSignature");
    clearStoredKeys();
    setState((prev) => ({ ...prev, myPublicKey: null }));
  };

  return {
    myPublicKey: state.myPublicKey,
    isLoading: state.isLoading,
    error: state.error,
    clearKeys,
  };
};
