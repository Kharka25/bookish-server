import request from 'supertest';

import server from '../src/server';
import { User } from '@models';

beforeEach(async () => {
  await User.deleteMany({});
});

afterEach(async () => {
  await User.deleteMany({});
});

const validAuthorUser = {
  username: 'user1',
  email: 'user1@mail.com',
  password: 'P4ssword!',
  verified: true,
  userType: 'author',
};

async function addUser(user = { ...validAuthorUser }) {
  return await User.create(user);
}

async function postAuth(user = { ...validAuthorUser }) {
  return await request(server).post('/api/v1/users/auth/signin').send(user);
}

async function authenticatedRequest() {
  const res = await postAuth();
  const authToken = res.body.token;
  return await request(server)
    .post(`/api/v1/profile/author/update-profile`)
    .set('Authorization', `Bearer ${authToken}`)
    .send();
}

describe('Author Profile Update', () => {
  it('returns 403 status caode when profile update request is sent from unauthenticated user', async () => {
    const res = await request(server)
      .post('/api/v1/profile/author/update-profile')
      .send();
    expect(res.statusCode).toBe(403);
  });

  it('returns error message when profile update request is sent from unauthenticated user', async () => {
    const res = await request(server)
      .post('/api/v1/profile/author/update-profile')
      .send();
    const { body } = res;
    expect(body.error).toBe('Unauthorized request!');
  });

  it('returns error message when uerType is not author', async () => {
    await addUser({ ...validAuthorUser, userType: 'user' });
    await postAuth({ ...validAuthorUser, userType: 'user' });

    const res = await authenticatedRequest();
    expect(res.body.error).toBe('Invalid request, invalid userType/profile!');
  });

  it('returns 403 status code when userType is not author', async () => {
    await addUser({ ...validAuthorUser, userType: 'user' });
    await postAuth({ ...validAuthorUser, userType: 'user' });

    const res = await authenticatedRequest();
    expect(res.status).toBe(403);
  });

  it('returns 200 status code when request is valid', async () => {
    await addUser();

    const res = await authenticatedRequest();
    expect(res.statusCode).toBe(200);
  });
});
