import { suiClient } from "../suiClient";
import { Transaction } from "@mysten/sui/transactions";
import { WalletContextState } from "@suiet/wallet-kit";
import { CONFIG } from "../config";
import { normalizeSuiAddress } from "@mysten/sui/utils";
import { bcs } from "@mysten/sui/bcs";

function createRegisterPublicKey(senderAddress: string, publicKey: Uint8Array): Transaction {
  const tx = new Transaction();

  tx.moveCall({
    target: `${CONFIG.MESSAGE_CONTRACT.packageId}::public_keys::publish_key`,
    arguments: [
      tx.pure(bcs.Address.serialize(senderAddress)),
      tx.pure(bcs.vector(bcs.u8()).serialize(Array.from(publicKey)))
    ],
  });

  tx.setGasBudget(100_000_000);
  return tx;
}

export async function registerPublicKeyOnChain(
  wallet: WalletContextState,
  address: string,
  publicKey: Uint8Array,
): Promise<string> {
  try {
    const normalizedAddress = normalizeSuiAddress(address);
    const tx = createRegisterPublicKey(normalizedAddress, publicKey);
    const result = await wallet.signAndExecuteTransaction({
      transaction: tx
    });
    
    console.log("Public key registered. Full result:", result);
    return result.digest;
  } catch (error) {
    console.error("Error registering public key:", error);
    throw error;
  }
}


/**
 * Returns the published public key (as a Uint8Array) for the given address.
 *
 * This function queries for objects of type "chat::public_keys::UserPublicKey" owned by the address.
 * It assumes that your Move module stores the key in a field called `key`.
 */
export async function fetchUserPublicKey(
  address: string,
): Promise<Uint8Array | null> {
  try {
    const response = await suiClient.getOwnedObjects({
      owner: address,
      filter: { StructType: `${CONFIG.MESSAGE_CONTRACT.packageId}::public_keys::UserPublicKey` },
      options: { showContent: true }
    });

    if (!response.data.length) return null;

    // Sort by timestamp in descending order and get the most recent key
    const sortedObjects = response.data
      .filter(obj => obj.data?.content?.dataType === "moveObject")
      .sort((a, b) => {
        const aTimestamp = ((a.data?.content as unknown as { fields: { timestamp: string } })?.fields?.timestamp) || '0';
        const bTimestamp = ((b.data?.content as unknown as { fields: { timestamp: string } })?.fields?.timestamp) || '0';
        return Number(bTimestamp) - Number(aTimestamp);
      });

    const mostRecent = sortedObjects[0];
    if (mostRecent?.data?.content?.dataType === "moveObject") {
      const fields = (mostRecent.data.content as unknown as { fields: { public_key: string | number[] } }).fields;

      if (Array.isArray(fields.public_key)) {
        return Uint8Array.from(fields.public_key);
      }
      return new Uint8Array(Buffer.from(fields.public_key, "base64"));
    }
    return null;
  } catch (error) {
    console.error("Error fetching user public key:", error);
    return null;
  }
}

