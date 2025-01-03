import mongoose from 'mongoose';
import supertest from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app, startServer } from '../src/app.js';
import User from '../src/models/user.js';
import Role from '../src/models/role.js';

const request = supertest(app);
let mongoServer;
let token; // Token para autenticación
let adminRole;

// Configuración inicial
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);
  startServer();

  // Verificar si el rol 'admin' existe, si no, crearlo
  adminRole = await Role.findOne({ name: 'admin' });
  if (!adminRole) {
    adminRole = await Role.create({ name: 'admin' });
  }

  // Crear un usuario admin para obtener token
  adminRole = await Role.findOne({ name: 'admin' });
  const adminUser = await User.create({
    username: 'admin',
    email: 'admin@example.com',
    password: await User.encryptPassword('password123'),
    roles: [adminRole._id],
  });

  const res = await request.post('/auth/login').send({
    email: 'admin@example.com',
    password: 'password123',
  });

  token = res.body.token;
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

// Limpieza después de cada test
afterEach(async () => {
  await mongoose.connection.db.dropDatabase();
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
  let user;

  beforeEach(async () => {
    user = await User.create({
      username: 'deleteuser',
      email: 'delete@example.com',
      password: await User.encryptPassword('password123'),
    });
  });

  it('should delete a user', async () => {
    const res = await request
      .delete(`/api/user/${user._id}`)
      .set('x-access-token', token);

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'User deleted successfully');
  });

  it('should return 403 without token', async () => {
    const res = await request.delete(`/api/user/${user._id}`);
    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message', 'No token provided');
  });
});

describe('PATCH /user', () => {
  let user;

  beforeEach(async () => {
    user = await User.create({
      username: 'updateuser',
      email: 'update@example.com',
      password: await User.encryptPassword('password123'),
    });
  });

  it('should update a user', async () => {
    const res = await request
      .patch('/api/user')
      .set('x-access-token', token)
      .send({
        id: user._id,
        username: 'updateduser',
        email: 'updated@example.com',
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message', 'User updated successfully');
  });

  it('should return 403 without token', async () => {
    const res = await request.patch('/user').send({
      id: user._id,
      username: 'unauthorizedupdate',
    });

    expect(res.statusCode).toBe(403);
    expect(res.body).toHaveProperty('message', 'No token provided');
  });
});
