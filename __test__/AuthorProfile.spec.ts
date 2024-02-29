import request from 'supertest';

import server from '../src/server';
import { User } from '@models';
import { ObjectId } from 'mongoose';

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

const validUser = {
  username: 'user2',
  email: 'user2@mail.com',
  password: 'P5sswOrd!',
  verified: true,
  userType: 'user',
};

async function addUser(user = { ...validAuthorUser }) {
  return await User.create(user);
}

async function postAuth() {
  return await request(server).post('/api/v1/users/auth/signin').send({
    email: validUser.email,
    password: validUser.password,
    userType: validUser.userType,
  });
}

async function authenticatedRequest(authorId: ObjectId) {
  const res = await postAuth();
  const authToken = res.body.token;
  return await request(server)
    .get(`/api/v1/profile/author/${authorId}`)
    .set('Authorization', `Bearer ${authToken}`)
    .send();
}

describe('Author Profile', () => {
  it('returns a 403 code when request is made by unauthenticated user', async () => {
    await addUser({ ...validAuthorUser, userType: 'user' });
    const userList = await User.find();
    const savedUser = userList[0];

    const res = await request(server)
      .get(`/api/v1/profile/author/${savedUser._id}`)
      .send();
    expect(res.statusCode).toBe(403);
  });

  it('returns error message when request is made by unauthenticated user', async () => {
    await addUser({ ...validAuthorUser, userType: 'user' });
    const userList = await User.find();
    const savedUser = userList[0];

    const res = await request(server)
      .get(`/api/v1/profile/author/${savedUser._id}`)
      .send();
    const { body } = res;
    expect(body.error).toBe('Unauthorized request!');
  });

  it('returns error message when author profile request is invalid', async () => {
    await addUser({ ...validAuthorUser, userType: 'user' });
    await addUser(validUser);

    const userList = await User.find();
    const savedUser = userList[0];

    const res = await authenticatedRequest(savedUser._id);
    const { body } = res;

    expect(body.error).toBe('Invalid request, invalid userType/profile');
  });

  it('returns 404 code when author profile request is invalid', async () => {
    await addUser({ ...validAuthorUser, userType: 'user' });
    await addUser(validUser);

    const userList = await User.find();
    const savedUser = userList[0];

    const res = await authenticatedRequest(savedUser._id);
    expect(res.statusCode).toBe(404);
  });

  it('returns 200 ok when request is valid', async () => {
    await addUser();
    await addUser(validUser);
    const userList = await User.find();
    const savedUser = userList[0];

    const res = await authenticatedRequest(savedUser._id);
    expect(res.statusCode).toBe(200);
  });

  it('returns correct userType when request is valid', async () => {
    await addUser();
    await addUser(validUser);
    const userList = await User.find();
    const savedUser = userList[0];

    const res = await authenticatedRequest(savedUser._id);
    const { body } = res;
    expect(body.profile.userType).toEqual(validAuthorUser.userType);
  });

  it('returns author profile when request is valid', async () => {
    await addUser();
    await addUser(validUser);
    const userList = await User.find();
    const savedUser = userList[0];

    const res = await authenticatedRequest(savedUser._id);
    const { body } = res;
    expect(Object.keys(body.profile)).toEqual([
      'id',
      'username',
      'email',
      'userType',
    ]);
  });
});
