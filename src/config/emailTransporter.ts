import nodemailer from 'nodemailer';

import { MAILTRAP_PASSWORD, MAILTRAP_USER } from '@utils/variables';

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
