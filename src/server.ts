import express, { Express } from 'express';
import 'dotenv/config';
import '@db';

import { authRouter, profileRouter } from '@routers';

const server: Express = express();

server.use(express.json());
server.use(express.urlencoded({ extended: false }));

server.use('/api/v1/users/auth', authRouter);
server.use('/api/v1/profile', profileRouter);

export default server;
