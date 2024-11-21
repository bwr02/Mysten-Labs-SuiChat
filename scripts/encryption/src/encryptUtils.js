"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.encryptMessage = encryptMessage;
exports.decryptMessage = decryptMessage;
var crypto_1 = require("crypto");
// Function to encrypt a message with the recipient's public key
function encryptMessage(message, publicKey) {
    return (0, crypto_1.publicEncrypt)(publicKey, Uint8Array.from(Buffer.from(message, "utf8")));
}
// Function to decrypt a message with the recipient's private key
function decryptMessage(encryptedMessage, privateKey) {
    return (0, crypto_1.privateDecrypt)(privateKey, Buffer.from(encryptedMessage)).toString("utf8");
}
