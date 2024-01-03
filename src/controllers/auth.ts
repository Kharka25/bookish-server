import { RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';

import User from '@models/user';
import EmailVerifcation from '@models/emailVerifcation';
import { SignUpRequest, VerifyEmailRequest } from '@types';
import { generateToken, sendAccountActivationEmail } from '@utils/helper';

export const signup: RequestHandler = async (req: SignUpRequest, res) => {
	const { username, email, password } = req.body;

	const token = generateToken(4);

	const user = await User.create({
		email,
		username,
		password,
		activationToken: token,
	});

	await EmailVerifcation.create({ owner: user._id, token });

	try {
		await sendAccountActivationEmail(email, token);

		res.status(201).json({
			message: 'User created!',
			user: { id: user._id, username, email },
		});
	} catch (error) {
		await User.findOneAndDelete({ email });
		res.status(502).send({ message: 'Account Activation Email failure' });
	}
};

export const verifyEmail: RequestHandler = async (
	req: VerifyEmailRequest,
	res
) => {
	const { token, userId } = req.body;

	const verificationToken = await EmailVerifcation.findOne({ owner: userId });

	if (!verificationToken)
		return res.status(403).json({ error: 'Invalid token' });

	const matchedToken = await verificationToken.compareToken(token);
	if (!matchedToken) return res.status(403).json({ error: 'Invalid token' });

	await User.findByIdAndUpdate(userId, {
		verified: true,
		activationToken: null,
	});

	await EmailVerifcation.findByIdAndDelete(verificationToken._id);

	res.status(201).json({ message: 'Email verification successful' });
};

export const resendVerificationToken: RequestHandler = async (req, res) => {
	const { userId } = req.body;

	if (!isValidObjectId(userId))
		return res.status(403).json({ error: 'Invalid request' });

	const user = await User.findById(userId);

	if (!user) return res.status(403).json({ error: 'Invalid request' });

	await User.findByIdAndUpdate(userId, { activationToken: null });

	await EmailVerifcation.findOneAndDelete({ owner: userId });

	const token = generateToken(4);
	await EmailVerifcation.create({ owner: user?._id, token });

	res.status(200).send({ message: 'Please check your email' });
};
