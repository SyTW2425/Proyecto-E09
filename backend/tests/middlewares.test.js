import mongoose from 'mongoose';
import supertest from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app, startServer } from '../src/app.js';
import User from '../src/models/user.js';
import Role from '../src/models/role.js';

const request = supertest(app);

let mongoServer;
let validToken; // Token para autenticación
let adminRole;
let moderatorRole;
let adminUser;
let moderatorUser;
jest.spyOn(console, 'error').mockImplementation();


// Configuración inicial
beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  await mongoose.connect(uri);

  // Crear los roles 'admin' y 'moderator'
  adminRole = await Role.create({ name: 'admin' });
  moderatorRole = await Role.create({ name: 'moderator' });

  // Crear un usuario admin para obtener token
  adminUser = await User.create({
    username: 'admin',
    email: 'admin@example.com',
    password: await User.encryptPassword('password123'),
    roles: [adminRole._id],
  });

  // Crear un usuario moderador
  moderatorUser = await User.create({
    username: 'moderator',
    email: 'moderator@example.com',
    password: await User.encryptPassword('password123'),
    roles: [moderatorRole._id],
  });

  // Crear un usuario regular
  const regularUser = await User.create({
    username: 'user',
    email: 'user@example.com',
    password: await User.encryptPassword('password123'),
    roles: [],
  });

  // Iniciar sesión con el usuario admin y obtener el token
  const res = await request.post('/auth/login').send({
    email: 'admin@example.com',
    password: 'password123',
  });
  validToken = res.body.token;

  startServer();
});

afterAll(async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongoServer.stop();
});

describe('verifyToken', () => {
  it('should return 403 if no token is provided', async () => {
    const response = await request
      .post('/api/user')
      .set('x-access-token', ''); // No token provided
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('No token provided');
  });

  it('should return 401 if token is invalid', async () => {
    const response = await request
      .post('/api/user')
      .set('x-access-token', 'invalidToken'); // Invalid token
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('should call next() if token is valid', async () => {
    const response = await request
      .post('/api/user')
      .set('x-access-token', validToken).send({
        username: 'testuser',
        email: 'testuser@example.com',
        password: await User.encryptPassword('password123'),
      });
    expect(response.status).toBe(201);
  });
});

describe('isAdmin', () => {
  it('should return 403 if no token is provided', async () => {
    const response = await request
      .patch('/api/user')
      .set('x-access-token', ''); // No token provided
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('No token provided');
  });

  it('should return 401 if token is invalid', async () => {
    const response = await request
      .patch('/api/user')
      .set('x-access-token', 'invalidToken'); // Invalid token
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('should return 403 if user is not an admin', async () => {
    const regularUserRes = await request.post('/auth/login').send({
      email: 'user@example.com',
      password: 'password123',
    });

    const response = await request
      .patch('/api/user')
      .set('x-access-token', regularUserRes.body.token);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('Require moderator role');
  });

  it('should call next() if user is admin', async () => {
    const response = await request
      .get('/api/user')
      .set('x-access-token', validToken); // Valid token for admin

    expect(response.status).toBe(200);
  });
});

describe('isModerator', () => {
  it('should return 403 if no token is provided', async () => {
    const response = await request
      .post('/api/user')
      .set('x-access-token', ''); // No token provided
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('No token provided');
  });

  it('should return 401 if token is invalid', async () => {
    const response = await request
      .post('/api/user')
      .set('x-access-token', 'invalidToken'); // Invalid token
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('should call next() if user is a moderator', async () => {
    const moderatorRes = await request.post('/auth/login').send({
      email: 'moderator@example.com',
      password: 'password123',
    });

    const response = await request
      .get('/api/user/user')
      .set('x-access-token', moderatorRes.body.token);

    expect(response.status).toBe(200);
  });
});

describe('isMySelf', () => {
  it('should return 403 if no token is provided', async () => {
    const response = await request
      .post('/api/user')
      .set('x-access-token', ''); // No token provided
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('No token provided');
  });

  it('should return 401 if token is invalid', async () => {
    const response = await request
      .post('/api/user')
      .set('x-access-token', 'invalidToken'); // Invalid token
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('should return 403 if username does not match the logged-in user', async () => {
    const regularUserRes = await request.post('/auth/login').send({
      email: 'user@example.com',
      password: 'password123',
    });
    const response = await request
      .get('/api/user/moderator')
      .set('x-access-token', regularUserRes.body.token);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('You can only access your own information');
  });

  it('should call next() if username matches the logged-in user', async () => {
    const regularUserRes = await request.post('/auth/login').send({
      email: 'user@example.com',
      password: 'password123',
    });
    const response = await request
      .get('/api/user/user') // Username matches the logged-in user (user)
      .set('x-access-token', regularUserRes.body.token);

    expect(response.status).toBe(200);
  });
});

describe('isMySelforModerator', () => {
  it('should return 403 if no token is provided', async () => {
    const response = await request
      .get('/api/user/moderator')
      .set('x-access-token', ''); // No token provided
    expect(response.status).toBe(403);
    expect(response.body.message).toBe('No token provided');
  });

  it('should return 401 if token is invalid', async () => {
    const response = await request
      .get('/api/user/moderator')
      .set('x-access-token', 'invalidToken'); // Invalid token
    expect(response.status).toBe(401);
    expect(response.body.message).toBe('Unauthorized');
  });

  it('should return 403 if user is not himself or moderator', async () => {
    const regularUserRes = await request.post('/auth/login').send({
      email: 'testuser@example.com',
      password: 'password123',
    });
    const response = await request
      .get('/api/user/user')
      .set('x-access-token', regularUserRes.body.token);

    expect(response.status).toBe(403);
    expect(response.body.message).toBe('You can only access your own information');
  });

  it('should call next() if user is himself or moderator', async () => {
    const regularUserRes = await request.post('/auth/login').send({
      email: 'user@example.com',
      password: 'password123',
    });
    const response = await request
      .get('/api/user/user')
      .set('x-access-token', regularUserRes.body.token);
    expect(response.status).toBe(200);

    const moderatorRes = await request.post('/auth/login').send({
      email: 'moderator@example.com',
      password: 'password123',
    });
    const response2 = await request
      .get('/api/user/user')
      .set('x-access-token', moderatorRes.body.token);
    expect(response2.status).toBe(200);
  });
});
