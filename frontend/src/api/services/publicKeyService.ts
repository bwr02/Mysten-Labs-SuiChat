import { SuiClient } from '@mysten/sui/client';
import { bcs } from '@mysten/sui/bcs';
import { getClient, getActiveAddress, ACTIVE_NETWORK } from '../../../../api/sui-utils';
import { Transaction } from '@mysten/sui/transactions';


/**
 * Returns the published public key (as a Base64 string) for the given address.
 *
 * This function queries for objects of type "chat::public_keys::UserPublicKey" owned by the address.
 * It assumes that your Move module stores the key in a field called `key`.
 */
export async function getUserPublicKey(address: string): Promise<string | null> {
  try {
    const client: SuiClient = getClient(ACTIVE_NETWORK);

    const response = await client.getOwnedObjects({
      owner: address,
      filter: { StructType: "chat::public_keys::UserPublicKey" },
    });

    if (response.data.length === 0) {
      return null;
    }

    // Get the first object with proper type checking
    const obj = response.data[0];
    if (obj.data?.content?.dataType === 'moveObject') {
      const fields = obj.data.content.fields as { key: string | number[] };
      
      if (Array.isArray(fields.key)) {
        const uint8Key = Uint8Array.from(fields.key);
        return Buffer.from(uint8Key).toString("base64");
      }
      return fields.key;
    }

    return null;
  } catch (error) {
    console.error("Error fetching user public key:", error);
    return null;
  }
}


/**
 * Registers (publishes) the given public key on chain by calling the Move function.
 *
 * It calls the Move module function "chat::public_keys::publish_key".
 * Note that your Move function requires a mutable TxContext, so in the transaction
 * builder, this is automatically provided.
 *
 * @param wallet - The connected wallet used to sign and execute the transaction.
 * @param publicKey - The public key to publish (as a Base64 string).
 * @param packageId - The package ID where your Move contract is deployed.
 */
export async function registerPublicKey(
  wallet: any, // Replace with your wallet type
  publicKey: string,
  packageId: string
): Promise<string> {
  try {
    // Create a new transaction.
    const tx = new Transaction();

    // Prepare the arguments for the move call:
    //   - The owner's address (serialized).
    //   - The public key (serialized as a vector<u8>).
    //
    // Here we assume that your public key is a Base64 string. We convert it to a Buffer,
    // then use the BCS serializer for vector<u8>.
    const ownerAddress = getActiveAddress();
    const publicKeyBuffer = Buffer.from(publicKey, "base64");

    tx.moveCall({
      target: `${packageId}::chat::public_keys::publish_key`,
      arguments: [
        tx.pure(bcs.Address.serialize(ownerAddress)),
        tx.pure(publicKeyBuffer)
      ],
      // (If your move function requires type arguments, specify them here)
      typeArguments: [],
    });

    // Sign and execute the transaction using your wallet.
    const result = await wallet.signAndExecuteTransaction({ transaction: tx });
    console.log("Public key registered. Transaction digest:", result.digest);
    return result.digest;
  } catch (error) {
    console.error("Error registering public key:", error);
    throw error;
  }
}
