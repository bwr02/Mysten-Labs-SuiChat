import { Transaction } from '@mysten/sui/transactions';
import { suiClient } from './suiClient';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { CONFIG } from './config';
import { checkBalance } from './walletService';
import { normalizeSuiAddress } from '@mysten/sui/utils';

export const encoder = new TextEncoder();

export function bigintToUint8Array(value: bigint): Uint8Array {
    const byteLength = Math.ceil(value.toString(2).length / 8); // Calculate required byte length
    const uint8Array = new Uint8Array(byteLength);

    for (let i = 0; i < byteLength; i++) {
        uint8Array[byteLength - i - 1] = Number(value & BigInt(0xff)); // Extract the last byte
        value >>= BigInt(8); // Shift the bigint 8 bits to the right
    }

    return uint8Array;
}

export interface SendMessageParams {
    senderAddress: string;
    recipientAddress: string;
    content: string;
    keypair: Ed25519Keypair;
}


export const sendMessage = async ({
    senderAddress,
    recipientAddress,
    content,
    keypair
}: SendMessageParams) => {
    try {
        // Normalize addresses
        const normalizedSenderAddress = normalizeSuiAddress(senderAddress);
        const normalizedRecipientAddress = normalizeSuiAddress(recipientAddress);

        // Check balance first
        const balanceInfo = await checkBalance(normalizedSenderAddress);
        if (BigInt(balanceInfo.totalBalance) === BigInt(0)) {
            throw new Error('No balance available. Please request tokens from the faucet.');
        }

        if (balanceInfo.coins.length === 0) {
            throw new Error('No coin objects found. Please request tokens from the faucet.');
        }

        // Prepare message content
        const encodedContent = new TextEncoder().encode(content);
        const timestamp = Date.now();

        // Create transaction
        const tx = new Transaction();
        
        tx.moveCall({
            target: `${CONFIG.MESSAGE_CONTRACT.packageId}::send_message::send_message`,
            arguments: [
                tx.pure(encoder.encode(normalizedSenderAddress)),
                tx.pure(encoder.encode(normalizedRecipientAddress)),
                tx.pure(encodedContent),
                tx.pure(bigintToUint8Array(BigInt(timestamp)))
            ],
        });

        // Execute transaction
        const result = await suiClient.signAndExecuteTransaction({
            signer: keypair,
            transaction: tx,
            options: {
                showEvents: true,
                showEffects: true,
            },
        });

        return {
            success: true,
            txId: result.digest,
            timestamp,
            result
        };
    } catch (error) {
        console.error("Failed to send message:", error);
        throw error;
    }
};