import { EventId, SuiClient, SuiEvent, SuiEventFilter } from '@mysten/sui/client';
import { CONFIG } from './config';
import { Prisma } from '@prisma/client';
import { prisma } from './db';
import { getClient } from './sui-utils';

type SuiEventsCursor = EventId | null | undefined;

type MessageCreatedEvent = {
    sender: string;
    recipient: string;
    message_id: string;
    content: Uint8Array;
    timestamp: number;
}

type EventTracker = {
    type: string;
    filter: SuiEventFilter;
    callback: (events: SuiEvent[], type: string) => any;
};

const handleMessageCreated = async (events: SuiEvent[], type: string) => {
    // events.forEach(event => {
    //     const { sender, recipient, content, timestamp } = event.parsedJson as MessageCreatedEvent;
    //     console.log(`New message from ${sender} to ${recipient}: ${new TextDecoder().decode(content)} at ${timestamp}`);
    // });

    // // const updates: Record<string, MessageCreateInput> = {};

	// // for (const event of events) {
	// // 	if (!event.type.startsWith(type)) throw new Error('Invalid event module origin');
	// // 	// const data = event.parsedJson as MessageCreatedEvent;

	// // 	// if (!Object.hasOwn(updates, data.escrow_id)) {
	// // 	// 	updates[data.escrow_id] = {
	// // 	// 		objectId: data.escrow_id,
	// // 	// 	};
	// // 	// }

	// // 	// const creationData = event.parsedJson as MessageCreatedEvent;

	// // 	// // Handle creation event
	// // 	// updates[creationData.message_id].sender = creationData.sender;
	// // 	// updates[creationData.message_id].recipient = creationData.recipient;
	// // 	// updates[creationData.message_id].content = creationData.content;
	// // 	// updates[creationData.message_id].timestamp = creationData.timestamp;
	// // }

    // const promises = Object.values(updates).map((update) =>
	// 	prisma.escrow.upsert({
	// 		where: {
	// 			objectId: update.objectId,
	// 		},
	// 		create: update,
	// 		update,
	// 	}),
	// );
	// await Promise.all(promises);

    // Loop through each event and process it individually
    const promises = events.map(async (event) => {
        const { sender, recipient, message_id, content, timestamp } = event.parsedJson as MessageCreatedEvent;

        console.log(`New message from ${sender} to ${recipient}: ${new TextDecoder().decode(content)} at ${timestamp}`);

        // Convert Uint8Array content to Buffer
        const contentBuffer = Buffer.from(content);

        // Upsert the message into the `message` table
        await prisma.message.upsert({
            where: {
                message_id: message_id, // Use `message_id` as the unique identifier
            },
            create: {
                sender,
                recipient,
                message_id: message_id, // Ensure message_id is stored to avoid duplicates
                content: contentBuffer,
                timestamp,
            },
            update: {
                content: contentBuffer,
                timestamp,
            },
        });
    });

    // Await all upsert promises to complete
    await Promise.all(promises);
};

const EVENTS_TO_TRACK: EventTracker[] = [
    {
        type: `${CONFIG.MESSAGE_CONTRACT.packageId}::send_message`, // Adjust package name
        filter: {
            MoveEventModule: {
                module: 'message_platform',
                package: CONFIG.MESSAGE_CONTRACT, // package ID
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
) => {
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

// Setup the listeners
export const setupListeners = async () => {
    const client = getClient(CONFIG.NETWORK); // Adjust based on your client setup
    for (const event of EVENTS_TO_TRACK) {
        runEventJob(client, event, null); // Start with a null cursor
    }
};
