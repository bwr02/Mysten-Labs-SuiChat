// Import necessary modules from the Sui SDK
const { JsonRpcProvider, Ed25519Keypair, RawSigner, Connection } = require('@mysten/sui.js');
const crypto = require('crypto');  // For hashing
const { create } = require('ipfs-http-client');  // For IPFS storage (optional)

// Connect to the Sui testnet or devnet
const provider = new JsonRpcProvider(
    new Connection({
        fullnode: 'https://fullnode.testnet.sui.io:443'
    })
);

// Initialize a new keypair and signer for the sender
const keypair = Ed25519Keypair.generate();
const signer = new RawSigner(keypair, provider);

// Function to hash message content (optional)
function hashContent(content) {
    return crypto.createHash('sha256').update(content).digest('hex');
}

// Function to send a message by calling the create_message function in the Move module
async function sendMessage(sender, receiver, content) {
    
    const timestamp = Date.now();  // Get current timestamp
    console.log("1");
    try {
        console.log("2");
        const tx = await signer.executeMoveCall({
            packageObjectId: '0x99cbe924a3b83471042316e5310695064cfbf69c542891d4ed5266e91d416674',  // Replace with your deployed package ID
            module: 'cleartext',                   // Your Move module name
            function: 'create_message',            // Function to emit the message
            typeArguments: [],
            arguments: [
                sender,                            // Sender's address
                receiver,                          // Receiver's address
                Array.from(Buffer.from(content)),  // Convert content to byte array
                timestamp
            ],
            gasBudget: 1000
        });

        console.log('Message sent successfully:', tx);
    } catch (error) {
        console.error('Error sending message:', error);
    }
}

// Example usage of sendMessage
sendMessage(
    '0xead9730505ed43cdff03f88f5742e48b730c9bcd3a151a21fd35051c9c34a86e', '0xead9730505ed43cdff03f88f5742e48b730c9bcd3a151a21fd35051c9c34a86e', 'Hello, this is a test message!'
);

// Function to listen for messages directed at a specific receiver
async function listenForMessages(receiverAddress) {
    console.log("3");
    // Poll or use a subscription to listen for message events
    const events = await provider.getEvents({
        query: {
            MoveEventType: '0x99cbe924a3b83471042316e5310695064cfbf69c542891d4ed5266e91d416674::cleartext::Message'  // Replace with package and module names
        },
        descending_order: true,
        limit: 10
    });
    console.log("4");

    // Filter events where the receiver matches receiverAddress
    const messages = events.data.filter(event => event.receiver === receiverAddress);
    console.log("5");
    messages.forEach(event => {
        const { sender, content, timestamp } = event;
        const messageContent = Buffer.from(content).toString();  // Convert byte array to string
        console.log(`New message from ${sender} at ${timestamp}: ${messageContent}`);
    });
    console.log("6");
}

// Example usage of listenForMessages
listenForMessages('0xead9730505ed43cdff03f88f5742e48b730c9bcd3a151a21fd35051c9c34a86e');
