import { SuiClient } from "@mysten/sui/client";
import { bcs } from "@mysten/sui/bcs";
import {
  getClient,
  ACTIVE_NETWORK,
} from "../../../../api/sui-utils";
import { Transaction } from "@mysten/sui/transactions";
import { WalletContextState } from "@suiet/wallet-kit";
import { CONFIG } from "../config";
import { normalizeSuiAddress } from "@mysten/sui/utils";


export function createRegisterPublicKey(senderAddress: string, publicKey: Uint8Array): Transaction {
  const tx = new Transaction();
  const serializedPublicKey = bcs.vector(bcs.u8()).serialize(publicKey).toBytes();

  tx.moveCall({
    target: `${CONFIG.MESSAGE_CONTRACT.packageId}::chat::public_keys::publish_key`,
    arguments: [
      tx.pure(bcs.Address.serialize(senderAddress)),
      tx.pure(serializedPublicKey),
    ],
    typeArguments: [],
  });

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

    const result = await wallet.signAndExecuteTransaction({ transaction: tx });
    console.log("Public key registered. Transaction digest:", result.digest);
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
    const client: SuiClient = getClient(ACTIVE_NETWORK);
    const response = await client.getOwnedObjects({
      owner: address,
      filter: { StructType: "chat::public_keys::UserPublicKey" },
    });

    if (response.data.length === 0) return null;

    // Get the first object with proper type checking
    const obj = response.data[0];
    if (obj.data?.content?.dataType === "moveObject") {
      const fields = obj.data.content.fields as { key: string | number[] };

      if (Array.isArray(fields.key)) {
        return Uint8Array.from(fields.key);
      }
      // Handle the case where the key is a string (if it was stored as Base64 or hex)
      return new Uint8Array(Buffer.from(fields.key, "base64"));
    }
    return null;
  } catch (error) {
    console.error("Error fetching user public key:", error);
    return null;
  }
}


