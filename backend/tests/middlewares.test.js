import { app } from '../src/app.js'; // Import the app instance
import request from 'supertest';
import jwt from 'jsonwebtoken';
import { User } from '../src/models/user.js';
import { Role } from '../src/models/role.js';

jest.mock('../src/models/user.js');
jest.mock('../src/models/role.js');

describe('Authentication Middleware', () => {
	let validToken;
	let invalidToken = 'invalidToken';

	beforeAll(() => {
		process.env.SECRET = '97e5a9c49e059d0aec06be4148c21b6ff8e9c68e9ec8ee78d230d8778a4443b4addd51147071fc80a315262ce08c77841f3c14942a37e524e35a670cc442c15ec3363d09749dc0411007156420b5b2a50163dd7e3f49c31df5748bcb027372b7df77db0732f52488b737aeb07f7d152a7d7db6ca3a8b5a3e373b9c41758c6c22e4c98e45775b0c87abbde5d0d0233438d6aea69e53fcb10d5fe267c638bb43d896301e5e1b764a6e87334fe4462873e7c3d35a7c9c463f7f1cd97142e9f7165d4df0009cc6cc10739b907a6af21142b625a000c7bc06d47ad8ddab0a264b2bfee2353ac0962a87254b1e2b9c539264ae260b5b0255dc8488d270c4d7d9467e8b';
		validToken = jwt.sign({ id: 'testUserId' }, process.env.SECRET, { expiresIn: '1h' });
	});

	beforeEach(() => {
		jest.spyOn(console, 'error').mockImplementation(() => {});
	});

	afterEach(() => {
		jest.clearAllMocks();
		console.error.mockRestore();
	});

	describe('verifyToken', () => {
		it('should return 403 if no token is provided', async () => {
			const response = await request(app)
				.post('/api/user')
				.set('x-access-token', ''); // No token provided
			expect(response.status).toBe(403);
			expect(response.body.message).toBe('No token provided');
		});

		it('should return 401 if token is invalid', async () => {
			const response = await request(app)
				.post('/api/user')
				.set('x-access-token', invalidToken); // Invalid token
			expect(response.status).toBe(401);
			expect(response.body.message).toBe('Unauthorized');
			expect(console.error).toHaveBeenCalledWith('jwt malformed');
		});
	});

	describe('isAdmin', () => {
		it('should return 403 if no token is provided', async () => {
			const response = await request(app)
				.patch('/api/user')
				.set('x-access-token', '');
			expect(response.status).toBe(403);
			expect(response.body.message).toBe('No token provided');
		});

		it('should return 401 if token is invalid', async () => {
			const response = await request(app)
				.patch('/api/user')
				.set('x-access-token', invalidToken);
			expect(response.status).toBe(401);
			expect(response.body.message).toBe('Unauthorized');
			expect(console.error).toHaveBeenCalledWith('jwt malformed');
		});

		
	});

	describe('isModerator', () => {
		it('should return 403 if no token is provided', async () => {
			const response = await request(app)
				.post('/api/user')
				.set('x-access-token', '');
			expect(response.status).toBe(403);
			expect(response.body.message).toBe('No token provided');
		});

		it('should return 401 if token is invalid', async () => {
			const response = await request(app)
				.post('/api/user')
				.set('x-access-token', invalidToken);
			expect(response.status).toBe(401);
			expect(response.body.message).toBe('Unauthorized');
			expect(console.error).toHaveBeenCalledWith('jwt malformed');
		});
	});
});
