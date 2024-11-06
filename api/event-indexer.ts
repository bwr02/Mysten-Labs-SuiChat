import { EventId, SuiClient, SuiEvent, SuiEventFilter } from '@mysten/sui/client';
import { CONFIG } from './config';
import { Prisma } from '@prisma/client';
import { prisma } from './db';
import { getClient } from './sui-utils';

type SuiEventsCursor = EventId | null | undefined;

type MessageCreatedEvent {
    sender: string;
    recipient: string;
    message_id: string;
    content: Uint8Array;
    timestamp: number;
}

type MessageCreateInput = {
    sender: string;
    recipient: string;
    content: Uint8Array;
    timestamp: number;
}

type EventTracker = {
    type: string;
    filter: SuiEventFilter;
    callback: (events: SuiEvent[], type: string) => any;
};

const handleMessageCreated = async (events: SuiEvent[], type: string) => {
    events.forEach(event => {
        const { sender, recipient, content, timestamp } = event.parsedJson as MessageCreatedEvent;
        console.log(`New message from ${sender} to ${recipient}: ${new TextDecoder().decode(content)} at ${timestamp}`);
    });

    const updates: Record<string, MessageCreateInput> = {};

	for (const event of events) {
		if (!event.type.startsWith(type)) throw new Error('Invalid event module origin');
		// const data = event.parsedJson as MessageCreatedEvent;

		// if (!Object.hasOwn(updates, data.escrow_id)) {
		// 	updates[data.escrow_id] = {
		// 		objectId: data.escrow_id,
		// 	};
		// }

		const creationData = event.parsedJson as MessageCreatedEvent;

		// Handle creation event
		updates[creationData.message_id].sender = creationData.sender;
		updates[creationData.message_id].recipient = creationData.recipient;
		updates[creationData.message_id].content = creationData.content;
		updates[creationData.message_id].timestamp = creationData.timestamp;
	}

    const promises = Object.values(updates).map((update) =>
		prisma.escrow.upsert({
			where: {
				objectId: update.objectId,
			},
			create: update,
			update,
		}),
	);
	await Promise.all(promises);
};

const EVENTS_TO_TRACK: EventTracker[] = [
    {
        type: 'your_package_name::message_platform::MessageCreated', // Adjust package name
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
        await tracker.callback(data);

        return {
            cursor: nextCursor,
            hasNextPage,
        };
    } catch (e) {
        console.error(e);
        return {
            cursor,
            hasNextPage: false,
        };
    }
};

// Function to run the event job
const runEventJob = async (client: SuiClient, tracker: EventTracker, cursor: SuiEventsCursor) => {
    const result = await executeEventJob(client, tracker, cursor);

    setTimeout(() => {
        runEventJob(client, tracker, result.cursor);
    }, result.hasNextPage ? 0 : 1000); // Poll every second if there's no new data
};

// Setup the listeners
export const setupListeners = async () => {
    const client = getClient(CONFIG.NETWORK); // Adjust based on your client setup
    for (const event of EVENTS_TO_TRACK) {
        runEventJob(client, event, null); // Start with a null cursor
    }
};
