import { SuiClient } from '@mysten/sui.js/client';
import { CONFIG } from '../config';

const client = new SuiClient({
    url: 'https://fullnode.testnet.sui.io:443',
});

// Helper function to decode content array to string
function decodeContent(contentArray: number[]): string {
    return new TextDecoder().decode(new Uint8Array(contentArray));
}

// Helper function to format event data
function formatEvent(event: any) {
    const recipient = event.parsedJson?.recipient || event.recipient;
    
    return {
        sender: event.sender,
        recipient: recipient,
        content: Array.isArray(event.parsedJson?.content) 
            ? decodeContent(event.parsedJson.content)
            : event.parsedJson?.content,
        timestamp: new Date(Number(event.parsedJson?.timestamp)).toISOString(),
        txDigest: event.id?.txDigest
    };
}


async function getEventsByTx(digest: string) {
    const txn = await client.getTransactionBlock({
        digest,
        options: { showEvents: true }
    });
    console.log('Events from transaction:');
    txn.events?.forEach(event => {
        console.log(formatEvent(event));
    });
}

async function getEventsBySender(sender: string) {
    const events = await client.queryEvents({
        query: { Sender: sender }
    });
    console.log('\nEvents from sender:');
    events.data.forEach(event => {
        console.log(formatEvent(event));
    });
}

async function getEventsByModule() {
    const events = await client.queryEvents({
        query: {
            MoveModule: {
                package: CONFIG.MESSAGE_CONTRACT.packageId,
                module: 'send_message'
            }
        }
    });
    console.log('\nEvents from module:');
    events.data.forEach(event => {
        console.log(formatEvent(event));
    });
}

async function getEventsByType() {
    const events = await client.queryEvents({
        query: {
            MoveEventType: `${CONFIG.MESSAGE_CONTRACT.packageId}::send_message::MessageCreated`
        }
    });
    console.log('\nEvents by type:');
    events.data.forEach(event => {
        console.log(formatEvent(event));
    });
}

async function main() {
    const txDigest = '5aovPbd3CzWw7hfGnVxDEBx7o1PexgCBGuSKVU5JDvRn';
    
    await getEventsByTx(txDigest);
    await getEventsBySender('0x1e331d6468eaea0ccd10d3a4a9a9530a0318545c90d0ad9594ddfa27870ff4da');
    await getEventsByModule();
    await getEventsByType();
}

main().catch(console.error);
