import { RequestHandler } from 'express';

import User from '@models/user';

export const signup: RequestHandler = async (req, res) => {
	const { username, email, password } = req.body;

	await User.create({ username, email, password });
	res.status(201).send({ message: 'User created!' });
};
