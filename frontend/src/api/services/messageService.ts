import {Transaction} from '@mysten/sui/transactions';
import {CONFIG} from '../config';
import {checkBalance} from './walletService';
import {normalizeSuiAddress} from '@mysten/sui/utils';
import {bcs} from '@mysten/sui/bcs';
import {prepareEncryptedMessage} from './cryptoService';
import {WalletContextState} from '@suiet/wallet-kit';
import {SendMessageParams} from "@/types/types.ts";

function createSendMessageTransaction(senderAddress: string, recipientAddress: string, encryptedContent: string, timestamp: number): Transaction {
    const tx = new Transaction();
    tx.moveCall({
        target: `${CONFIG.MESSAGE_CONTRACT.packageId}::send_message::send_message`,
        arguments: [
            tx.pure(bcs.Address.serialize(senderAddress)),
            tx.pure(bcs.Address.serialize(recipientAddress)),
            tx.pure(bcs.String.serialize(encryptedContent)),
            tx.pure(bcs.U64.serialize(timestamp))
        ],
    });
    return tx;
}

export const sendMessage = async ({
    senderAddress,
    recipientAddress,
    recipientPubKey,
    message,
    wallet
}: SendMessageParams & { wallet: WalletContextState }) => {
    try {
        const normalizedSenderAddress = normalizeSuiAddress(senderAddress);
        // check if sender has enough balance
        await checkBalance(normalizedSenderAddress); 
        // get temp priv key, generate shared secret, encrypt message
        const encryptedContent = await prepareEncryptedMessage(message, recipientPubKey); 
        // create transaction with encrypted message
        const timestamp = Date.now();
        const tx = createSendMessageTransaction(normalizedSenderAddress, recipientAddress, encryptedContent, timestamp);
        // sign transaction and execute on chain
        const result = await wallet.signAndExecuteTransaction({
            transaction: tx,
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

export function formatTimestamp(timestamp: string): string {
    let timeString = "";
        if(timestamp) {
            const numericTimestamp = parseInt(timestamp, 10);
            if (!isNaN(numericTimestamp)) {
                const messageDate = new Date(numericTimestamp);
                const currentDate = new Date();

                // Calculate the difference in milliseconds
                const msDifference = currentDate.getTime() - messageDate.getTime();
                const hoursDifference = msDifference / (1000 * 60 * 60);
                const daysDifference = msDifference / (1000 * 60 * 60 * 24);

                if (messageDate.toDateString() === currentDate.toDateString()) {
                    // Same day, show time
                    timeString = messageDate.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
                } else if (daysDifference < 2 && messageDate.getDate() === currentDate.getDate() - 1) {
                    // Yesterday, show "Yesterday"
                    timeString = "Yesterday";
                } else if (daysDifference < 7) {
                    // Within a week, show day of the week (e.g., "Mon")
                    timeString = messageDate.toLocaleDateString(undefined, {
                        weekday: 'short',
                    });
                } else {
                    // More than a week ago, show date (e.g., "Feb 10")
                    timeString = messageDate.toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                    });
                }
            }
        }
    return timeString;
}