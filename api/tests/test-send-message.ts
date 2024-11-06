import { SuiClient, SuiTransactionBlock } from '@mysten/sui/client';

const client = new SuiClient(/* config */);

async function executeSendMessage(sender: string, recipient: string, content: Uint8Array, timestamp: number) {
    const transaction = new SuiTransactionBlock();

    // Add transaction details
    transaction.moveCall({
        target: "<PACKAGE_ID>::send_message::send_message",
        arguments: [sender, recipient, content, timestamp],
    });

    const serializedTransaction = transaction.serialize();
    const signature = /* */;

    const response = await client.executeTransactionBlock({
        transactionBlock: serializedTransaction,
        signature,
        options: { showEffects: true }
    });

    console.log("Transaction response:", response);
}

executeSendMessage(sender, recipient, content, timestamp).catch(console.error);
