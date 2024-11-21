import { generateKeyPairSync, publicEncrypt, privateDecrypt } from 'crypto';
import { encryptMessage , decryptMessage } from '../src/encryptUtils'


// Generate an RSA key pair for testing (in practice, use securely generated keys)
const { publicKey: publicKey1, privateKey: privateKey1 } = generateKeyPairSync("rsa", {
    modulusLength: 2048, // Length of key in bits (2048 is generally secure)
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
});

// Generate an RSA key pair for testing (in practice, use securely generated keys)
const { publicKey: publicKey2, privateKey: privateKey2 } = generateKeyPairSync("rsa", {
    modulusLength: 2048, // Length of key in bits (2048 is generally secure)
    publicKeyEncoding: { type: "spki", format: "pem" },
    privateKeyEncoding: { type: "pkcs8", format: "pem" },
});


// Assertion function
function assertEqual(actual: any, expected: any, message: string) {
    if (actual !== expected) {
        throw new Error(`${message}: Expected ${expected}, but got ${actual}`);
    }
}

function assertInstanceOf(actual: any, expectedType: Function, message: string) {
    if (!(actual instanceof expectedType)) {
        throw new Error(`${message}: Expected instance of ${expectedType.name}, but got ${typeof actual}`);
    }
}

// Test cases as functions
function testEncryptAndDecrypt() {
    const message = "hello, world!";

    const encryptedMessage = encryptMessage(message, publicKey1);
    assertInstanceOf(encryptedMessage, Buffer, "Encryption should return a Buffer");

    const decryptedMessage = decryptMessage(encryptedMessage, privateKey1);
    assertEqual(decryptedMessage, message, "Decrypted message should match original message");
}

function testDecryptWithIncorrectKey() {
    const message = "hello, world!";

    const encryptedMessage = encryptMessage(message, publicKey1);
    try{
        const incorrectDecryptedMessage = decryptMessage(encryptedMessage, privateKey2);
        throw Error("Test Failed: Should not be able to decrypt message with wrong private key")
    }
    catch (error){
    }
}

function testEncryptEmptyString() {
    const emptyMessage = "";

    const encryptedMessage = encryptMessage(emptyMessage, publicKey1);
    assertInstanceOf(encryptedMessage, Buffer, "Encryption should return a Buffer for empty message");

    const decryptedMessage = decryptMessage(encryptedMessage, privateKey1);
    assertEqual(decryptedMessage, emptyMessage, "Decrypted result should be the empty string");
}

function testEncryptLongMessage() {
    const longMessage = "A".repeat(200); // 200 characters for testing

    const encryptedMessage = encryptMessage(longMessage, publicKey2);
    assertInstanceOf(encryptedMessage, Buffer, "Encryption should return a Buffer for long message");

    const decryptedMessage = decryptMessage(encryptedMessage, privateKey2);
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

    } catch (error) {
        console.error("Test failed:", error.message);
    }
}

// Execute the tests
runTests();

/*
to compile TypeScript Code (make sure that tsc is insalled i.e. typescript is intalled globally):
    tsc encryptUtils.test.ts
To run tests:
    node encryptUtils.test.js
*/
