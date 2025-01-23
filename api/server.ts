import cors from 'cors';
import express, { Request, Response, Application } from 'express';
import { prisma } from './db';
import {
	formatPaginatedResponse,
	parsePaginationForQuery,
	parseWhereStatement,
	WhereParam,
	WhereParamTypes,
} from './utils/api-queries';
import { getActiveAddress } from './sui-utils';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
	return res.send({ message: '🚀 API is functional 🚀' });
});

app.get('/messages', async (req, res) => {
	const myAddress = getActiveAddress();

    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { sender: myAddress },
                    { recipient: myAddress },
                ],
            },
        });

        const formattedMessages = messages.map((message) => ({
            sender: message.sender === myAddress ? "sent" : "received",
            text: message.content,
            timestamp: message.timestamp,
        }));

        res.json(formattedMessages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

app.get('/messages/by-sender/:sender', async (req, res) => {
    const { sender } = req.params;
	// const sender = getActiveAddress();

    try {
        const messages = await prisma.message.findMany({
            where: {
                sender,
            },
        });

        const formattedMessages = messages.map((message) => ({
            sender: "sent",
            text: message.content,
            timestamp: message.timestamp,
        }));

        res.json(formattedMessages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

app.get('/messages/by-recipient/:recipient', async (req, res) => {
    const { recipient } = req.params;
	// const recipient = getActiveAddress()

    try {
        const messages = await prisma.message.findMany({
            where: {
                recipient,
            },
        });

        const formattedMessages = messages.map((message) => ({
            sender: "received",
            text: message.content,
            timestamp: message.timestamp,
        }));

        res.json(formattedMessages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

app.get('/messages/with-given-address/:otherAddr', async (req, res) => {
	const myAddress = getActiveAddress();
    const { otherAddr } = req.params

    try {
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { sender: myAddress, recipient: otherAddr },
                    { sender: otherAddr, recipient: myAddress },
                ],
            },
            orderBy: {
                timestamp: 'asc',
            },
        });

        const formattedMessages = messages.map((message) => ({
            sender: message.sender === myAddress ? "sent" : "received",
            text: message.content,
            timestamp: message.timestamp,
        }));

        res.json(formattedMessages);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

app.get('/contacts', async (req, res) => {
    try {
        const myAddress = getActiveAddress()
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { sender: myAddress },
                    { recipient: myAddress },
                ],
            },
        });

        const contactedAddresses = new Set<string | null>();

        messages.forEach((message) => {
            if (message.sender !== myAddress) {
                contactedAddresses.add(message.sender);
            } else if (message.recipient !== myAddress) {
                contactedAddresses.add(message.recipient);
            }
        });

        res.json(Array.from(contactedAddresses));
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Failed to fetch contacted addresses' });
    }
});

app.get('/contacts/metadata', async (req, res) => {
    try {
        const myAddress = getActiveAddress();

        // Fetch all messages involving the current SuiChat user
        const messages = await prisma.message.findMany({
            where: {
                OR: [
                    { sender: myAddress },
                    { recipient: myAddress },
                ],
            },
            orderBy: {
                timestamp: 'desc', // Order by timestamp descending for easy aggregation
            },
        });

        // contactMap will store info about each contact
        // key = contactAddress, value = { mostRecentMessage, timestamp }
        const contactMap: Record<string, { mostRecentMessage: string | null; timestamp: string | null }> = {};

        // Build our map with the first (i.e. most recent) message
        messages.forEach((message) => {
            const otherAddress = message.sender === myAddress ? message.recipient : message.sender;
            if (!otherAddress) return;

            // If we haven't seen this address yet, store the most recent message
            if (!contactMap[otherAddress]) {
                contactMap[otherAddress] = {
                    mostRecentMessage: message.content,
                    timestamp: message.timestamp,
                };
            }
        });

        // Now convert the map to the shape of SidebarConversationParams
        // For now, "name" will be set to the same address string
        const contacts = Object.entries(contactMap).map(([address, { mostRecentMessage, timestamp }]) => {
            let timeString = "";
            if (timestamp) {
                const numericTimestamp = parseInt(timestamp, 10);
                // If it’s valid, convert to local time
                if (!isNaN(numericTimestamp)) {
                    timeString = new Date(numericTimestamp).toLocaleTimeString();
                }
            }

            return {
                address,
                name: address,        // Fill 'name' with 'address' for now
                message: mostRecentMessage || "",
                time: timeString,     // This will be something like '1:30:15 PM'
            };
        });

        res.json(contacts);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});


app.listen(3000, () => console.log(`🚀 Server ready at: http://localhost:3000`));
