import { fromBase64 } from '@mysten/bcs';
import { ed25519, x25519 } from '@noble/curves/ed25519';
import { blake2b } from '@noble/hashes/blake2b';
import { bytesToHex } from '@noble/hashes/utils';
import nacl from 'tweetnacl';

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
    throw new Error(`Invalid Sui signature length: ${sigBytes.length}, expected 97`);
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

/**
 * Modified testSharedSecret that derives both parties’ ephemeral key pairs
 * from their signatures and then computes the shared secret.
 */
async function testSharedSecret() {
  // Two Sui-style signatures (each 97 bytes, with embedded public keys)
  const signatureA = 'APMO76ahDOWtH40LpOfwihT8GxCVNV1oC3es3bVCUnftAjWpoWCvK61rTDXzesBiE3Geyvf9sRZ/lRpZDbsJUwm92EgngcbGZ5z7f/z3F+zqChL07qhAmk+3dSOUntD4pA==';
  const signatureB = 'ABG4Vnf3Pq9RPc9ZLGXr1PHc1EFwlVT009V5cRqhL1uOnNNm35aBQIZfW8ps0HMicGbFCPr4s7plOdXWOBDm1wlv+zmFTLlJH3T0EieHQE152IRe/mnYU1NbK4p5szZLCw==';

  // Derive ephemeral key pairs for Party A and Party B
  const { privateKey: aPriv, publicKey: aPub } = deriveX25519FromSuiSignature(signatureA);
  const { privateKey: bPriv, publicKey: bPub } = deriveX25519FromSuiSignature(signatureB);

  // Compute the raw shared secrets from both perspectives using Diffie–Hellman.
  const rawSecretAB = x25519.getSharedSecret(aPriv, bPub);
  const rawSecretBA = x25519.getSharedSecret(bPriv, aPub);

  // Hash the raw secret for consistency (using Blake2b with dkLen: 32)
  const finalSecretAB = bytesToHex(blake2b(rawSecretAB, { dkLen: 32 }));
  const finalSecretBA = bytesToHex(blake2b(rawSecretBA, { dkLen: 32 }));

  console.log("Party A computes shared secret:", finalSecretAB);
  console.log("Party B computes shared secret:", finalSecretBA);
  console.log("Secrets match:", finalSecretAB === finalSecretBA);
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
  const signatureB64 = Buffer.from(suiSig).toString('base64');

  // For this test, use the same signature for both sides (so the shared secret
  // is computed from the same key pair, just as a check).
  const { privateKey, publicKey } = deriveX25519FromSuiSignature(signatureB64);
  const rawSecret = x25519.getSharedSecret(privateKey, publicKey);
  const secret = bytesToHex(blake2b(rawSecret, { dkLen: 32 }));

  console.log("Debug Test – Shared Secret:", secret);
}

testSharedSecret();
// debugTest();
