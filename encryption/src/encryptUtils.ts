//import { publicEncrypt, privateDecrypt } from 'crypto';
import * as crypto from "crypto-browserify";


// Function to encrypt a message with the recipient's public key

export function encryptMessage(message: string, publicKey: string): Uint8Array {
    return crypto.publicEncrypt(publicKey, Uint8Array.from(Buffer.from(message, "utf8")));
}

// Function to decrypt a message with the recipient's private key
export function decryptMessage(encryptedMessage: Uint8Array, privateKey: string): string {
    return crypto.privateDecrypt(privateKey, Buffer.from(encryptedMessage)).toString("utf8");
}


/*
import { publicEncrypt, privateDecrypt } from 'crypto';

// Function to encrypt a message with the recipient's public key
export function encryptMessage(message: string, publicKey: string): Uint8Array {
    return publicEncrypt(publicKey, Uint8Array.from(Buffer.from(message, "utf8")));
}

// Function to decrypt a message with the recipient's private key
export function decryptMessage(encryptedMessage: Uint8Array, privateKey: string): string {
    return privateDecrypt(privateKey, Buffer.from(encryptedMessage)).toString("utf8");
}
    */
