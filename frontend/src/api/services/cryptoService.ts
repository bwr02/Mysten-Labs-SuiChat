import { fromBase64 } from '@mysten/bcs';
import nacl from 'tweetnacl';
import * as forge from 'node-forge';



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
  const key = forge.util.createBuffer(sharedSecret).bytes(); // Ensure the key is in the correct format
  const iv = forge.random.getBytesSync(16); // Generate a random 16-byte IV

  // Initialize the AES cipher in CBC mode
  const cipher = forge.cipher.createCipher('AES-CBC', key);
  cipher.start({ iv });
  cipher.update(forge.util.createBuffer(message));
  cipher.finish();

  // Concatenate IV and encrypted data for ease of use
  const encrypted = iv + cipher.output.getBytes();
  return forge.util.encode64(encrypted); // Return Base64 encoded ciphertext
}

export function decryptMessage(encryptedBase64: string | null, sharedSecret: Uint8Array): string {
  if(!encryptedBase64){
    return ""
  }
  const key = forge.util.createBuffer(sharedSecret).bytes(); // Ensure the key is in the correct format
  const encryptedBytes = forge.util.decode64(encryptedBase64); // Decode from Base64

  // Extract IV and ciphertext
  const iv = encryptedBytes.slice(0, 16); // First 16 bytes are the IV
  const ciphertext = encryptedBytes.slice(16);

  // Initialize the AES decipher in CBC mode
  const decipher = forge.cipher.createDecipher('AES-CBC', key);
  decipher.start({ iv });
  decipher.update(forge.util.createBuffer(ciphertext));
  const success = decipher.finish();

  if (!success) {
      throw new Error("Decryption failed");
  }

  return decipher.output.toString(); // Return the decrypted message
}
