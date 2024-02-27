import request from 'supertest';

import server from '../src/server';
import User from '@models/user';

beforeEach(async () => {
	await User.deleteMany({});
});

afterEach(async () => {
	await User.deleteMany({});
});

const validaUser = {
	username: 'user1',
	email: 'user1@mail.com',
	password: 'P4ssword!',
	verified: true,
};

interface authUserI {
	email?: string;
	password?: string;
}

interface Options {
	[key: string]: Object | authUserI;
}

async function addUser(user = { ...validaUser }) {
	return await User.create(user);
}

async function postAuth(credentials: authUserI) {
	return await request(server)
		.post('/api/v1/users/auth/signin')
		.send(credentials);
}

async function updateUser(
	body?: Object | string | undefined,
	options?: Options
) {
	let authToken;
	let agent = request(server);

	if (options?.auth) {
		const res = await postAuth(options.auth);
		authToken = res.body.token;
	}

	if (authToken) {
		// agent.set('Authorization', `Bearer ${authToken}`);
		return await agent
			.put('/api/v1/users/auth/update-profile')
			.set('Authorization', `Bearer ${authToken}`)
			.send(body);
	}

	return await agent.put('/api/v1/users/auth/update-profile').send(body);
}

describe('User Update', () => {
	it('returns forbidden error when request is sent without proper authorizaton', async () => {
		const res = await updateUser();
		expect(res.status).toBe(403);
	});

	it('returns an error message when request is sent without proper authorizaton', async () => {
		const validUpdate = { username: 'user1-updated' };
		const res = await updateUser(validUpdate);
		expect(res.body.error).toBe('Unauthorized request!');
	});

	it('returns 422 status code when update is sent with invalid credentials', async () => {
		const user = await addUser();
		const validUpdate = { email: 'mail.com', username: null };
		const res = await updateUser(validUpdate, {
			auth: { email: user.email, password: 'P4ssword!' },
		});
		expect(res.status).toBe(422);
	});

	it('returns an error message when update request is sent with invalid credentials', async () => {
		const user = await addUser();
		const validUpdate = { email: '', username: null };
		const res = await updateUser(validUpdate, {
			auth: { email: user.email, password: 'P4ssword!' },
		});
		const body = res.body;
		expect(Object.keys(body.validationErrors)).toEqual(['email', 'username']);
	});

	it('returns an error message when update request is sent with an invalid email', async () => {
		const user = await addUser();
		const validUpdate = { email: 'mail.com', username: 'user1-updated' };
		const res = await updateUser(validUpdate, {
			auth: { email: user.email, password: 'P4ssword!' },
		});
		const body = res.body;
		expect(body.validationErrors.email).toBe('Invalid email!');
	});

	it('returns an error message when update request is sent with an invalid username', async () => {
		const user = await addUser();
		const validUpdate = { email: 'user1@mail.com', username: 'me' };
		const res = await updateUser(validUpdate, {
			auth: { email: user.email, password: 'P4ssword!' },
		});
		const body = res.body;
		expect(body.validationErrors.username).toBe(
			'Name should have a min of 3 and max of 20 characters'
		);
	});

	it('returns 200 status when request is sent with valid authorization', async () => {
		const user = await addUser();
		const validUpdate = {
			email: 'newuser@mail.com',
			username: 'user1-updated',
		};

		const res = await updateUser(validUpdate, {
			auth: { email: user.email, password: 'P4ssword!' },
		});
		expect(res.status).toBe(200);
	});

	it('updates user credentials in database  when update request is authorized', async () => {
		const user = await addUser();
		const validUpdate = {
			email: 'newuser@mail.com',
			username: 'user1-updated',
		};

		await updateUser(validUpdate, {
			auth: { email: user.email, password: 'P4ssword!' },
		});

		const userInDb = await User.findById(user._id);
		expect(userInDb?.email).toBe(validUpdate.email);
		expect(userInDb?.username).toBe(validUpdate.username);
	});
});
