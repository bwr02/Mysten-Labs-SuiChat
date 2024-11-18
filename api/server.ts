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

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', async (req, res) => {
	return res.send({ message: '🚀 API is functional 🚀' });
});

app.get('/messages', async (req, res) => {
	const acceptedQueries: WhereParam[] = [
		{ key: 'sender', type: WhereParamTypes.STRING },
		{ key: 'recipient', type: WhereParamTypes.STRING },
	];

	try {
		const messages = await prisma.message.findMany({
			where: parseWhereStatement(req.query, acceptedQueries)!,
			...parsePaginationForQuery(req.query),
		});

		return res.send(formatPaginatedResponse(messages));
	} catch (e) {
		console.error(e);
		return res.status(400).send({ e });
	}
});

app.listen(3000, () => console.log(`🚀 Server ready at: http://localhost:3000`));
