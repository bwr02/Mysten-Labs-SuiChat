import { fromB64 } from '@mysten/bcs'
import nacl from 'tweetnacl';
import * as forge from 'node-forge';
import { blake2b } from '@noble/hashes/blake2b';



export function deriveKeyFromSignature(signature: string) {
  try {
    const signatureBytes = fromB64(signature);
    const tempPrivateKey = signatureBytes.slice(0, 32);  // taking first 32 bytes of signature as the private key
    console.log('Temp private key:', tempPrivateKey);
    return tempPrivateKey;
  } catch (error) {
    console.error('Error in deriveKeyFromSignature:', error);
    throw error;
  }
}


export function generateSharedSecret(privateKey: Uint8Array, publicAddr: string): Uint8Array {
    try {
        const addrBytes = Buffer.from(publicAddr.replace('0x', ''), 'hex');
        
        // Derive a deterministic value from concatenated keys to ensure consistent order
        const combinedKeys = Buffer.concat([
            Buffer.from(privateKey),
            addrBytes
        ]);
        
        // Sort the bytes to ensure consistent ordering regardless of input order
        const sortedKeys = Array.from(combinedKeys);
        sortedKeys.sort();
        
        const finalSecret = blake2b(Buffer.from(sortedKeys), { dkLen: 32 });
        return new Uint8Array(finalSecret);
    } catch (error) {
        console.error('Error in generateSharedSecret:', error);
        throw error;
    }
}

export function encryptMessage(message: string | null, sharedSecret: Uint8Array): string {
    if(!message) return "";
    
    const key = forge.util.createBuffer(Buffer.from(sharedSecret)).bytes();
    const iv = forge.random.getBytesSync(16);
    
    const cipher = forge.cipher.createCipher('AES-CBC', key);
    cipher.start({ iv });
    cipher.update(forge.util.createBuffer(message, 'utf8'));
    cipher.finish();
    
    const combined = iv + cipher.output.getBytes();
    return forge.util.encode64(combined);
}


export function decryptMessage(encryptedBase64: string | null, sharedSecret: Uint8Array): string {
    if(!encryptedBase64) return "failed";
    
    try {
        console.log("Decrypting message:", encryptedBase64);
        console.log("Using shared secret:", Array.from(sharedSecret));
        
        const key = forge.util.createBuffer(Buffer.from(sharedSecret)).bytes();
        const encrypted = forge.util.decode64(encryptedBase64);
        
        console.log("Decoded encrypted length:", encrypted.length);
        
        const iv = encrypted.slice(0, 16);
        const ciphertext = encrypted.slice(16);
        
        console.log("IV:", forge.util.bytesToHex(iv));
        console.log("Ciphertext:", forge.util.bytesToHex(ciphertext));
        
        const decipher = forge.cipher.createDecipher('AES-CBC', key);
        decipher.start({ iv });
        decipher.update(forge.util.createBuffer(ciphertext));
        
        const success = decipher.finish();
        console.log("Decryption success:", success);
        
        if (!success) {
            throw new Error("Decryption failed");
        }
        
        return decipher.output.toString();
    } catch (error) {
        console.error('Decryption error:', error);
        return "Decryption Failed, encrypted message: " + encryptedBase64;
    }
}
