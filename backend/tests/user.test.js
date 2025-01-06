import mongoose from 'mongoose';
import supertest from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app, startServer } from '../src/app.js';
import User from '../src/models/user.js';
import Role from '../src/models/role.js';
import '../src/controllers/user.controller.js';
import { getUserByUsername } from '../src/controllers/user.controller.js';

const request = supertest(app);
let mongoServer;
let token, token2; // Token para autenticación
let adminRole, userRole;
jest.spyOn(console, 'error').mockImplementation();

// Configuración inicial
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  startServer();

  // Verificar si el rol 'admin' existe, si no, crearlo
  adminRole = await Role.findOne({ name: 'admin' });
  if (!adminRole) adminRole = await Role.create({ name: 'admin' });
  userRole = await Role.findOne({ name: 'user' });
  if (!userRole) userRole = await Role.create({ name: 'user' });

  // Crear un usuario admin para obtener token
  adminRole = await Role.findOne({ name: 'admin' });
  const adminUser = await User.create({
    username: 'admin',
    email: 'admin@example.com',
    password: await User.encryptPassword('password123'),
    roles: [adminRole._id],
  });

  const user = await User.create({
    username: 'user',
    email: 'user@user.com',
    password: await User.encryptPassword('password123'),
    roles: [userRole._id],
  });

  const res = await request.post('/auth/login').send({
    email: 'admin@example.com',
    password: 'password123',
  });

  token = res.body.token;

  const res2 = await request.post('/auth/login').send({
    email: 'user@user.com',
    password: 'password123',
  });

  token2 = res2.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});


describe('POST /user', () => {
  it('should create a new user', async () => {
    const res = await request
      .post('/api/user')
      .set('x-access-token', token)
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('message', 'User created successfully');
  });

  it('should return 403 without admin role', async () => {
    const res = await request
      .post('/api/user')
      .send({
        username: 'unauthorized',
        email: 'unauthorized@example.com',
        password: 'password123',
      });

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message', 'No token provided');
  });
});

describe('DELETE /user/:id', () => {
  let user, id;

  beforeEach(async () => {
    user = await request
      .post('/api/user')
      .set('x-access-token', token)
      .send({
        username: 'deleteuser',
        email: 'delete@example.com',
        password: 'password123',
      });
    if (user.statusCode === 201)
      id = user.body.user._id;
  });

  it('should delete a user', async () => {
    const res = await request
      .delete(`/api/user/${id}`)
      .set('x-access-token', token);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', `User with ID ${id} deleted`);
  });
  it('should return 403 without token', async () => {
    const res = await request.delete(`/api/user/${id}`);
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message', 'No token provided');
  });

  it('should return 404 if user is not found', async () => {
    const res = await request
      .delete(`/api/user/673b6343562a1a5a6a52d86a`)
      .set('x-access-token', token);

    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });

});

describe('PATCH /user', () => {
  let user, id;

  beforeEach(async () => {
    user = await request
      .post('/api/user')
      .set('x-access-token', token)
      .send({
        username: 'updateuser',
        email: 'update@example.com',
        password: 'password123',
      });
    if (user.statusCode === 201)
      id = user.body.user._id;
  });

  it('should update a user with its id', async () => {
    const res = await request
      .patch('/api/user')
      .set('x-access-token', token)
      .send({
        id: id,
        username: 'updateduser',
        email: 'updated@example.com',
      });
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'User updated successfully');
  });

  it('should return 403 without token', async () => {
    const res = await request.patch('/api/user').send({
      id: id,
      username: 'unauthorizedupdate',
    });

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message', 'No token provided');
  });

  it('if no username, email or id is provided, should return 400', async () => {
    const res = await request
      .patch('/api/user')
      .set('x-access-token', token)
      .send({});

    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message', 'You must provide id to update a user');
  });

  it('should return 404 if user is not found', async () => {
    const res = await request
      .patch('/api/user')
      .set('x-access-token', token)
      .send({
        id: '673b6343562a1a5a6a52d868',
        username: 'updateuser',
        email: 'update@example.com',
      });
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });
});

describe('GET /api/user', () => {
  let user, id;
  beforeEach(async () => {
    user = await request
      .post('/api/user')
      .set('x-access-token', token)
      .send({
        username: 'testuserx',
        email: 'example@test.com',
        password: 'password123',
      });
    if (user.statusCode === 201)
      id = user.body.user._id;
  });

  it('should get a User by username', async () => {
    const res = await request.get('/api/user?username=testuserx').set('x-access-token', token);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('username');
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('_id');
  });

  it('should get a User by email', async () => {
    const res = await request.get('/api/user?email=example@test.com').set('x-access-token', token);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('username');
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('_id');
  });

  it('should get a User by id', async () => {
    const res = await request.get(`/api/user?id=${id}`).set('x-access-token', token);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('username');
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('_id');
  });

  it('should not get a User by password', async () => {
    const res = await request.get('/api/user?password=password').set('x-access-token', token);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  it('should not get a User by non-existent username', async () => {
    const res = await request.get('/api/user?username=johndoe').set('x-access-token', token);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  it('should not get a User by non-existent email', async () => {
    const res = await request.get('/api/user?email=wrong_example@test.com').set('x-access-token', token);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  it('should not get a User by non-existent id', async () => {
    const res = await request.get(`/api/user?id=673b6343562a1a5a6a52d86a`).set('x-access-token', token);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });

  it('should get all Users', async () => {
    const res = await request.get('/api/user').set('x-access-token', token);
    expect(res.statusCode).toBe(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should return 403 without token', async () => {
    const res = await request.get('/api/user');
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message', 'No token provided');
  });

  it('should return 401 without admin role', async () => {
    const res = await request.get('/api/user').set('x-access-token', 'invalidtoken'); // Example random token
    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('message', 'Unauthorized');
  });

  it('should get user own information', async () => {
    user = await request
      .post('/api/user')
      .set('x-access-token', token)
      .send({
        username: 'userown',
        email: 'userown@example.com',
        password: await User.encryptPassword('password123'),
      });
    const userRes = await request.post('/auth/login').send({
      email: 'userown@example.com',
      password: 'password123',
    });
    const userToken = userRes.body.token;
    const res = await request.get('/api/user/userown').set('x-access-token', userToken);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('username', 'userown');
    expect(res.body).toHaveProperty('email', 'userown@example.com');
  });

  it('should get user information by username for admin or moderator', async () => {
    const res = await request.get('/api/user/testuserx').set('x-access-token', token);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('username', 'testuserx');
    expect(res.body).toHaveProperty('email', 'example@test.com');
  });

  it('should return 404 if no user is found', async () => {
    // use getUserByUsername function
    const req = { params: { username: 'nonexistent' } };
    const res = { status: jest.fn().mockReturnThis(), send: jest.fn() };
    await getUserByUsername(req, res);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.send).toHaveBeenCalledWith({ message: 'User not found' });
  });

  it('should not get all users if not admin', async () => {
    const res = await request.get('/api/user').set('x-access-token', token2);
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message', 'Require admin role');
  });
});