import { SuiClient, SuiClientOptions } from '@mysten/sui/client';

const options: SuiClientOptions = {
    url: "https://fullnode.testnet.sui.io:443",
};

const client = new SuiClient(options);

async function queryMessageEvents() {
    const response = await client.queryEvents({
        filter: {
            MoveModule: {
                package: "<YOUR_PACKAGE_ID>", 
                module: "send_message",
            }
        },
        options: { limit: 10 }
    });

    console.log("MessageCreated events:", response.data);
}

// Call the function to test the query
queryMessageEvents().catch(console.error);
