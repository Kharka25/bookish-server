import request from 'supertest';
import { SMTPServer } from 'smtp-server';

import server from '../src/server';
import User from '@models/user';
import EmailVerification from '@models/emailVerifcation';

let lastMail: string, mailServer: SMTPServer;
let simulateSmtpFailure = false;

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

beforeEach(async () => {
	simulateSmtpFailure = false;

	await User.deleteMany({});
	await EmailVerification.deleteMany({});
});

interface UserI {
	username: string | null;
	email: string | null;
	password: string;
	verified?: boolean;
}

const validUser: UserI = {
	username: 'user1',
	email: 'user1@mail.com',
	password: 'P4ssword!',
};

const postUser = (user = validUser) => {
	return request(server).post('/api/v1/users/auth/signup').send(user);
};

jest.useRealTimers();

describe('User Registration', () => {
	// Validate endpoint being reached
	it('returns 201 ok when signup request is valid', async () => {
		const res = await postUser();
		expect(res.statusCode).toBe(201);
	});

	it('returns a success message when signup request is successful', async () => {
		const res = await postUser();
		expect(res.body.message).toBe('User created!');
	});

	it('returns response containing a success message and user object when signup request is successful', async () => {
		const res = await postUser();
		const body = res.body;
		expect(Object.keys(body)).toEqual(['message', 'user']);
	});

	it('responds with correct user object when sign up request is valid and successful', async () => {
		const res = await postUser();
		const body = res.body;
		expect(body.user.email).toBe(validUser.email);
	});

	// Query database
	it('saves user info into database', async () => {
		await postUser();
		const userList = await User.find();

		expect(userList.length).toBe(1);
	});

	it('saves username and email to database', async () => {
		await postUser();
		const userList = await User.find();
		const savedUser = userList[0];

		expect(savedUser.username).toBe('user1');
		expect(savedUser.email).toBe('user1@mail.com');
	});

	it('hashes password before storing in database', async () => {
		await postUser();
		const userList = await User.find();
		const savedUser = userList[0];

		expect(savedUser.password).not.toBe('P4ssword!');
	});

	// Invalid requests
	it('returns 422 status code when username is null', async () => {
		const res = await postUser({
			username: null,
			email: 'user1@mail.com',
			password: 'P4ssword!',
		});

		expect(res.statusCode).toBe(422);
	});

	it('returns validation error in request body when validation error is thrown', async () => {
		const res = await postUser({
			username: null,
			email: 'user1@mail.com',
			password: 'P4ssword!',
		});

		const body = res.body;
		expect(body.validationErrors).not.toBeUndefined();
	});

	const username_null = 'Name is required!';
	const username_length =
		'Name should have a min of 3 and max of 20 characters';
	const email_null = 'Email is required!';
	const email_invalid = 'Invalid email!';
	const password_null = 'Password is required!';
	const password_length = 'Password must have at least 8 characters';
	const password_pattern =
		'Password must contain at least 1 uppercase, 1 lowercase, a number and a special character';

	it.each`
		field         | value              | expectedMessage
		${'username'} | ${null}            | ${username_null}
		${'username'} | ${'me'}            | ${username_length}
		${'email'}    | ${null}            | ${email_null}
		${'email'}    | ${'mail.com'}      | ${email_invalid}
		${'email'}    | ${'usr.mail.com'}  | ${email_invalid}
		${'password'} | ${null}            | ${password_null}
		${'password'} | ${'alllowercase'}  | ${password_pattern}
		${'password'} | ${'ALLUPPERCASE'}  | ${password_pattern}
		${'password'} | ${'1234567890'}    | ${password_pattern}
		${'password'} | ${'lowerandUPPER'} | ${password_pattern}
		${'password'} | ${'lower4nd12340'} | ${password_pattern}
		${'password'} | ${'UPPER3422'}     | ${password_pattern}
	`(
		'returns $expectedMessage in validation errors when $field is $value',
		async ({ field, expectedMessage, value }) => {
			const user: any = {
				username: 'user1',
				email: 'user1@mail.com',
				password: 'p4ssword',
			};

			user[field] = value;
			const res = await postUser(user);
			const body = res.body;
			expect(body.validationErrors[field]).toBe(expectedMessage);
		}
	);

	// it('returns Email already in use when users email already exists in database', async () => {
	// 	await User.create({ ...validUser });
	// 	const res = await postUser(validUser);
	// 	const body = res.body;
	// 	expect(body.validationErrors.email).toBe('Email already in use');
	// });

	it('returns error for null username and invalid email in validationErrors', async () => {
		await User.create({ ...validUser });
		const res = await postUser({
			username: null,
			email: 'mail.com',
			password: '!P4ssword_',
		});

		const body = res.body;
		expect(Object.keys(body.validationErrors)).toEqual(['username', 'email']);
	});

	it('creates user as unverified', async () => {
		await postUser();
		const userList = await User.find();
		const savedUser = userList[0];

		expect(savedUser.verified).toBeFalsy();
	});

	it('creates user as unverified even if request body contains truthy verified value', async () => {
		await postUser({ ...validUser, verified: true });
		const userList = await User.find();
		const savedUser = userList[0];
		expect(savedUser.verified).toBeFalsy();
	});

	it('creates verification token for user', async () => {
		await postUser();
		const userList = await User.find();
		const savedUser = userList[0];

		const tokens = await EmailVerification.find();
		const savedUserToken = tokens[0];

		expect(savedUserToken.owner).toStrictEqual(savedUser._id);
	});

	// Verication email validation
	it('sends account activation email to user when signup request is valid', async () => {
		await postUser();
		const userList = await User.find();
		const savedUser = userList[0];

		expect(lastMail).toContain(savedUser.activationToken);
		expect(lastMail).toContain(validUser.email);
	});

	it('returns 502 Bad Gateway when sending account activation email fails', async () => {
		simulateSmtpFailure = true;
		const res = await postUser();
		expect(res.status).toBe(502);
	});

	it('returns Email failure message when sending account activation email fails', async () => {
		simulateSmtpFailure = true;
		const res = await postUser();
		expect(res.body.message).toBe('Account Activation Email failure');
	});

	it('does not save user to database if sending account activation email fails', async () => {
		simulateSmtpFailure = true;
		await postUser();
		const userList = await User.find();
		expect(userList.length).toBe(0);
	});
});

