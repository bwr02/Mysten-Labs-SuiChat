const { fromBase64 } = require("@mysten/bcs");
const { ed25519, x25519 } = require("@noble/curves/ed25519");
const { blake2b } = require("@noble/hashes/blake2b");
const { bytesToHex } = require("@noble/hashes/utils");
const forge = require("node-forge");
const nacl = require("tweetnacl");

/**
 * Derives an ephemeral X25519 key pair from a Sui signature.
 */
function deriveX25519FromSuiSignature(signature) {
  const sigBytes = fromBase64(signature);
  if (sigBytes.length !== 97) {
    throw new Error(
      `Invalid Sui signature length: ${sigBytes.length}, expected 97`
    );
  }

  const sigBody = sigBytes.slice(33);

  // Derive private key
  const priv = blake2b(sigBody, { dkLen: 32 });
  priv[0] &= 248;
  priv[31] &= 127;
  priv[31] |= 64;

  // Compute the public key
  const pub = nacl.scalarMult.base(priv);

  console.log("Derived ephemeral private key (hex):", bytesToHex(priv));
  console.log("Derived ephemeral public key (hex):", bytesToHex(pub));

  return {
    privateKey: priv,
    publicKey: pub,
  };
}

/**
 * Computes the shared secret between two keys.
 */
function generateSharedSecret(aPriv, bPub) {
  const rawSecret = x25519.getSharedSecret(aPriv, bPub);
  return bytesToHex(blake2b(rawSecret, { dkLen: 32 }));
}

/**
 * Encrypts a message using AES-CBC.
 */
function encrypt(message, sharedSecretHex) {
  if (!message) return "";

  const keyBuffer = Buffer.from(sharedSecretHex, "hex");
  const key = forge.util.createBuffer(keyBuffer).bytes();

  const iv = forge.random.getBytesSync(16);
  const cipher = forge.cipher.createCipher("AES-CBC", key);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(message, "utf8"));
  cipher.finish();

  return forge.util.encode64(iv + cipher.output.getBytes());
}

/**
 * Decrypts an encrypted message using AES-CBC.
 */
function decrypt(encryptedText, sharedSecretHex) {
  if (!encryptedText) return "failed";

  try {
    console.log("Decrypting message:", encryptedText);
    console.log("Using shared secret (hex):", sharedSecretHex);

    const keyBuffer = Buffer.from(sharedSecretHex, "hex");
    const key = forge.util.createBuffer(keyBuffer).bytes();

    const encrypted = forge.util.decode64(encryptedText);
    const iv = encrypted.slice(0, 16);
    const ciphertext = encrypted.slice(16);

    console.log("IV:", forge.util.bytesToHex(iv));
    console.log("Ciphertext:", forge.util.bytesToHex(ciphertext));

    const decipher = forge.cipher.createDecipher("AES-CBC", key);
    decipher.start({ iv });
    decipher.update(forge.util.createBuffer(ciphertext));

    if (!decipher.finish()) {
      throw new Error("Decryption failed");
    }

    return decipher.output.toString();
  } catch (error) {
    console.error("Decryption error:", error);
    return "Decryption Failed, encrypted message: " + encryptedText;
  }
}

/**
 * Tests shared secret generation and encryption/decryption.
 */
async function testSharedSecret() {
  const signatureA =
    "APMO76ahDOWtH40LpOfwihT8GxCVNV1oC3es3bVCUnftAjWpoWCvK61rTDXzesBiE3Geyvf9sRZ/lRpZDbsJUwm92EgngcbGZ5z7f/z3F+zqChL07qhAmk+3dSOUntD4pA==";
  const signatureB =
    "ABG4Vnf3Pq9RPc9ZLGXr1PHc1EFwlVT009V5cRqhL1uOnNNm35aBQIZfW8ps0HMicGbFCPr4s7plOdXWOBDm1wlv+zmFTLlJH3T0EieHQE152IRe/mnYU1NbK4p5szZLCw==";

  const { privateKey: aPriv, publicKey: aPub } =
    deriveX25519FromSuiSignature(signatureA);
  const { privateKey: bPriv, publicKey: bPub } =
    deriveX25519FromSuiSignature(signatureB);

  console.log("aPub", aPub);
  const sharedSecretHexA = generateSharedSecret(aPriv, bPub);
  const sharedSecretHexB = generateSharedSecret(bPriv, aPub);

  console.log("Party A shared secret (hex):", sharedSecretHexA);
  console.log("Party B shared secret (hex):", sharedSecretHexB);
  console.log("Secrets match:", sharedSecretHexA === sharedSecretHexB);

  const message = "Hello, this is a test message!";
  const encryptedMessage = encrypt(message, sharedSecretHexB);
  console.log("Encrypted message:", encryptedMessage);

  const decryptedMessage = decrypt(encryptedMessage, sharedSecretHexA);
  console.log("Decrypted message:", decryptedMessage);
}

/**
 * Debug test for signature-based key derivation.
 */
async function debugTest() {
  const knownPrivate = ed25519.utils.randomPrivateKey();
  const knownPublic = ed25519.getPublicKey(knownPrivate);

  const message = new TextEncoder().encode("Random message for key derivation");
  const sig = ed25519.sign(message, knownPrivate);

  const suiSig = new Uint8Array(97);
  suiSig.set([0x00], 0);
  suiSig.set(knownPublic, 1);
  suiSig.set(sig, 33);
  const signatureB64 = Buffer.from(suiSig).toString("base64");

  const { privateKey, publicKey } = deriveX25519FromSuiSignature(signatureB64);
  const rawSecret = x25519.getSharedSecret(privateKey, publicKey);
  const secret = bytesToHex(blake2b(rawSecret, { dkLen: 32 }));

  console.log("Debug Test – Shared Secret:", secret);
}

// Run the tests
testSharedSecret();
// debugTest();

module.exports = {
  deriveX25519FromSuiSignature,
  generateSharedSecret,
  encrypt,
  decrypt,
  testSharedSecret,
  debugTest,
};
