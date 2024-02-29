import { RequestHandler } from 'express';
import { isValidObjectId } from 'mongoose';
import crypto from 'crypto';

import {
  Author,
  EmailVerificationToken,
  PasswordResetToken,
  User,
} from '@models';
import { SignUpRequest, VerifyEmailRequest } from '@types';
import {
  createJwtToken,
  formatUserProfile,
  generateToken,
  isValidEmail,
  sendAccountActivationEmail,
  sendPasswordResetLink,
} from '@utils/helper';
import { PASSWORD_RESET_LINK } from '@utils/variables';

export const signUp: RequestHandler = async (req: SignUpRequest, res) => {
  const { bio, username, email, userType, password } = req.body;

  const token = generateToken(4);

  const user = await User.create({
    email,
    username,
    userType,
    password,
    activationToken: token,
  });

  if (userType === 'author') {
    const newAuthorUser = await Author.create({
      authorId: user._id,
      bio,
      products: [],
      rating: 0,
    });
    await newAuthorUser.save();
  }

  await EmailVerificationToken.create({ owner: user._id, token });

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

  const verificationToken = await EmailVerificationToken.findOne({
    owner: userId,
  });
  if (!verificationToken)
    return res.status(403).json({ error: 'Invalid token' });

  const matchedToken = await verificationToken.compareToken(token);
  if (!matchedToken) return res.status(403).json({ error: 'Invalid token' });

  await User.findByIdAndUpdate(userId, {
    verified: true,
    activationToken: null,
  });

  await EmailVerificationToken.findByIdAndDelete(verificationToken._id);

  res.status(201).json({ message: 'Email verification successful' });
};

export const resendVerificationToken: RequestHandler = async (req, res) => {
  const { userId } = req.body;

  if (!isValidObjectId(userId))
    return res.status(403).json({ error: 'Invalid request' });

  const user = await User.findById(userId);

  if (!user) return res.status(403).json({ error: 'Invalid request' });

  await User.findByIdAndUpdate(userId, { activationToken: null });

  await EmailVerificationToken.findOneAndDelete({ owner: userId });

  const token = generateToken(4);
  await EmailVerificationToken.create({ owner: userId, token });

  try {
    await sendAccountActivationEmail(user.email, token);
    res.status(200).send({ message: 'Please check your email' });
  } catch (error) {
    await User.findOneAndDelete({ email: user.email });
    res.status(502).send({ message: 'Account Activation Email failure' });
  }
};

export const resetPassword: RequestHandler = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.status(403).send({ error: 'Unauthorized request' });

  await PasswordResetToken.findOneAndDelete({ owner: user._id });

  const token = crypto.randomBytes(32).toString('hex');
  await PasswordResetToken.create({ owner: user._id, token });

  const resetLink = `${PASSWORD_RESET_LINK}?token=${token}&userId=${user._id}`;

  await sendPasswordResetLink(user.email, resetLink);

  res.status(200).json({ message: 'Check your registered email' });
};

export const verifyPasswordReset: RequestHandler = async (req, res) => {
  res.status(200).send({ valid: true });
};

export const updatePasswword: RequestHandler = async (req, res) => {
  const { password, userId } = req.body;

  const user = await User.findById(userId);
  if (!user) return res.status(403).send({ error: 'Unauthorized access' });

  const matched = await User.findOne({ password });
  if (matched) return res.status(422).send({ error: 'Try another password' });

  user.password = password;
  await user.save();

  await PasswordResetToken.findOneAndDelete({ owner: user._id });

  res.status(200).send({ message: 'Your password has been updated' });
};

export const signIn: RequestHandler = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  if (!user) return res.status(401).json({ error: 'Invalid email/password' });

  const matched = await user.comparePassword(password);
  if (!matched)
    return res.status(401).json({ error: 'Invalid email/password' });

  const token = createJwtToken(user._id);
  user.tokens.push(token);

  await user.save();

  res.status(200).json({
    profile: {
      id: user._id,
      username: user?.username,
      email: user?.email,
      favorites: user.favorites,
      verified: user?.verified,
      userType: user.userType,
    },
    token,
  });
};

export const getProfile: RequestHandler = async (req, res) => {
  res.status(200).json({ profile: req.user });
};

export const updateProfile: RequestHandler = async (req, res) => {
  const { email, username } = req.body;
  const user = await User.findById(req.user.id);
  if (!user)
    return res
      .status(404)
      .json({ error: 'Something went wrong, user not found' });

  if (!isValidEmail(email) && typeof username !== 'string')
    return res.status(422).json({
      validationErrors: {
        email: 'Invalid email!',
        username: 'Invalid username!',
      },
    });

  if (!isValidEmail(email))
    return res
      .status(422)
      .json({ validationErrors: { email: 'Invalid email!' } });

  if (typeof username !== 'string')
    return res
      .status(422)
      .json({ validationErrors: { username: 'Invalid username' } });

  if (username.trim().length < 3)
    return res.status(422).json({
      validationErrors: {
        username: 'Name should have a min of 3 and max of 20 characters',
      },
    });

  user.username = username;
  user.email = email;

  await user.save();
  res.json({ profile: formatUserProfile(user) });
};

export const logOut: RequestHandler = async (req, res) => {
  const { fromAll } = req.query;
  const token = req.token;

  const user = await User.findById(req.user.id);
  if (!user) throw new Error('Something went wrong, user not found');

  if (fromAll === 'yes') {
    // fromAll - to logout user out from mutliple devices
    user.tokens = [];
  } else {
    user.tokens = user.tokens.filter((item) => item !== token);
  }

  await user.save();

  res.status(200).json({ success: true });
};
