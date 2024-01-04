import nodemailer from 'nodemailer';

import { MAILTRAP_PASSWORD, MAILTRAP_USER } from '@utils/variables';

const env = process.env.NODE_ENV;

export const transporter = nodemailer.createTransport({
	host: 'sandbox.smtp.mailtrap.io',
	port: 2525,
	auth: {
		user: MAILTRAP_USER,
		pass: MAILTRAP_PASSWORD,
	},
});

export const transporterTest = nodemailer.createTransport({
	host: 'localhost',
	port: 8587,
	tls: {
		rejectUnauthorized: false,
	},
});
