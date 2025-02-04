import { fromBase64 } from '@mysten/bcs';
import nacl from 'tweetnacl';
import * as forge from 'node-forge';
import { entropyToMnemonic } from '@it-tools/bip39';
import { sha256 } from 'js-sha256';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import * as secp from "noble-secp256k1";

function deterministicMnemonic(input: string): string {
    // Hash the input to produce a deterministic 256-bit entropy
    const hash = sha256(input);
    // Convert the entropy into a mnemonic
    const mnem = entropyToMnemonic(hash.slice(0,32));
    console.log(mnem);
    return mnem;
}

const keyPair = Ed25519Keypair.deriveKeypair(deterministicMnemonic(string));
keyPair.getSecretKey();

//tortoise problem practice emerge ivory betray give glimpse creek begin cruise miss

export function deriveKeyFromSignature(signature: string) {
  try {
    const signatureBytes = fromBase64(signature);
    const tempPrivateKey = signatureBytes.slice(0, 32);  // taking first 32 bytes of signature as the private key
    console.log('Temp private key:', tempPrivateKey);
    return tempPrivateKey;
  } catch (error) {
    console.error('Error in deriveKeyFromSignature:', error);
    throw error;
  }
}


export function generateSharedSecret(privateKey: Uint8Array, publicKeyHex: string) {
  try {
    // Convert public key from hex to bytes
    const publicKey = Buffer.from(publicKeyHex.replace('0x', ''), 'hex');
    
    // Ensure privateKey is converted to the scalar for ed25519
    const sharedSecret = nacl.scalarMult(privateKey, publicKey);
    return sharedSecret;
  } catch (error) {
    console.error('Error in generateSharedSecret:', error);
    throw error;
  }
}


export function encryptMessage(message: string | null, sharedSecret: Uint8Array): string {
  if(!message){
    return ""
  }
  const uint8Array = new Uint8Array([213, 249, 206, 99, 105, 99, 99, 115, 160, 164, 91, 59, 55, 150, 8, 73, 141, 83, 51, 240, 70, 70, 89, 122, 210, 93, 37, 67, 127, 25, 225, 42]);
  const key = forge.util.createBuffer(uint8Array).bytes(); // TODO: remove hardcoded shared secret
  //const key = forge.util.createBuffer(sharedSecret).bytes(); // Ensure the key is in the correct format
  const iv = forge.random.getBytesSync(16); // Generate a random 16-byte IV
  console.log("IV (Encrypt):", forge.util.bytesToHex(iv));

  // Initialize the AES cipher in CBC mode
  const cipher = forge.cipher.createCipher('AES-CBC', key);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(message));
  cipher.finish();

  const output = cipher.output.getBytes();

  console.log("NON IV (Encrypt): " + forge.util.encode64(output));

  console.log("IV Encrypted Bytes Length (before):", iv.length);
  console.log("Cipher Encrypted Bytes Length (before):", output);
  // Concatenate IV and encrypted data for ease of use
  const encrypted = iv + output;
  console.log("ENCRYPTED SENDING: " + forge.util.encode64(encrypted));
  console.log("Encrypted Bytes Length (before):", encrypted.length);
  return forge.util.encode64(encrypted); // Return Base64 encoded ciphertext
  //return encrypted;
}

export function decryptMessage(encryptedBase64: string | null, sharedSecret: Uint8Array): string {
  if(!encryptedBase64){
    return "failed"
  }


  console.log("ENCRYPTED: " + encryptedBase64);
  console.log("SHARED SECRET: " + sharedSecret);
  const uint8Array = new Uint8Array([213, 249, 206, 99, 105, 99, 99, 115, 160, 164, 91, 59, 55, 150, 8, 73, 141, 83, 51, 240, 70, 70, 89, 122, 210, 93, 37, 67, 127, 25, 225, 42]);
  console.log("Hard coded SHARED SECRET: " + sharedSecret); // TODO: remove hardcoded shared secret
  const key = forge.util.createBuffer(uint8Array).bytes();
  //const key = forge.util.createBuffer(sharedSecret).bytes(); // Ensure the key is in the correct format
  const encryptedBytes = forge.util.decode64(encryptedBase64); // Decode from Base64
  console.log("Encrypted Bytes Length:", encryptedBytes.length);
  //const encryptedBytes = encryptedBase64;
  // Extract IV and ciphertext
  const iv = encryptedBytes.slice(0, 16); // First 16 bytes are the IV
  console.log("IV (Decrypt):", forge.util.bytesToHex(iv)); // this is different between encrypt and decrypt rn
  const ciphertext = encryptedBytes.slice(16);
  console.log("NON IV (Decrypt): " + forge.util.bytesToHex(ciphertext));

  // Initialize the AES decipher in CBC mode
  const decipher = forge.cipher.createDecipher('AES-CBC', key);
  decipher.start({ iv });
  decipher.update(forge.util.createBuffer(ciphertext));
  const success = decipher.finish();


  if (!success) {
      console.log("Decryption Failed")
      return "Decryption Failed, encrypted message: " + encryptedBase64.toString();
      //throw new Error("Decryption failed");
  }

  return decipher.output.toString(); // Return the decrypted message

}
