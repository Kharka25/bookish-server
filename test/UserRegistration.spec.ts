import request from 'supertest';

import server from '../src/server';

it('returns 200 ok when signup request is valid', async () => {
	const res = await request(server).post('/api/v1/users').send({
		username: 'user1',
		email: 'user1@mail.com',
		password: 'P4ssword!',
	});

	expect(res.status).toBe(200);
});
