import { fromBase64 } from '@mysten/bcs';
import nacl from 'tweetnacl';



export function deriveKeyFromSignature(signature: string) {
  try {
    const signatureBytes = fromBase64(signature);
    const privateKey = signatureBytes.slice(0, 32);  // taking first 32 bytes of signature as the private key
    console.log('Private key:', privateKey, );
    return privateKey;
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

export const encryptMessage = (message: string, sharedSecret: Uint8Array) => {
    // TODO: Implement encryption using the shared secret
    // You might want to use AES or another symmetric encryption algorithm
    return message;
};

export const decryptMessage = (encryptedMessage: string, sharedSecret: Uint8Array) => {
    // TODO: Implement decryption using the shared secret
    return encryptedMessage;
};
