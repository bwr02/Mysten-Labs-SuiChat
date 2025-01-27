import { fromBase64 } from '@mysten/bcs';
import nacl from 'tweetnacl';
import * as forge from 'node-forge';
import { blake2b } from '@noble/hashes/blake2b';



export function deriveKeyFromSignature(signature: string): Uint8Array {
    const signatureBytes = fromBase64(signature);
    // Use Blake2b to derive a deterministic private key
    const hash = blake2b(signatureBytes, { dkLen: 32 });
    // Convert to X25519 private key format
    const scalar = new Uint8Array(hash);
    scalar[0] &= 248;
    scalar[31] &= 127;
    scalar[31] |= 64;
    return scalar;
}


export function generateSharedSecret(privateKey: Uint8Array, publicAddr: string): Uint8Array {
    try {
        console.log("Private key input:", Array.from(privateKey));
        console.log("Public address input:", publicAddr);
        
        const addrBytes = Buffer.from(publicAddr.replace('0x', ''), 'hex');
        console.log("Address bytes:", Array.from(addrBytes));
        
        const derivedPubKey = blake2b(addrBytes, { dkLen: 32 });
        console.log("Derived public key:", Array.from(derivedPubKey));
        
        const pubKey = new Uint8Array(derivedPubKey);
        pubKey[31] &= 127;
        console.log("Formatted public key:", Array.from(pubKey));
        
        const sharedSecret = nacl.scalarMult(privateKey, pubKey);
        console.log("Raw shared secret:", Array.from(sharedSecret));
        
        const finalSecret = new Uint8Array(blake2b(sharedSecret, { dkLen: 32 }));
        console.log("Final shared secret:", Array.from(finalSecret));
        
        return finalSecret;
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
