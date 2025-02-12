import { fromBase64 } from "@mysten/bcs";
import { ed25519, x25519 } from "@noble/curves/ed25519";
import { blake2b } from "@noble/hashes/blake2b";
import { bytesToHex } from "@noble/hashes/utils";
import forge from "node-forge";
import nacl from "tweetnacl";

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
export function deriveX25519FromSuiSignature(signature: string): {
  privateKey: Uint8Array;
  publicKey: Uint8Array;
} {
  const sigBytes = fromBase64(signature);
  if (sigBytes.length !== 97) {
    throw new Error(
      `Invalid Sui signature length: ${sigBytes.length}, expected 97`,
    );
  }

  // Extract the 64-byte signature body (we ignore the embedded Ed25519 public key)
  const sigBody = sigBytes.slice(33);

  // Derive the ephemeral X25519 private key from the signature body using Blake2b and clamping.
  const priv = blake2b(sigBody, { dkLen: 32 });
  priv[0] &= 248;
  priv[31] &= 127;
  priv[31] |= 64;

  // Compute the matching X25519 public key directly from the derived private key.
  // Using nacl.scalarMult.base(priv) ensures that the public key is mathematically
  // coupled to the derived private key.
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
  const rawSecret = x25519.getSharedSecret(aPriv, bPub);
  // Hash the raw secret for consistency.
  return bytesToHex(blake2b(rawSecret, { dkLen: 32 }));
}

/**
 * Encrypts a message using AES-CBC with a key derived from a shared secret.
 * The sharedSecret is expected to be a hex string.
 */
export function encrypt(
  message: string | null,
  sharedSecretHex: string,
): string {
  if (!message) return "";

  // Convert the hex string to a Buffer (binary data)
  const keyBuffer = Buffer.from(sharedSecretHex, "hex");
  // Create the key as a string of bytes using forge’s buffer.
  const key = forge.util.createBuffer(keyBuffer).bytes();

  // Generate a random 16-byte IV.
  const iv = forge.random.getBytesSync(16);

  // Create the cipher with AES-CBC using the derived key.
  const cipher = forge.cipher.createCipher("AES-CBC", key);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(message, "utf8"));
  cipher.finish();

  // Concatenate IV and ciphertext.
  const combined = iv + cipher.output.getBytes();
  // Return the result encoded in Base64.
  return forge.util.encode64(combined);
}

/**
 * Decrypts an encrypted message using AES-CBC with a key derived from a shared secret.
 * The sharedSecret is expected to be a hex string.
 */
export function decrypt(
  encryptedText: string | null,
  sharedSecretHex: string,
): string {
  if (!encryptedText) return "failed";

  try {
    console.log("Decrypting message:", encryptedText);
    console.log("Using shared secret (hex):", sharedSecretHex);

    // Convert the hex string to a Buffer and then to a byte string.
    const keyBuffer = Buffer.from(sharedSecretHex, "hex");
    const key = forge.util.createBuffer(keyBuffer).bytes();

    // Decode the encrypted message from Base64.
    const encrypted = forge.util.decode64(encryptedText);
    console.log("Decoded encrypted length:", encrypted.length);

    // Extract the IV (first 16 bytes) and the ciphertext (remaining bytes).
    const iv = encrypted.slice(0, 16);
    const ciphertext = encrypted.slice(16);

    console.log("IV:", forge.util.bytesToHex(iv));
    console.log("Ciphertext:", forge.util.bytesToHex(ciphertext));

    // Create the decipher using AES-CBC with the same key.
    const decipher = forge.cipher.createDecipher("AES-CBC", key);
    decipher.start({ iv });
    decipher.update(forge.util.createBuffer(ciphertext));

    const success = decipher.finish();
    console.log("Decryption success:", success);

    if (!success) {
      throw new Error("Decryption failed");
    }

    return decipher.output.toString();
  } catch (error) {
    console.error("Decryption error:", error);
    return "Decryption Failed, encrypted message: " + encryptedText;
  }
}

/**
 * Modified testSharedSecret that derives both parties’ ephemeral key pairs
 * from their signatures and then computes the shared secret.
 */
async function testSharedSecret() {
  // Two Sui-style signatures (each 97 bytes, with embedded public keys)
  const signatureA =
    "APMO76ahDOWtH40LpOfwihT8GxCVNV1oC3es3bVCUnftAjWpoWCvK61rTDXzesBiE3Geyvf9sRZ/lRpZDbsJUwm92EgngcbGZ5z7f/z3F+zqChL07qhAmk+3dSOUntD4pA==";
  const signatureB =
    "ABG4Vnf3Pq9RPc9ZLGXr1PHc1EFwlVT009V5cRqhL1uOnNNm35aBQIZfW8ps0HMicGbFCPr4s7plOdXWOBDm1wlv+zmFTLlJH3T0EieHQE152IRe/mnYU1NbK4p5szZLCw==";

  // Derive ephemeral key pairs for Party A and Party B.
  const { privateKey: aPriv, publicKey: aPub } =
    deriveX25519FromSuiSignature(signatureA);
  const { privateKey: bPriv, publicKey: bPub } =
    deriveX25519FromSuiSignature(signatureB);

  // Compute the shared secret from both perspectives.
  const sharedSecretHexA = generateSharedSecret(aPriv, bPub);
  const sharedSecretHexB = generateSharedSecret(bPriv, aPub);

  console.log("Party A shared secret (hex):", sharedSecretHexA);
  console.log("Party B shared secret (hex):", sharedSecretHexB);
  console.log("Secrets match:", sharedSecretHexA === sharedSecretHexB);

  // Test encryption and decryption using the shared secret hex string.
  const message = "Hello, this is a test message!";
  const encryptedMessage = encrypt(message, sharedSecretHexB);
  console.log("Encrypted message:", encryptedMessage);

  const decryptedMessage = decrypt(encryptedMessage, sharedSecretHexA);
  console.log("Decrypted message:", decryptedMessage);
}

/**
 * A debug test that generates a key pair, signs a message, and then verifies
 * that deriving the ephemeral key pair from the signature gives a valid shared secret.
 */
async function debugTest() {
  // Generate known keys for testing
  const knownPrivate = ed25519.utils.randomPrivateKey();
  const knownPublic = ed25519.getPublicKey(knownPrivate);

  // Sign a fixed message
  const message = new TextEncoder().encode("Random message for key derivation");
  const sig = ed25519.sign(message, knownPrivate);

  // Construct a Sui-style signature:
  //   1-byte scheme (0x00), then 32-byte Ed25519 public key, then 64-byte signature body.
  const suiSig = new Uint8Array(97);
  suiSig.set([0x00], 0);
  suiSig.set(knownPublic, 1);
  suiSig.set(sig, 33);
  const signatureB64 = Buffer.from(suiSig).toString("base64");

  // For this test, use the same signature for both sides (so the shared secret
  // is computed from the same key pair, just as a check).
  const { privateKey, publicKey } = deriveX25519FromSuiSignature(signatureB64);
  const rawSecret = x25519.getSharedSecret(privateKey, publicKey);
  const secret = bytesToHex(blake2b(rawSecret, { dkLen: 32 }));

  console.log("Debug Test – Shared Secret:", secret);
}

testSharedSecret();
// debugTest();
