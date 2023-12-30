import request from 'supertest';

import server from '../src/server';
import User from '@models/user';

beforeEach(async () => {
	await User.deleteMany({});
});

const validUser = {
	username: 'user1',
	email: 'user1@mail.com',
	password: 'P4ssword!',
};

const postUser = (user = validUser) => {
	return request(server).post('/api/v1/users/auth/signup').send(user);
};

describe('User Registration', () => {
	// Validate endpoint being reached
	it('returns 200 ok when signup request is valid', async () => {
		const res = await postUser();
		expect(res.statusCode).toBe(200);
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
});
