import { fromBase64 } from "@mysten/bcs";
import * as forge from "node-forge";
import { blake2b } from "@noble/hashes/blake2b";
import { x25519 } from "@noble/curves/ed25519";
import { bytesToHex } from "@noble/hashes/utils";
import nacl from "tweetnacl";
import { WalletContextState } from "@suiet/wallet-kit";

export async function getOrCreateSignature(
  wallet: WalletContextState,
): Promise<string> {
  let signature = localStorage.getItem("walletSignature");

  if (!signature) {
    const messageBytes = new TextEncoder().encode(
      "Random message for key derivation",
    );
    const signatureData = await wallet?.signPersonalMessage({
      message: messageBytes,
    });

    if (!signatureData?.signature) {
      throw new Error("Failed to obtain wallet signature");
    }

    signature = signatureData.signature;
    localStorage.setItem("walletSignature", signature);
  }

  return signature;
}

/**
 * Derives an ephemeral X25519 key pair from a Sui signature.
 * Assumes the signature is 97 bytes:
 *   - 1-byte scheme,
 *   - 32-byte embedded Ed25519 public key,
 *   - 64-byte signature body.
 *
 * The private key is derived by hashing (with Blake2b) the signature body
 * and then "clamping" it to meet the X25519 requirements.
 *
 * The public key is computed directly from this derived private key using
 * `nacl.scalarMult.base()`. This ensures that the key pair is mathematically
 * consistent (i.e. the public key corresponds exactly to the derived private key).
 */

export function deriveKeysFromSignature(signature: string): {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
} {
  const sigBytes = fromBase64(signature);
  if (sigBytes.length !== 97) {
    throw new Error(
      `Invalid Sui signature length: ${sigBytes.length}, expected 97`,
    );
  }

  // Extract the signature body and ignore the embedded Ed25519 public key
  const sigBody = sigBytes.slice(33);

  // Derive the ephemeral X25519 private key from the signature body using Blake2b and clamping.
  const priv = blake2b(sigBody, { dkLen: 32 });
  priv[0] &= 248;
  priv[31] &= 127;
  priv[31] |= 64;

  // Compute the matching X25519 public key directly from the derived private key.
  // Using nacl.scalarMult.base(priv) ensures that the public key is mathematically coupled to the private key.
  const pub = nacl.scalarMult.base(priv);

  console.log("Derived ephemeral private key (hex):", bytesToHex(priv));
  console.log("Derived ephemeral public key (hex):", bytesToHex(pub));

  return {
    privateKey: priv,
    publicKey: pub,
  };
}

export function generateSharedSecret(
  aPriv: Uint8Array,
  bPub: Uint8Array,
): string {
  const rawSecretAB = x25519.getSharedSecret(aPriv, bPub);
  // Hash the raw secret for consistency.
  return bytesToHex(blake2b(rawSecretAB, { dkLen: 32 }));
}

// Encrypts a message using AES-CBC with a key derived from a shared secret
export function encrypt(message: string | null, sharedSecret: string): string {
  if (!message) return "";

  // Convert the hex string to a Buffer (binary data)
  const keyBuffer = Buffer.from(sharedSecret, "hex");
  // Create the key as a string of bytes using forge’s buffer.
  const key = forge.util.createBuffer(keyBuffer).bytes();

  // Generate a random 16-byte IV
  const iv = forge.random.getBytesSync(16);

  // Create the cipher with AES-CBC using the derived key
  const cipher = forge.cipher.createCipher("AES-CBC", key);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(message, "utf8"));
  cipher.finish();

  // Concatenate IV and ciphertext.
  const combined = iv + cipher.output.getBytes();
  // Return the result encoded in Base64.
  return forge.util.encode64(combined);
}