describe('Email Verification', () => {
	it('verifies user account when correct verification token is send', async () => {
		await postUser();
		let users = await User.find();
		const userId = users[0]._id;
		const token = users[0].activationToken;
		await request(server)
			.post(`/api/v1/users/auth/verify-email`)
			.send({ token, userId });

		users = await User.find();
		expect(users[0].verified).toBe(true);
	});

	it('removes activation token from db when user email verification is successful', async () => {
		await postUser();
		let users = await User.find();
		const userId = users[0]._id;
		const token = users[0].activationToken;
		await request(server)
			.post(`/api/v1/users/auth/verify-email`)
			.send({ token, userId });

		users = await User.find();
		expect(users[0].activationToken).toBeNull();
	});

	it('removes email activation token from db when user email verification is successful', async () => {
		await postUser();
		let users = await User.find();
		const userId = users[0]._id;
		const token = users[0].activationToken;
		await request(server)
			.post(`/api/v1/users/auth/verify-email`)
			.send({ token, userId });

		const emailToken = await EmailVerification.findOne({ owner: userId });
		expect(emailToken?.token).toBeFalsy();
	});

	it('fails email verification when verification token is invalid', async () => {
		await postUser();
		let users = await User.find();
		const userId = users[0]._id;
		const token = 'iNValid-ToKEN';

		await request(server)
			.post(`/api/v1/users/auth/verify-email`)
			.send({ token, userId });

		users = await User.find();
		expect(users[0].verified).toBe(false);
	});

	it('returns Forbidden request when verification token is invalid', async () => {
		await postUser();
		let users = await User.find();
		const userId = users[0]._id;
		const token = 'iNValid-ToKEN';

		const res = await request(server)
			.post(`/api/v1/users/auth/verify-email`)
			.send({ token, userId });
		expect(res.status).toBe(403);
	});

	it('returns an error message when verification token is invalid', async () => {
		await postUser();
		let users = await User.find();
		const userId = users[0]._id;
		const token = 'iNValid-ToKEN';

		const res = await request(server)
			.post(`/api/v1/users/auth/verify-email`)
			.send({ token, userId });

		expect(res.body.error).toBe('Invalid token');
	});

	it('returns 201 status and success message when token is valid and email verification was successful', async () => {
		await postUser();
		let users = await User.find();
		const userId = users[0]._id;
		const token = users[0].activationToken;
		const res = await request(server)
			.post(`/api/v1/users/auth/verify-email`)
			.send({ token, userId });

		expect(res.status).toBe(201);
		expect(res.body.message).toBe('Email verification successful');
	});
});

describe('Retry Email Verification', () => {
	it('resends email verification token to user upon retry', async () => {
		await postUser();
		let users = await User.find();
		const user = users[0];
		await request(server)
			.post(`/api/v1/users/auth/reverify-email`)
			.send({ userId: user._id });

		expect(lastMail).toContain(user.activationToken);
	});

	it('returns 403 error status code when email verification token retry is invalid', async () => {
		await postUser();
		const res = await request(server)
			.post(`/api/v1/users/auth/reverify-email`)
			.send({ userId: 'InVAliD_iD' });

		expect(res.status).toBe(403);
	});

	it('sends 200 ok response when verification token resend is successful', async () => {
		await postUser();
		let users = await User.find();
		const user = users[0];
		const res = await request(server)
			.post(`/api/v1/users/auth/reverify-email`)
			.send({ userId: user._id });

		expect(res.status).toBe(200);
	});

	it('sends message response for use to check email for new token', async () => {
		await postUser();
		let users = await User.find();
		const user = users[0];
		const res = await request(server)
			.post(`/api/v1/users/auth/reverify-email`)
			.send({ userId: user._id });

		expect(res.body.message).toBe('Please check your email');
	});
});
