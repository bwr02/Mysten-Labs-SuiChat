import { useState, useCallback } from 'react';
import { getSuiNInfo } from '@/api/services/nameServices';
import { fetchUserPublicKey } from '@/api/services/publicKeyService';

export function useConversationSearch(setRecipient: (address: string, publicKey: Uint8Array) => void) {
  const [searchText, setSearchText] = useState("");

  const handleSearchInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    setSearchText(event.target.value);
  }, []);

  const handleSearchForUser = useCallback(async () => {
    if (!searchText.trim()) return;

    try {
      const targetAddress = await getSuiNInfo("@" + searchText);
      if (targetAddress) {
        const publicKey = await fetchUserPublicKey(targetAddress);
        if (publicKey) {
          setRecipient(targetAddress, publicKey);
          setSearchText("");
        } else {
            // TOOD: instead of logging, show popup to user
          console.log("No public key found for the given address.");
        }
      } else {
        console.log("No target address found for the given name.");
      }
    } catch (error) {
      console.error("Error fetching target address:", error);
    }
  }, [searchText, setRecipient]);

  const handleSearchKeyDown = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSearchForUser();
      event.stopPropagation();
    }
  }, [handleSearchForUser]);

  return {
    searchText,
    handleSearchInputChange,
    handleSearchKeyDown
  };
} 