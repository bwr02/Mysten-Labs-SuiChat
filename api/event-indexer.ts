import { EventId, SuiClient, SuiEvent, SuiEventFilter } from '@mysten/sui/client';
import { CONFIG } from './config';
import { Prisma } from '@prisma/client';
import { prisma } from './db';
import { getClient } from './sui-utils';

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

// const handleMessageCreated = async (events: SuiEvent[], type: string) => {
//     // events.forEach(event => {
//     //     const { sender, recipient, message_id, content, timestamp } = event.parsedJson as MessageCreatedEvent;
//     //     // console.log(`New message from ${sender} to ${recipient}: ${new TextDecoder().decode(content)} at ${timestamp}`);
//     // });

//     const updates: Record<string, MessageCreatedInput> = {};

// 	for (const event of events) {
// 		// if (!event.type.startsWith(type)) throw new Error('Invalid event module origin');
// 		// const data = event.parsedJson as MessageCreatedEvent;

// 		// if (!Object.hasOwn(updates, data.message_id)) {
// 		// 	updates[data.message_id] = {
// 		// 		message_id: data.message_id,
// 		// 	};
// 		// }

// 		const creationData = event.parsedJson as MessageCreatedEvent;
//         console.log(creationData.content);
//         console.log(new TextDecoder().decode(new Uint8Array(creationData.content)));
//         console.log(creationData.message_id);

//         // Convert Uint8Array content to Buffer
//         // const contentBuffer = Buffer.from(creationData.content);

// 		// Handle creation event
// 		updates[creationData.message_id].sender = creationData.sender;
// 		updates[creationData.message_id].recipient = creationData.recipient;
// 		updates[creationData.message_id].content = new TextDecoder().decode(new Uint8Array(creationData.content));
// 		updates[creationData.message_id].timestamp = creationData.timestamp;

//         console.log(updates)
// 	}

//     const promises = Object.values(updates).map((update) =>
// 		prisma.message.upsert({
// 			where: {
// 				message_id: update.message_id,
// 			},
// 			create: update,
// 			update,
// 		}),
// 	);
// 	await Promise.all(promises);

//     // // Loop through each event and process it individually
//     // const promises = events.map(async (event) => {
//     //     const { sender, recipient, message_id, content, timestamp } = event.parsedJson as MessageCreatedEvent;

//     //     console.log(`New message from ${sender} to ${recipient}: ${new TextDecoder().decode(content)} at ${timestamp}`);

//     //     // Convert Uint8Array content to Buffer
//     //     const contentBuffer = Buffer.from(content);

//     //     // Upsert the message into the `message` table
//     //     await prisma.message.upsert({
//     //         where: {
//     //             message_id: message_id, // Use `message_id` as the unique identifier
//     //         },
//     //         create: {
//     //             sender,
//     //             recipient,
//     //             message_id: message_id, // Ensure message_id is stored to avoid duplicates
//     //             content: contentBuffer,
//     //             timestamp,
//     //         },
//     //         update: {
//     //             content: contentBuffer,
//     //             timestamp,
//     //         },
//     //     });
//     // });

//     // // Await all upsert promises to complete
//     // await Promise.all(promises);
// };

const handleMessageCreated = async (events: SuiEvent[], type: string) => {
    const updates: MessageCreatedInput[] = []; // Use an array instead of an object keyed by message_id

    for (const event of events) {
        const creationData = event.parsedJson as MessageCreatedEvent;
        
        updates.push({
            sender: creationData.sender,
            recipient: creationData.recipient,
            content: new TextDecoder().decode(new Uint8Array(creationData.content)),
            timestamp: creationData.timestamp
        });
    }

    // Iterate over the updates without needing message_id for `upsert`
    const promises = updates.map((update) =>
        prisma.message.upsert({
            where: {
                id: id_cur,
                sender: update.sender, // Use a unique combination to upsert without message_id
                recipient: update.recipient,
                timestamp: update.timestamp
            },
            create: update,
            update,
        })
    );

    id_cur = id_cur +1;

    await Promise.all(promises);
};


const EVENTS_TO_TRACK: EventTracker[] = [
    {
        type: `${CONFIG.MESSAGE_CONTRACT.packageId}::send_message`, // Adjust package name
        filter: {
            MoveEventModule: {
                module: 'message_platform',
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
	for (const event of EVENTS_TO_TRACK) {
		runEventJob(getClient(CONFIG.NETWORK), event, await getLatestCursor(event));
	}
};