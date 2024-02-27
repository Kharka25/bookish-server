import request from 'supertest';

import server from '../src/server';
import User from '@models/user';

beforeEach(async () => {
  await User.deleteMany({});
});

afterEach(async () => {
  await User.deleteMany({});
});

interface authUserI {
  email?: string;
  password?: string;
}

const validaUser = {
  username: 'user1',
  email: 'user1@mail.com',
  password: 'P4ssword!',
  verified: true,
  userType: 'user',
};

async function addUser(user = { ...validaUser }) {
  return await User.create(user);
}

async function postAuth(credentials: authUserI) {
  return await request(server)
    .post('/api/v1/users/auth/signin')
    .send(credentials);
}

describe('Authentication', () => {
  it('returns 200 status when auth credentials are correct', async () => {
    await addUser();
    const res = await postAuth({
      email: 'user1@mail.com',
      password: 'P4ssword!',
    });
    expect(res.status).toBe(200);
  });

  it('returns user profile when authentication is successful', async () => {
    await addUser();
    const res = await postAuth({
      email: 'user1@mail.com',
      password: 'P4ssword!',
    });
    expect(res.body).toHaveProperty('profile');
  });

  it('creates authorization token for user when authentication is successful', async () => {
    await addUser();
    await postAuth({
      email: 'user1@mail.com',
      password: 'P4ssword!',
    });

    const userList = await User.find();
    const savedUser = userList[0];
    expect(savedUser.tokens).toHaveLength(1);
  });

  it('returns authorization toke in response when authentication is successful', async () => {
    await addUser();
    const res = await postAuth({
      email: 'user1@mail.com',
      password: 'P4ssword!',
    });

    expect(res.body.token).not.toBeUndefined();
    expect(res.body).toHaveProperty('token');
  });

  it('returns user info containing username, id, email, userType, and verification status', async () => {
    await addUser();
    const res = await postAuth({
      email: 'user1@mail.com',
      password: 'P4ssword!',
    });

    expect(Object.keys(res.body.profile)).toEqual([
      'id',
      'username',
      'email',
      'favorites',
      'verified',
      'userType',
    ]);
  });

  it('returns validation error in request when validation error is thrown', async () => {
    await addUser();
    const res = await postAuth({
      email: undefined,
      password: '',
    });

    expect(res.body.validationErrors).not.toBeUndefined();
  });

  it('returns validation error message when validation is invalid', async () => {
    await addUser();
    const res = await postAuth({
      email: undefined,
      password: '',
    });
    const body = res.body;

    expect(Object.values(body.validationErrors)).toEqual([
      'Email is required',
      'Password is required',
    ]);
  });

  it('returns 422 status code when validationError occurs', async () => {
    await addUser();
    const res = await postAuth({
      email: undefined,
      password: '',
    });

    expect(res.status).toBe(422);
  });

  it('returns 401 status code when user is not found', async () => {
    const res = await postAuth({
      email: 'user1@mail.com',
      password: 'P4ssword!',
    });

    expect(res.status).toBe(401);
  });

  it('returns proper error response message when authentication is invalid', async () => {
    const res = await postAuth({
      email: 'user1@mail.com',
      password: 'P4ssword',
    });

    expect(res.body.error).toBe('Invalid email/password');
  });

  it('returns 401 status code when password is invalid', async () => {
    await addUser();
    const res = await postAuth({
      email: 'user1@mail.com',
      password: 'password',
    });

    expect(res.status).toBe(401);
  });

  it('returns 422 status code when email is invalid', async () => {
    await addUser();
    const res = await postAuth({
      password: 'P4ssword',
    });

    expect(res.status).toBe(422);
  });

  it('returns an error message when password does not match', async () => {
    await addUser();
    const res = await postAuth({
      email: 'user1@mail.com',
      password: 'passwordd',
    });

    expect(res.body.error).toBe('Invalid email/password');
  });
});
