import { Message, STORAGE_KEYS } from "@/types/types";
import { generateSharedSecret } from "./cryptoService";
import * as forge from "node-forge";


// Decrypts an encrypted message using AES-CBC with a key derived from a shared secret
export function decrypt(
  encryptedText: string | null,
  sharedSecret: string,
): string {
  if (!encryptedText) return "failed";

  try {
    // Convert the hex string to a Buffer and then to a byte string.
    const keyBuffer = Buffer.from(sharedSecret, "hex");
    const key = forge.util.createBuffer(keyBuffer).bytes();

    // Decode the encrypted message from Base64
    const encrypted = forge.util.decode64(encryptedText);

    // Extract the IV (first 16 bytes) and the ciphertext (remaining bytes)
    const iv = encrypted.slice(0, 16);
    const ciphertext = encrypted.slice(16);

    // Create the decipher using AES-CBC with the same key.
    const decipher = forge.cipher.createDecipher("AES-CBC", key);
    decipher.start({ iv });
    decipher.update(forge.util.createBuffer(ciphertext));

    const success = decipher.finish();
    if (!success) {
      throw new Error("Decryption failed");
    }
    return decipher.output.toString();
  } catch (error) {
    console.error("Decryption error:", error);
    return "Decryption Failed, encrypted message: " + encryptedText;
  }
}

export async function decryptSingleMessage(
  encryptedText: string,
  recipientPub: Uint8Array,
): Promise<string> {
  const storedPrivateKey = localStorage.getItem(STORAGE_KEYS.PRIVATE_KEY);
  if (!storedPrivateKey) {
    throw new Error("Private key not found. Please reconnect your wallet.");
  }

  const myPriv = new Uint8Array(Buffer.from(storedPrivateKey, 'base64'));
  const sharedSecret = generateSharedSecret(myPriv, recipientPub);
  return decrypt(encryptedText, sharedSecret);
}

export async function fetchAndDecryptChatHistory(
  recipientAddress: string,
  recipientPub: Uint8Array,
): Promise<Message[]> {
  try {
    const response = await fetch(
      `http://localhost:3000/messages/with-given-address/${recipientAddress}`,
    );

    if (!response.ok) {
      throw new Error("Failed to fetch chat history");
    }

    const encryptedMessages: Message[] = await response.json();

    const decryptedMessages = await Promise.all(
      encryptedMessages.map(async (message) => {
        if (!message.text) {
          return { ...message, text: "" }; // set empty string if text is null
        }
        return {
          ...message,
          text: await decryptSingleMessage(message.text, recipientPub),
        };
      })
    );
    return decryptedMessages;
  } catch (error) {
    console.error("Error fetching chat history:", error);
    throw error;
  }
}
