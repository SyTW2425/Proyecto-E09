import mongoose from 'mongoose';
import supertest from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import { app, startServer } from '../src/app.js'; // Asegúrate de exportar `app` correctamente desde tu app
import User from '../src/models/user.js'; // Asegúrate de exportar el modelo `User` correctamente
import Role from '../src/models/role.js'; // Asegúrate de exportar el modelo `User` correctamente

const request = supertest(app);
let mongoServer;
let id;
let registerToken;
let loginToken;

// Configurar MongoDB Memory Server
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

// Limpiar la base de datos después de cada prueba
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

  it('should not create a duplicate User', async () => {
    await User.create({ username: 'testuser', email: 'example@test.com', password: 'password' });
    const res = await request
      .post('/auth/register')
      .send({
        username: 'testuser',
        email: 'example@test.com',
        password: 'password',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('should not create a duplicate User with different username but same email', async () => {
    await User.create({ username: 'testuserX', email: 'example@test.com', password: 'password' });
    const res = await request
      .post('/auth/register')
      .send({
        username: 'testuserX',
        email: 'example@test.com',
        password: 'password',
      });
    expect(res.statusCode).toBe(400);
    expect(res.body).toHaveProperty('message');
  });

  it('should not create a duplicate User with different email but same username', async () => {
    await User.create({ username: 'testuser', email: 'example15@test.com', password: 'password' });
    const res = await request
      .post('/auth/register')
      .send({
        username: 'testuser',
        email: 'example15@test.com',
        password: 'password',
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
});

describe('GET /api/user', () => {
  beforeEach(async () => {
    const user = await User.create({ username: 'testuser', email: 'example@test.com', password: 'password' });
    id = user._id;
  });

  it('should get a User by username', async () => {
    const res = await request.get('/api/user?username=testuser');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('username');
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('_id');
  });

  it('should get a User by email', async () => {
    const res = await request.get('/api/user?email=example@test.com');
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('username');
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('_id');
  });

  it('should get a User by id', async () => {
    const res = await request.get(`/api/user?id=${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('username');
    expect(res.body).toHaveProperty('email');
    expect(res.body).toHaveProperty('_id');
  });

  it('should not get a User by password', async () => {
    const res = await request.get('/api/user?password=password');
    expect(res.statusCode).toBe(404);
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

/*describe('DELETE /api/user/:id', () => {
  beforeEach(async () => {
    const user = await User.create({ username: 'testuser', email: 'example@test.com', password: 'password' });
    id = user._id;
  });

  it('should delete a User', async () => {
    const res = await request.delete(`/api/user/${id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('message');
  });

  it('should not delete a User that does not exist', async () => {
		const res = await request.delete(`/api/user/${new mongoose.Types.ObjectId()}`);
    expect(res.statusCode).toBe(404);
    expect(res.body).toHaveProperty('message');
  });
});*/