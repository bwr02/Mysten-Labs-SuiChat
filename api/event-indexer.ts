import { EventId, SuiEvent, SuiEventFilter } from '@mysten/sui/client';
import { SuiClient } from '@mysten/sui/client';
import { CONFIG } from './config';
import { Prisma } from '@prisma/client';
import { prisma } from './db';
import { getClient } from './sui-utils';
import  { getActiveAddress } from './utils/activeAddressManager';
import { WebSocketServer } from "ws"

var id_cur = Number(1);

type SuiEventsCursor = EventId | null | undefined;

type MessageCreatedEvent = {
    sender: string;
    recipient: string;
    // message_id: string;
    content: Uint8Array;
    timestamp: string;
}

type MessageCreatedInput = {
    sender: string;
    recipient: string;
    // message_id: string;
    content: string;
    timestamp: string;
}

type EventExecutionResult = {
	cursor: SuiEventsCursor;
	hasNextPage: boolean;
};

type EventTracker = {
    type: string;
    filter: SuiEventFilter;
    callback: (events: SuiEvent[], type: string) => any;
};

// Initialize a WebSocket server (if not already done)
const wss = new WebSocketServer({ port: 8080 });

// Function to broadcast messages to all connected clients
const broadcastMessage = (data: object) => {
    wss.clients.forEach((client) => {
        if (client.readyState === client.OPEN) {
            client.send(JSON.stringify(data));
        }
    });
};

const handleMessageCreated = async (events: SuiEvent[], type: string) => {
    const updates: MessageCreatedInput[] = []; // Use an array instead of an object keyed by message_id

    for (const event of events) {
        // console.log("event");
        const creationData = event.parsedJson as MessageCreatedEvent;
        if((creationData.sender == getActiveAddress() || creationData.recipient == getActiveAddress())&& Number(creationData.timestamp) > 1739317580112){
            updates.push({
                sender: creationData.sender,
                recipient: creationData.recipient,
                content: new TextDecoder().decode(new Uint8Array(creationData.content)),
                timestamp: creationData.timestamp
            });
        }
        else{
            continue;
        }
    }

    const promises = updates.map(async (update, index) => {
        const suiEvent = events[index];
        const result = await prisma.message.upsert({
            where: {
                txDigest: suiEvent.id.txDigest,  // Use the event's txDigest as the primary key
            },
            create: {
                txDigest: suiEvent.id.txDigest,  // Add txDigest to the create
                ...update,
            },
            update,
        });

        // Broadcast the message to ws after a successful upsert
        broadcastMessage({
            type: 'new-message',
            message: {
                messageType: result.sender === getActiveAddress() ? "sent" : "received",
                sender: result.sender,
                recipient: result.recipient,
                text: result.content,
                timestamp: result.timestamp,
                txDigest: result.txDigest,
            },
        });
        return result;
    });

    id_cur = id_cur +1;

    await Promise.all(promises);
};


const EVENTS_TO_TRACK: EventTracker[] = [
    {
        type: `${CONFIG.MESSAGE_CONTRACT.packageId}::send_message`, // Adjust package name
        filter: {
            MoveEventModule: {
                module: 'send_message',
                package: CONFIG.MESSAGE_CONTRACT.packageId, // package ID
            },
        },
        callback: handleMessageCreated, // Function to handle the event
    },
];


// Function to execute the event job
const executeEventJob = async (
    client: SuiClient,
    tracker: EventTracker,
    cursor: SuiEventsCursor,
): Promise<EventExecutionResult> => {
    try {
        const { data, hasNextPage, nextCursor } = await client.queryEvents({
            query: tracker.filter,
            cursor,
            order: 'ascending',
        });

        // Call the callback to process the events
        await tracker.callback(data, tracker.type);

        if (nextCursor && data.length > 0) {
			await saveLatestCursor(tracker, nextCursor);

			return {
				cursor: nextCursor,
				hasNextPage,
			};
		}
    } catch (e) {
        console.error(e);
    }

    return {
        cursor,
        hasNextPage: false,
    };
};

// Function to run the event job
const runEventJob = async (client: SuiClient, tracker: EventTracker, cursor: SuiEventsCursor) => {
	const result = await executeEventJob(client, tracker, cursor);

	// Trigger a timeout. Depending on the result, we either wait 0ms or the polling interval.
	setTimeout(
		() => {
			runEventJob(client, tracker, result.cursor);
		},
		result.hasNextPage ? 0 : CONFIG.POLLING_INTERVAL_MS,
	);
};

/**
 * Gets the latest cursor for an event tracker, either from the DB (if it's undefined)
 *  or from the running cursors.
 */
const getLatestCursor = async (tracker: EventTracker) => {
	const cursor = await prisma.cursor.findUnique({
		where: {
			id: tracker.type,
		},
	});

	return cursor || undefined;
};

const saveLatestCursor = async (tracker: EventTracker, cursor: EventId) => {
	const data = {
		eventSeq: cursor.eventSeq,
		txDigest: cursor.txDigest,
	};

	return prisma.cursor.upsert({
		where: {
			id: tracker.type,
		},
		update: data,
		create: { id: tracker.type, ...data },
	});
};

// // Setup the listeners
// export const setupListeners = async () => {
//     const client = getClient(CONFIG.NETWORK); // Adjust based on your client setup
//     for (const event of EVENTS_TO_TRACK) {
//         runEventJob(client, event, null); // Start with a null cursor
//     }
// };

export const setupListeners = async () => {
    // Wait until getActiveAddress() returns a non-empty value.
    while (!getActiveAddress()) {
        // console.log("Waiting for active address to be set...");
        // console.log(getActiveAddress());
        await new Promise((resolve) => setTimeout(resolve, 1000)); // wait 1 second before retrying
    }

    for (const event of EVENTS_TO_TRACK) {
		runEventJob(getClient(CONFIG.NETWORK), event, await getLatestCursor(event));
	}
};