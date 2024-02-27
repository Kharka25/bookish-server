import express, { Express } from 'express';
import 'dotenv/config';
import '@db';

import { authRouter } from '@routers';

const server: Express = express();

server.use(express.json());
server.use(express.urlencoded({ extended: false }));

server.use('/api/v1/users/auth', authRouter);

export default server;
