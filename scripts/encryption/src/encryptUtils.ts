import * as forge from "node-forge";

// Function to generate RSA key pair
export function generateKeyPair(): { publicKey: string; privateKey: string } {
    const keys = forge.pki.rsa.generateKeyPair({ bits: 2048, e: 0x10001 });
    const publicKey = forge.pki.publicKeyToPem(keys.publicKey);
    const privateKey = forge.pki.privateKeyToPem(keys.privateKey);
    return { publicKey, privateKey };
}

// Function to encrypt a message using the public key
export function encryptMessage(message: string, publicKey: string): string {
    const publicKeyObj = forge.pki.publicKeyFromPem(publicKey);
    const encrypted = publicKeyObj.encrypt(message, "RSA-OAEP", {
        md: forge.md.sha256.create(),
    });
    return forge.util.encode64(encrypted); // Return Base64 encoded ciphertext
}

// Function to decrypt a message using the private key
export function decryptMessage(encryptedMessage: string, privateKey: string): string {
    const privateKeyObj = forge.pki.privateKeyFromPem(privateKey);
    const encryptedBytes = forge.util.decode64(encryptedMessage); // Decode Base64
    const decrypted = privateKeyObj.decrypt(encryptedBytes, "RSA-OAEP", {
        md: forge.md.sha256.create(),
    });
    return decrypted; // Return plaintext
}
