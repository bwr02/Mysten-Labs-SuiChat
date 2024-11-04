import { EventId, SuiClient, SuiEvent, SuiEventFilter } from '@mysten/sui/client';
import { CONFIG } from './config';
import { getClient } from './sui-utils';

type SuiEventsCursor = EventId | null | undefined;

interface MessageCreatedEvent {
    sender: string;
    recipient: string;
    content: Uint8Array;
    timestamp: number;
}

type EventTracker = {
    type: string;
    filter: SuiEventFilter;
    callback: (events: SuiEvent[]) => void;
};

const handleMessageCreated = (events: SuiEvent[]) => {
    events.forEach(event => {
        const { sender, recipient, content, timestamp } = event.parsedJson as MessageCreatedEvent;
        console.log(`New message from ${sender} to ${recipient}: ${new TextDecoder().decode(content)} at ${timestamp}`);
    });
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
