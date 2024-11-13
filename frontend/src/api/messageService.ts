import { TransactionBlock } from '@mysten/sui.js/transactions';
import { suiClient } from './suiClient';
import { Ed25519Keypair } from '@mysten/sui.js/keypairs/ed25519';
import { CONFIG } from './config';
import { checkBalance } from './walletService';
import { normalizeSuiAddress } from '@mysten/sui.js/utils';

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
        const tx = new TransactionBlock();
        
        tx.moveCall({
            target: `${CONFIG.MESSAGE_CONTRACT.packageId}::messenger::send_message`,
            arguments: [
                tx.pure(normalizedSenderAddress),
                tx.pure(normalizedRecipientAddress),
                tx.pure(Array.from(encodedContent)),
                tx.pure(BigInt(timestamp))
            ],
        });

        // Execute transaction
        const result = await suiClient.signAndExecuteTransactionBlock({
            signer: keypair,
            transactionBlock: tx,
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