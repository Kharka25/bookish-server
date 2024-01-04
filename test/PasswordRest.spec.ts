import request from 'supertest';
import { SMTPServer } from 'smtp-server';
import { hash } from 'bcrypt';
import crypto from 'crypto';

import server from '../src/server';
import User from '@models/user';
import EmailVerification from '@models/emailVerifcationToken';
import PasswordResetToken from '@models/passwordResetToken';

interface PasswordUpdateI {
	password?: string;
	userId?: any;
}

let lastMail: string, mailServer: SMTPServer;
let simulateSmtpFailure = false;

beforeEach(async function () {
	simulateSmtpFailure = false;
	await User.deleteMany({});
});

afterEach(async () => {
	await User.deleteMany({});
	await PasswordResetToken.deleteMany({});
});

beforeAll(async () => {
	mailServer = new SMTPServer({
		authOptional: true,
		onData(stream, session, callback) {
			let mailBody = '';
			stream.on('data', (data) => {
				mailBody += data.toString();
			});

			stream.on('end', () => {
				if (simulateSmtpFailure) {
					const err = new Error('Invalid mailbox');
					return callback(err);
				}
				lastMail = mailBody;
				callback();
			});
		},
	});

	mailServer.listen(8587, 'localhost');
});

afterAll(() => {
	mailServer.close();
	jest.setTimeout(5000);
});

const activeUser = {
	username: 'user1',
	email: 'user1@mail.com',
	password: 'P4ssword!',
};

async function addUser(user = { ...activeUser }) {
	const hashedPassword = await hash(user.password, 10);
	user.password = hashedPassword;
	return await User.create(user);
}

function postPasswordReset(email = 'user1@mail.com') {
	return request(server)
		.post('/api/v1/users/auth/reset-password')
		.send({ email });
}

function postPasswordUpdate(body: PasswordUpdateI) {
	return request(server).put('/api/v1/users/auth/update-password').send(body);
}

describe('Password Reset', () => {
	it('returns a 403 status code when password reset request is send for unknown user', async () => {
		const res = await postPasswordReset('inVALid-emAIL');
		expect(res.status).toBe(403);
	});

	it('returns error message when password reset request is invalid', async () => {
		const res = await postPasswordReset('inVALid-emAIL');
		expect(res.body.error).toBe('Unauthorized request');
	});

	it('returns 200 status code when password reset link is sent', async () => {
		const user = await addUser();
		const res = await postPasswordReset(user.email);
		expect(res.status).toBe(200);
	});

	it('returns instruction message after password reset link is sent', async () => {
		const user = await addUser();
		const res = await postPasswordReset(user.email);
		expect(res.body.message).toBe('Check your registered email');
	});

	it('creates password reset token for user when password reset is requested', async () => {
		const user = await addUser();
		await postPasswordReset(user.email);

		const passwordResetTokens = await PasswordResetToken.find();
		expect(passwordResetTokens[0].owner).toStrictEqual(user._id);
	});

	it('sends password reset link to users email', async () => {
		const user = await addUser();
		await postPasswordReset(user.email);

		expect(lastMail).toContain(user.email);
	});

	it('sends password reset link containing reset token to users email', async () => {
		const user = await addUser();
		await postPasswordReset(user.email);

		expect(lastMail).toContain('token');
		expect(lastMail).toContain(user._id.toString());
	});
});

describe('Verify Password Reset', () => {
	it('returns validation error when password reset token is invalid', async () => {
		await addUser();
		const res = await request(server)
			.post('/api/v1/users/auth/verify-password-reset')
			.send();

		expect(res.body.validationErrors).not.toBeUndefined();
	});

	it('returns token in validationErrors when token is invalid', async () => {
		await addUser();
		const userList = await User.find();
		const user = userList[0];
		const res = await request(server)
			.post('/api/v1/users/auth/verify-password-reset')
			.send({ token: null, userId: user._id });

		expect(Object.keys(res.body.validationErrors)).toEqual(['token']);
	});

	it('returns userId in validationErrors when userId is invalid', async () => {
		await addUser();
		const res = await request(server)
			.post('/api/v1/users/auth/verify-password-reset')
			.send({ token: '8908368035', userId: null });

		expect(Object.keys(res.body.validationErrors)).toEqual(['userId']);
	});

	it('returns 403 error when password reset token is incorrect', async () => {
		await addUser();
		const userList = await User.find();
		const user = userList[0];

		const res = await request(server)
			.post('/api/v1/users/auth/verify-password-reset')
			.send({ token: '8908368035', userId: user._id });

		expect(res.status).toBe(403);
	});

	it('returns invalid token error when password reset token is incorrect', async () => {
		await addUser();
		const userList = await User.find();
		const user = userList[0];

		const res = await request(server)
			.post('/api/v1/users/auth/verify-password-reset')
			.send({ token: '8908368035', userId: user._id });

		expect(res.body.error).toBe('Unauthorized access, invalid user');
	});
});

describe('Update Password', () => {
	it('returns 422 error when password update request is invalid', async () => {
		await addUser();
		const res = await postPasswordUpdate({});
		expect(res.status).toBe(422);
	});

	it('returns error message when password update request is invalid', async () => {
		await addUser();
		const res = await postPasswordUpdate({});
		expect(Object.keys(res.body.validationErrors)).toEqual([
			'password',
			'userId',
		]);
	});

	it('returns 422 error when password is not different', async () => {
		await addUser();
		const userList = await User.find();
		const user = userList[0];
		const currentPassword = user.password;

		const res = await postPasswordUpdate({
			password: currentPassword,
			userId: user._id,
		});
		expect(res.status).toBe(422);
	});

	it('returns error message when password is not different', async () => {
		await addUser();
		const userList = await User.find();
		const user = userList[0];
		const currentPassword = user.password;

		const res = await postPasswordUpdate({
			password: currentPassword,
			userId: user._id,
		});
		expect(res.body.error).toBe('Try another password');
	});

	it('returns 200 when password update request is successful', async () => {
		await addUser();
		const userList = await User.find();
		const user = userList[0];

		const res = await postPasswordUpdate({
			password: 'P4ssword!',
			userId: user._id,
		});

		expect(res.status).toBe(200);
	});

	it('returns success message when password update request is successful', async () => {
		await addUser();
		const userList = await User.find();
		const user = userList[0];

		const res = await postPasswordUpdate({
			password: 'P4ssword!',
			userId: user._id,
		});

		expect(res.body.message).toBe('Your password has been updated');
	});

	it('updates users password in database when password update request is valid', async () => {
		const user = await addUser();
		await postPasswordUpdate({
			password: 'P4ssword!',
			userId: user._id,
		});

		const userList = await User.find();
		const userInDb = userList[0];

		expect(userInDb.password).not.toEqual(user.password);
	});

	it('removes password reset token from database when password update is success', async () => {
		const user = await addUser();
		const token = crypto.randomBytes(32).toString('hex');
		await PasswordResetToken.create({ owner: user._id, token });

		let resetTokens = await PasswordResetToken.find();
		const currentToken = resetTokens[0];

		await postPasswordUpdate({
			password: 'P4ssword!',
			userId: user._id,
		});

		expect(currentToken).toBeUndefined;
	});
});
