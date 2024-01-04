import { RequestHandler } from 'express';

import PasswordResetToken from '@models/passwordResetToken';

export const validatePasswordResetToken: RequestHandler = async (
	req,
	res,
	next
) => {
	const { token, userId } = req.body;

	const resetToken = await PasswordResetToken.findOne({ owner: userId });
	if (!resetToken)
		return res.status(403).send({ error: 'Unauthorized access, invalid user' });

	const matched = await resetToken.compareToken(token);
	if (!matched)
		return res.status(403).send({ error: 'Unauthorized access, invalid user' });

	next();
};
