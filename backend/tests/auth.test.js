import mongoose from 'mongoose';
import supertest from 'supertest';
import { app, startServer } from '../src/app.js';  // Asegúrate de que app esté exportado correctamente

const request = supertest(app);
let id;
let registerToken;
let loginToken;

afterAll(async () => {
	process.emit('SIGINT');
});

describe('POST /auth/register', () => {
  it('should pass', () => {  // test test of the test when testing the test
    expect(2 + 2).toBe(4);
  });

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
	it('should get a User by username', async () => {
		const res = await request.get('/api/user?username=testuser');
		console.log(res.body);
		id = res.body._id;
		console.log("id is " + id);
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

	it('Defenitely should not get a User by password', async () => {
		const res = await request.get('/api/user?password=password');
		console.log(res.body);
		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty('message');
	});
});

describe('POST /auth/login', () => {
	it('should login a User', async () => {
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

	it ('should not login a User with invalid credentials', async () => {
		const res = await request
			.post('/auth/login')
			.send({
				email: 'example@test.com',
				password: 'wrongpassword',
			});
		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty('message');
	});

	it ('should not login a User that does not exist', async () => {
		const res = await request
			.post('/auth/login')
			.send({
				email: 'john@doe.com',
				password: 'password',
			});
		expect(res.statusCode).toBe(400);
		expect(res.body).toHaveProperty('message');
	});


	it ('should not login a User with missing credentials', async () => {
		const res = await request
			.post('/auth/login')
			.send({
				email: 'example@test.com',
				password: '',
			});
		expect(res.statusCode).toBe(401);
		expect(res.body).toHaveProperty('message');
	});
});

//describe('PATCH /api/user', () => {
//	it('should update a User by id', async () => {
//		const res = await request.patch(`/api/user?id=${id}`)
//			.set('token', loginToken)
//			.send({
//				username: 'testuser2',
//			});
//		expect(res.statusCode).toBe(200);
//		expect(res.body).toHaveProperty('message');
//		console.log(res.body);
//	});
//});


describe('DELETE /api/user/:id', () => {
	it('should delete a User', async () => {
		const res = await request.delete(`/api/user/${id}`);
		expect(res.statusCode).toBe(200);
		expect(res.body).toHaveProperty('message');
	});

	it('should not delete a User that does not exist', async () => {
		const res = await request.delete(`/api/user/${id}`);
		expect(res.statusCode).toBe(404);
		expect(res.body).toHaveProperty('message');
	});
});
				