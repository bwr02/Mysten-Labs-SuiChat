"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var crypto_1 = require("crypto");
var encryptUtils_1 = require("../src/encryptUtils");
// Generate an RSA key pair for testing (in practice, use securely generated keys)
var _a = (0, crypto_1.generateKeyPairSync)("rsa", {
    modulusLength: 2048, // Length of key in bits (2048 is generally secure)
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
}), publicKey1 = _a.publicKey, privateKey1 = _a.privateKey;
// Generate an RSA key pair for testing (in practice, use securely generated keys)
var _b = (0, crypto_1.generateKeyPairSync)("rsa", {
    modulusLength: 2048, // Length of key in bits (2048 is generally secure)
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
}), publicKey2 = _b.publicKey, privateKey2 = _b.privateKey;
// Assertion function
function assertEqual(actual, expected, message) {
    if (actual !== expected) {
        throw new Error("".concat(message, ": Expected ").concat(expected, ", but got ").concat(actual));
    }
}
function assertInstanceOf(actual, expectedType, message) {
    if (!(actual instanceof expectedType)) {
        throw new Error("".concat(message, ": Expected instance of ").concat(expectedType.name, ", but got ").concat(typeof actual));
    }
}
// Test cases as functions
function testEncryptAndDecrypt() {
    var message = "hello, world!";
    var encryptedMessage = (0, encryptUtils_1.encryptMessage)(message, publicKey1);
    assertInstanceOf(encryptedMessage, Buffer, "Encryption should return a Buffer");
    /*const uint8Array = Uint8Array.from(encryptedMessage);
    console.log(uint8Array);
    const buffer = Buffer.from(uint8Array);*/
    var decryptedMessage = (0, encryptUtils_1.decryptMessage)(encryptedMessage, privateKey1);
    assertEqual(decryptedMessage, message, "Decrypted message should match original message");
}
function testDecryptWithIncorrectKey() {
    var message = "hello, world!";
    var encryptedMessage = (0, encryptUtils_1.encryptMessage)(message, publicKey1);
    /*const uint8Array = Uint8Array.from(encryptedMessage);
    console.log(uint8Array);
    const buffer = Buffer.from(uint8Array);*/
    try {
        var incorrectDecryptedMessage = (0, encryptUtils_1.decryptMessage)(encryptedMessage, privateKey2);
        throw Error("Test Failed: Should not be able to decrypt message with wrong private key");
    }
    catch (error) {
    }
}
function testEncryptEmptyString() {
    var emptyMessage = "";
    var encryptedMessage = (0, encryptUtils_1.encryptMessage)(emptyMessage, publicKey1);
    assertInstanceOf(encryptedMessage, Buffer, "Encryption should return a Buffer for empty message");
    /*const uint8Array = Uint8Array.from(encryptedMessage);
    console.log(uint8Array);
    const buffer = Buffer.from(uint8Array);*/
    var decryptedMessage = (0, encryptUtils_1.decryptMessage)(encryptedMessage, privateKey1);
    assertEqual(decryptedMessage, emptyMessage, "Decrypted result should be the empty string");
}
function testEncryptLongMessage() {
    var longMessage = "A".repeat(200); // 200 characters for testing
    var encryptedMessage = (0, encryptUtils_1.encryptMessage)(longMessage, publicKey2);
    assertInstanceOf(encryptedMessage, Buffer, "Encryption should return a Buffer for long message");
    /*const uint8Array = Uint8Array.from(encryptedMessage);
    console.log(uint8Array);
    const buffer = Buffer.from(uint8Array);*/
    var decryptedMessage = (0, encryptUtils_1.decryptMessage)(encryptedMessage, privateKey2);
    assertEqual(decryptedMessage, longMessage, "Decrypted result should match long message");
}
// Run all tests
function runTests() {
    try {
        testEncryptAndDecrypt();
        console.log("Test 1 passed: Encrypt and Decrypt");
        testDecryptWithIncorrectKey();
        console.log("Test 2 passed: Decrypt with Incorrect Private Key");
        testEncryptEmptyString();
        console.log("Test 3 passed: Handle Empty String Message");
        testEncryptLongMessage();
        console.log("Test 4 passed: Handle Long Message");
    }
    catch (error) {
        console.error("Test failed:", error.message);
    }
}
// Execute the tests
runTests();
