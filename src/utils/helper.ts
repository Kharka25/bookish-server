import { transporter } from '@config/emailTransporter';

function generateToken(length = 6) {
	let otp = '';

	for (let i = 0; i < length; i++) {
		const digit = Math.floor(Math.random() * 10);
		otp += digit;
	}

	return otp;
}

async function sendAccountActivationEmail(email: string, token: string) {
	await transporter.sendMail({
		from: 'Bookish <auth@bookish.com',
		html: `Activation token is ${token}`,
		subject: 'Account activation',
		to: email,
	});
}

export { generateToken, sendAccountActivationEmail };
