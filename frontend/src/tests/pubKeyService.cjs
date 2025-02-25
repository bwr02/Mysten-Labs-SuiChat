const { Transaction } = require("@mysten/sui/transactions");
const { bcs } = require("@mysten/sui/bcs");
const { normalizeSuiAddress } = require("@mysten/sui/utils");
const { getClient, ACTIVE_NETWORK } = require("../../../../api/sui-utils");
const { CONFIG } = require("../config");

/**
 * Creates a transaction to register a public key on the blockchain.
 * @param {string} senderAddress - The address of the sender.
 * @param {Uint8Array} publicKey - The public key to be registered.
 * @returns {Transaction} - The constructed transaction.
 */
function createRegisterPublicKey(senderAddress, publicKey) {
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

/**
 * Registers a public key on the Sui blockchain.
 * @param {object} wallet - The wallet instance from @suiet/wallet-kit.
 * @param {string} address - The address of the sender.
 * @param {Uint8Array} publicKey - The public key to be registered.
 * @returns {Promise<string>} - The transaction digest.
 */
async function registerPublicKeyOnChain(wallet, address, publicKey) {
  try {
    const normalizedAddress = normalizeSuiAddress(address);
    const tx = createRegisterPublicKey(normalizedAddress, publicKey);

    const result = await wallet.signAndExecuteTransaction({ transaction: tx });
    console.log("✅ Public key registered successfully! Transaction Digest:", result.digest);
    return result.digest;
  } catch (error) {
    console.error("🚨 Error registering public key:", error);
    throw error;
  }
}

/**
 * Fetches the published public key (as a Uint8Array) for a given address.
 * @param {string} address - The Sui address to fetch the public key for.
 * @returns {Promise<Uint8Array | null>} - The public key if found, otherwise null.
 */
async function fetchUserPublicKey(address) {
  try {
    const client = getClient(ACTIVE_NETWORK);
    const response = await client.getOwnedObjects({
      owner: address,
      filter: { StructType: "chat::public_keys::UserPublicKey" },
    });

    if (response.data.length === 0) return null;

    // Get the first object with proper type checking
    const obj = response.data[0];
    if (obj.data?.content?.dataType === "moveObject") {
      const fields = obj.data.content.fields;

      if (Array.isArray(fields.key)) {
        return Uint8Array.from(fields.key);
      }
      // Handle the case where the key is stored as Base64 or hex string
      return new Uint8Array(Buffer.from(fields.key, "base64"));
    }
    return null;
  } catch (error) {
    console.error("🚨 Error fetching user public key:", error);
    return null;
  }
}

module.exports = {
  createRegisterPublicKey,
  registerPublicKeyOnChain,
  fetchUserPublicKey,
};
