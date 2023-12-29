import express, { Express, Request, Response } from 'express';
import 'dotenv/config';

const server: Express = express();

server.post('/api/v1/users', (req: Request, res: Response) => {
	res.send();
});

export default server;
