import { Transaction } from '@mysten/sui/transactions';
import { CONFIG } from '../config';
import { checkBalance } from './walletService';
import { normalizeSuiAddress } from '@mysten/sui/utils';
import { bcs } from '@mysten/sui/bcs';
import { generateSharedSecret, encryptMessage } from './cryptoService';
import { WalletContextState } from '@suiet/wallet-kit';

export interface SendMessageParams {
    senderAddress: string;
    recipientAddress: string;
    content: string;
    signature: string;
}

export const sendMessage = async ({
    senderAddress,
    recipientAddress,
    content,
    signature,
    wallet
}: SendMessageParams & { wallet: WalletContextState }) => {
    try {
        const normalizedSenderAddress = normalizeSuiAddress(senderAddress);
        const balanceInfo = await checkBalance(normalizedSenderAddress);
        if (BigInt(balanceInfo.totalBalance) === BigInt(0) || balanceInfo.coins.length === 0) {
            throw new Error('Insufficient balance. Please request tokens from the faucet.');
        }

        //const tempPrivKey = deriveKeyFromSignature(signature);
        const publicKeyRecipient = new Uint8Array([56, 247, 185, 182, 151, 92, 228, 128, 74, 42, 5, 115, 70, 10, 122, 232, 88, 72, 237, 29, 85, 42, 129, 4, 174, 69, 44, 126, 186, 219, 10, 81]);
        const sharedSecret = await generateSharedSecret(publicKeyRecipient, signature);
        //const sharedSecret = generateSharedSecret(tempPrivKey, recipientAddress);
        console.log("SENDER SHARED SECRET: " + sharedSecret);
        const encryptedContent = encryptMessage(content, sharedSecret);
        const tx = new Transaction();
        const timestamp = Date.now();
        
        tx.moveCall({
            target: `${CONFIG.MESSAGE_CONTRACT.packageId}::send_message::send_message`,
            arguments: [
                tx.pure(bcs.Address.serialize(senderAddress)),
                tx.pure(bcs.Address.serialize(recipientAddress)),
                tx.pure(bcs.String.serialize(encryptedContent)),
                tx.pure(bcs.U64.serialize(timestamp))
            ],
        });

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