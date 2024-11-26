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


app.listen(3000, () => console.log(`🚀 Server ready at: http://localhost:3000`));
