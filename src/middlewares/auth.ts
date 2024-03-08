import { RequestHandler } from 'express';
import { JwtPayload } from 'jsonwebtoken';

import { PasswordResetToken, User } from '@models';
import { verifyJwtToken } from '@utils/helper';

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

export const validateAuth: RequestHandler = async (req, res, next) => {
  const { authorization } = req.headers;

  const token = authorization?.split('Bearer ')[1];
  if (!token) return res.status(403).send({ error: 'Unauthorized request!' });

  const payload = verifyJwtToken(token) as JwtPayload;
  const id = payload.userId;

  const user = await User.findOne({ _id: id, tokens: token });
  if (!user) return res.status(403).send({ error: 'Unauthorized request!' });

  req.user = {
    id: user._id,
    avatar: user.avatar?.url,
    email: user.email,
    verified: user.verified,
    username: user.username,
    userType: user.userType,
  };

  req.token = token;

  next();
};
