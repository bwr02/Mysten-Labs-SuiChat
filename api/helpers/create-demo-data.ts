import { Transaction } from '@mysten/sui/transactions';
import { TransactionBlock } from '@mysten/sui.js/transactions';
import { CONFIG } from '../config';
import { ACTIVE_NETWORK, getActiveAddress, signAndExecute } from '../sui-utils';

// A simple example of creating and sending messages.
const createDemoMessages = async (totalMessages: number) => {
  const txb = new TransactionBlock();
  const toSend = [];

  txb.setGasBudget(100000000);

  // Use this address to send messages to
  const recipient = "0xCAFE"; // Replace with the actual recipient address

  for (let i = 0; i < totalMessages; i++) {
    const sender = getActiveAddress(); // Sender address from the context

    // You can vary the message content
    const content = `Message #${i + 1}`; // Custom message content (can be dynamic)

    // Generate a timestamp for the message
    const timestamp = Date.now();

    // Call send_message from the message_platform package
    const messageCall = txb.moveCall({
      target: `${CONFIG.MESSAGE_CONTRACT.packageId}::send_message::send_message`,
      arguments: [
        txb.pure(sender),
        txb.pure(recipient),
        txb.pure(content), // Convert the content to vector<u8>
        txb.pure(BigInt(timestamp)),
      ],
    });

    toSend.push(messageCall);
  }

  // No objects to transfer in this case, so we won't use transferObjects
  const res = await signAndExecute(txb, ACTIVE_NETWORK);

  if (!res.objectChanges || res.objectChanges.length === 0)
    throw new Error('Something went wrong while sending messages.');

  console.log('Successfully sent demo messages.');
};

createDemoMessages(1);
