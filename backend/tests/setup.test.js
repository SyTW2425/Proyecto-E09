import { createRoles, createAdminUser } from '../src/libs/initialSetup.js';
import Role from '../src/models/role.js';
import User from '../src/models/user.js';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer;
jest.spyOn(console, 'log').mockImplementation();

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Role and User Creation', () => {
  beforeEach(async () => {
    await Role.deleteMany({});
    await User.deleteMany({});
  });

  test('createRoles should create default roles if they do not exist', async () => {
    // Call the function to create roles
    await createRoles();

    const roles = await Role.find();
    expect(roles).toHaveLength(3); // Should create 3 roles
    expect(roles.map(role => role.name)).toEqual(['user', 'moderator', 'admin']);
  });

  test('createRoles should not create roles if they already exist', async () => {
    // Create roles manually
    await new Role({ name: 'user' }).save();
    await new Role({ name: 'moderator' }).save();
    await new Role({ name: 'admin' }).save();

    await createRoles();

    const roles = await Role.find();
    expect(roles).toHaveLength(3); // Should not create more roles
  });

  test('createAdminUser should create an admin user if not exists', async () => {
    await createRoles(); // Create roles first
    await createAdminUser();

    const user = await User.findOne({ email: 'kaladin@bendito' });
    expect(user).not.toBeNull();
    expect(user.username).toBe('kaladin');
    expect(user.email).toBe('kaladin@bendito');
    expect(user.roles).toHaveLength(1);

    const adminRole = await Role.findOne({ name: 'admin' });
    expect(user.roles[0].toString()).toBe(adminRole._id.toString());
  });

  test('createAdminUser should not create admin user if it already exists', async () => {
    // Create role and user manually
    const adminRole = await new Role({ name: 'admin' }).save();
    const user = new User({
      username: 'kaladin',
      email: 'kaladin@bendito',
      password: 'hashedPassword',
      roles: [adminRole._id]
    });
    await user.save();

    // Call the function that should not create the user
    await createAdminUser();

    const users = await User.find();
    expect(users).toHaveLength(1); // It should not create more users
  });
});
