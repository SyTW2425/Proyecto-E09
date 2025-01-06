import Role from '../models/role.js';
import User from '../models/user.js'

/**
 * Create the roles in the database
 */
export const createRoles = async () => {
  // Verify if there are roles in the database
  const count = await Role.estimatedDocumentCount();
  if (count > 0) return;
  const values = await Promise.all([
    new Role({ name: 'user' }).save(),
    new Role({ name: 'moderator' }).save(),
    new Role({ name: 'admin' }).save()
  ]);
}

/**
 * Create the admin user in the database
 */
export const createAdminUser = async () => {
  const user = await User.findOne({ email: 'kaladin@bendito' });
  if (!user) {
    console.log('Admin user not found, creating one...');
    const adminRole = await Role.findOne({ name: 'admin' });
    const newUser = new User({
      username: 'kaladin',
      email: 'kaladin@bendito',
      password: await User.encryptPassword('triste'),
      roles: [adminRole._id]
    });
    await newUser.save();
  }
}