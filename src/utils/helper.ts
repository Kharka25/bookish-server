import { Schema, Types } from 'mongoose';
import jwt from 'jsonwebtoken';

import { transporter, transporterTest } from '@config/emailTransporter';
import User from '@models/user';
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

function createJwtToken(userId: Types.ObjectId) {
	return jwt.sign({ userId }, JWT_SECRET);
}

export {
	createJwtToken,
	generateToken,
	sendPasswordResetLink,
	sendAccountActivationEmail,
};
