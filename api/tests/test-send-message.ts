import { TransactionBlock } from '@mysten/sui.js/transactions';
import { SuiClient } from '@mysten/sui.js/client';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';

const PACKAGE_ID = '0x6f06ff51a46a11e1eacb086822eb42405a1c4636971a4d8b8eccdf55c3b39a9d';

const client = new SuiClient({
    url: 'https://fullnode.testnet.sui.io:443',
});

const MNEMONIC = "reveal typical birth bamboo middle urban bring ginger armor peanut bar someone";
const keypair = Ed25519Keypair.deriveKeypair(MNEMONIC);
const myAddress = keypair.getPublicKey().toSuiAddress();
console.log('My address:', myAddress);

async function executeSendMessage(
    senderAddress: string,
    recipientAddress: string,
    content: Uint8Array,
    timestamp: number
) {
    try {
        const tx = new TransactionBlock();
        
        tx.moveCall({
            target: `${PACKAGE_ID}::send_message::send_message`,
            arguments: [
                tx.pure(senderAddress),
                tx.pure(recipientAddress),
                tx.pure(Array.from(content)),
                tx.pure(BigInt(timestamp))
            ],
        });

        const result = await client.signAndExecuteTransactionBlock({
            signer: keypair,
            transactionBlock: tx,
            options: {
                showEvents: true,
                showEffects: true,
            },
        });

        console.log("Transaction result:", result);
        return result;
    } catch (error) {
        console.error("Transaction failed:", error);
        throw error;
    }
}

const sender = myAddress;
const recipient = '0xc5b4d28027c266bf80603617796513f9b7afc0f66957ead0a94b4d78e1b9671f';
const content = new TextEncoder().encode("Hello, world!");
const timestamp = Date.now();

console.log('Sending message:');
console.log('From:', sender);
console.log('To:', recipient);
console.log('Content:', new TextDecoder().decode(content));
console.log('Timestamp:', timestamp);

executeSendMessage(sender, recipient, content, timestamp).catch(console.error);
