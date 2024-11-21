import { Transaction } from '@mysten/sui/transactions';
import { suiClient } from '../suiClient';
import { Ed25519Keypair } from '@mysten/sui/keypairs/ed25519';
import { CONFIG } from '../config';
import { checkBalance } from './walletService';
import { normalizeSuiAddress } from '@mysten/sui/utils';
import { bcs } from '@mysten/sui/bcs';
import { encryptMessage, decryptMessage, generateKeyPair } from '../../../../encryption/src/encryptUtils.ts';


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

        // Check balance first
        const balanceInfo = await checkBalance(normalizedSenderAddress);
        if (BigInt(balanceInfo.totalBalance) === BigInt(0)) {
            throw new Error('No balance available. Please request tokens from the faucet.');
        }

        if (balanceInfo.coins.length === 0) {
            throw new Error('No coin objects found. Please request tokens from the faucet.');
        }

        // Prepare message content
        const timestamp = Date.now();

        // Create transaction
        const tx = new Transaction();

        // TODO: this needs to be done somewhere else so that it is only intizalied once....right now I do it here just for the purposes of showing that we can encrypt it this way
        const {publicKey, privateKey} = generateKeyPair();

        // TODO: will look into this being a publicReciever + privateSender encryption scheme
        const encryptedContent = encryptMessage(content, publicKey.toString());
        console.log("ENCRYPTED:" + encryptedContent);
        
        tx.moveCall({
            target: `${CONFIG.MESSAGE_CONTRACT.packageId}::send_message::send_message`,
            arguments: [
                tx.pure(bcs.Address.serialize(senderAddress)),
                tx.pure(bcs.Address.serialize(recipientAddress)),
                tx.pure(bcs.String.serialize(encryptedContent)),
                tx.pure(bcs.U64.serialize(timestamp))
            ],
        });

        // TODO: take out this decryption later....this is for testing purposes to ensure that the encrypted message that is sent can be decrypted proeprly
        const decryptedContent = decryptMessage(encryptedContent, privateKey.toString());
        console.log("DECRYPTED:" + decryptedContent);

        // Execute transaction
        const result = await suiClient.signAndExecuteTransaction({
            transaction: tx,
            signer: keypair,
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