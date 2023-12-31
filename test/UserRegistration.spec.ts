import request from 'supertest';

import server from '../src/server';
import User from '@models/user';

beforeEach(async () => {
	await User.deleteMany({});
});

interface UserI {
	username: string | null;
	email: string | null;
	password: string;
}

const validUser: UserI = {
	username: 'user1',
	email: 'user1@mail.com',
	password: 'P4ssword!',
};

const postUser = (user = validUser) => {
	return request(server).post('/api/v1/users/auth/signup').send(user);
};

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

	it('creates user as unverified', async () => {
		await postUser();
		const userList = await User.find();
		const savedUser = userList[0];

		expect(savedUser.verified).toBeFalsy();
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
});
