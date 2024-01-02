import { RequestHandler } from 'express';

import User from '@models/user';
import EmailVerifcation from '@models/emailVerifcation';
import { SignUpRequest } from '@types';
import { generateToken } from '@utils/helper';

export const signup: RequestHandler = async (req: SignUpRequest, res) => {
	const { username, email, password } = req.body;

	const user = await User.create({ email, username, password });

	const token = generateToken(4);
	await EmailVerifcation.create({ owner: user._id, token });

	res.status(201).json({
		message: 'User created!',
		user: { id: user._id, username, email },
	});
};
