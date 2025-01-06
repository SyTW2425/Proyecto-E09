import mongoose from 'mongoose';
import supertest from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app, startServer } from '../src/app.js';
import User from '../src/models/user.js';
import Role from '../src/models/role.js';

const request = supertest(app);
let mongoServer;
let id;
let registerToken;
let loginToken;

// Configure a new in-memory database
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  startServer();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

// Clean DB between tests
afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
});

describe('POST /auth/register', () => {
  it('should create a new User', async () => {
    const res = await request
      .post('/auth/register')
      .send({
        username: 'testuser',
        email: 'example@test.com',
        password: 'password',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    registerToken = res.body.token;
  });

  it('should not create a duplicate User with different username but same email', async () => {
    await User.create({ username: 'testuserX', email: 'example@test.com', password: 'password' });
    const res = await request
      .post('/auth/register')
      .send({
        username: 'testuser24',
        email: 'example@test.com',
        password: 'password',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('should not create a duplicate User with different email but same username', async () => {
    await User.create({ username: 'testuser15', email: 'example15@test.com', password: 'password' });
    const res = await request
      .post('/auth/register')
      .send({
        username: 'testuser15',
        email: 'example16@test.com',
        password: 'password',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('roles can be assigned to a User', async () => {
    const res = await request
      .post('/auth/register')
      .send({
        username: 'testuser',
        email: 'new@user.com',
        password: 'password',
        roles: ['admin'],
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
  });

  it('cannot assign a role that does not exist', async () => {
    const res = await request
      .post('/auth/register')
      .send({
        username: 'testuser',
        email: 'a@c.com',
        password: 'password',
        roles: ['superadmin'],
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('should not create a User with missing credentials', async () => {
    const res = await request
      .post('/auth/register')
      .send({
        username: 'testuser',
        email: 'example2@user.com',
        password: '',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('should not create a User without email and username', async () => {
    const res = await request
      .post('/auth/register')
      .send({
        email: '',
        password: 'password',
        username: '',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});

describe('POST /auth/login', () => {
  beforeEach(async () => {
    const password = await User.encryptPassword('password');
    await User.create({ username: 'testuser', email: 'example@test.com', password: password });

  });
  it('should login a User with valid credentials', async () => {
    const res = await request
      .post('/auth/login')
      .send({
        email: 'example@test.com',
        password: 'password',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    loginToken = res.body.token;
  });

  it('should not login a User with invalid credentials', async () => {
    const res = await request
      .post('/auth/login')
      .send({
        email: 'example@test.com',
        password: 'wrongpassword',
      });
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message');
  });

  it('should not login a User that does not exist', async () => {
    const res = await request
      .post('/auth/login')
      .send({
        email: 'john@doe.com',
        password: 'password',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });
});