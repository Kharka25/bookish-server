import { Schema } from 'mongoose';
import jwt from 'jsonwebtoken';

import { transporter, transporterTest } from '@config/emailTransporter';
import { UserI } from '@models/user';
import { JWT_SECRET } from './variables';

const env = process.env.NODE_ENV;

function generateToken(length = 6) {
  let otp = '';

  for (let i = 0; i < length; i++) {
    const digit = Math.floor(Math.random() * 10);
    otp += digit;
  }

  return otp;
}

async function sendAccountActivationEmail(email: string, token: string) {
  env === 'test'
    ? await transporterTest.sendMail({
        from: 'Bookish <auth@bookish.com',
        html: `Activation token is ${token}`,
        subject: 'Account activation',
        to: email,
      })
    : await transporter.sendMail({
        from: 'Bookish <auth@bookish.com',
        html: `Activation token is ${token}`,
        subject: 'Account activation',
        to: email,
      });
}

async function sendPasswordResetLink(email: string, link: string) {
  env === 'test'
    ? await transporterTest.sendMail({
        from: 'Bookish <auth@bookish.com',
        html: `Click the link to reset your password ${link}`,
        subject: 'Reset password',
        to: email,
      })
    : await transporter.sendMail({
        from: 'Bookish <auth@bookish.com',
        html: `Click the link to reset your password ${link}`,
        subject: 'Reset password',
        to: email,
      });
}

function createJwtToken(userId: Schema.Types.ObjectId) {
  return jwt.sign({ userId }, JWT_SECRET);
}

function verifyJwtToken(token: string) {
  return jwt.verify(token, JWT_SECRET);
}

function formatUserProfile(user: UserI) {
  return {
    id: user._id,
    username: user.username,
    email: user.email,
    verified: user.verified,
    avatar: user.avatar?.url,
    favorites: user.favorites,
    userType: user.userType,
  };
}

function isValidEmail(email: string) {
  const emailFormat = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/;
  if (email !== '' && email.match(emailFormat)) return true;

  return false;
}

export {
  createJwtToken,
  formatUserProfile,
  generateToken,
  isValidEmail,
  sendPasswordResetLink,
  sendAccountActivationEmail,
  verifyJwtToken,
};
