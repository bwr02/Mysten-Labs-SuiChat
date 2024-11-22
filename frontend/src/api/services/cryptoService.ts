import { blake2b } from '@noble/hashes/blake2b';
import { x25519 } from '@noble/curves/ed25519';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';

export const deriveKeyFromSignature = (signature: string) => {
    // Hash the signature to get a 32-byte seed
    const seed = blake2b(hexToBytes(signature), { dkLen: 32 });
    return bytesToHex(seed);
};

export const generateSharedSecret = (tempPrivateKey: string, publicAddress: string) => {
    const privateKeyBytes = hexToBytes(tempPrivateKey);
    const publicKeyBytes = hexToBytes(publicAddress.slice(2)); // Remove '0x' prefix, adjust depending on how we want to derive public key
    const sharedSecret = x25519.getSharedSecret(privateKeyBytes, publicKeyBytes);
    return bytesToHex(sharedSecret);
};

export const encryptMessage = (message: string, sharedSecret: string) => {
    // TODO: Implement encryption using the shared secret
    // You might want to use AES or another symmetric encryption algorithm
    return message;
};

export const decryptMessage = (encryptedMessage: string, sharedSecret: string) => {
    // TODO: Implement decryption using the shared secret
    return encryptedMessage;
};
